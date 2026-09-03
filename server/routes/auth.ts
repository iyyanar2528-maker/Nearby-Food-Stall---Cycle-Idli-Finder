import { Router, Request, Response } from 'express';
import { store, SEED_USERS } from '../data/store';
import { database } from '../db/database';
import { smsGateway } from '../services/smsGateway';
import { emailGateway } from '../services/emailGateway';
import { UserProfile, UserRole } from '../types';

export const authRouter = Router();

// 1. Send OTP (Generates, stores in SQLite DB, and dispatches via telecom SMS gateway)
authRouter.post('/send-otp', async (req: Request, res: Response) => {
  const { phone, name, role, stateRegion, language, businessName, businessAddress, fssaiNumber, stallId } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Mobile number is required' });
  }

  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  if (cleanPhone.length !== 10) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit Indian mobile number' });
  }

  try {
    const otpRecord = database.createOtpRecord(cleanPhone, name, role, {
      stateRegion,
      language,
      businessName,
      businessAddress,
      fssaiNumber,
      stallId
    });

    // Dispatch SMS to cellular carrier / SMS network
    const smsResult = await smsGateway.sendOtpSms(cleanPhone, otpRecord.otpCode);

    return res.json({
      success: true,
      message: `OTP verification code dispatched to +91 ${cleanPhone}`,
      otp: otpRecord.otpCode,
      phone: cleanPhone,
      expiresAt: otpRecord.expiresAt,
      smsGatewayStatus: smsResult.isCarrierDelivered ? 'DELIVERED' : 'SENT',
      smsProvider: smsResult.provider,
      smsBody: `[Street Radar] Your verification code is ${otpRecord.otpCode}. Valid for 10 minutes. Do not share.`
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to generate OTP' });
  }
});

// 2. Resend OTP
authRouter.post('/resend-otp', async (req: Request, res: Response) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Mobile number is required' });
  }

  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  try {
    const otpRecord = database.createOtpRecord(cleanPhone);
    const smsResult = await smsGateway.sendOtpSms(cleanPhone, otpRecord.otpCode);

    return res.json({
      success: true,
      message: `Fresh OTP code dispatched to +91 ${cleanPhone}`,
      otp: otpRecord.otpCode,
      phone: cleanPhone,
      expiresAt: otpRecord.expiresAt,
      smsGatewayStatus: smsResult.isCarrierDelivered ? 'DELIVERED' : 'SENT',
      smsProvider: smsResult.provider,
      smsBody: `[Street Radar] Your fresh verification code is ${otpRecord.otpCode}. Valid for 10 minutes.`
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to resend OTP' });
  }
});

// 3. Test SMS Gateway Connection & Status
authRouter.get('/sms-gateway-status', (req: Request, res: Response) => {
  const hasFast2Sms = Boolean(process.env.FAST2SMS_API_KEY || process.env.SMS_GATEWAY_KEY);
  const hasTwoFactor = Boolean(process.env.TWOFACTOR_API_KEY);
  const hasTwilio = Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);

  return res.json({
    status: 'ACTIVE',
    activeProviders: {
      Fast2SMS: hasFast2Sms ? 'CONFIGURED' : 'READY_FOR_KEY',
      TwoFactor: hasTwoFactor ? 'CONFIGURED' : 'READY_FOR_KEY',
      Twilio: hasTwilio ? 'CONFIGURED' : 'READY_FOR_KEY',
      LocalGateway: 'ONLINE (TD-RADAR Live Simulation)'
    },
    defaultCarrier: hasFast2Sms ? 'Fast2SMS' : hasTwoFactor ? '2Factor' : hasTwilio ? 'Twilio' : 'TD-RADAR Telecom Gateway',
    timestamp: new Date().toISOString()
  });
});

// 4. Verify OTP & Authenticate against Database
authRouter.post('/verify-otp', (req: Request, res: Response) => {
  const { phone, otp, name, role, stateRegion, language, businessName, businessAddress, fssaiNumber, stallId } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ error: 'Mobile number and OTP code are required' });
  }

  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  const inputOtp = otp.toString().trim();

  // Validate OTP in SQLite database
  const verification = database.verifyOtpRecord(cleanPhone, inputOtp);
  if (!verification.success) {
    return res.status(400).json({ error: verification.error || 'Invalid OTP code' });
  }

  const record = verification.record || {};
  const metadata = record.metadata || {};
  const userRole: UserRole = (role || record.role || metadata.role || 'customer') as UserRole;
  const userName: string = (name || record.name || metadata.name || (userRole === 'moving_stall_owner' ? 'Cycle Idli Vendor' : userRole === 'shop_owner' ? 'Street Shopkeeper' : 'Food Explorer')).trim();

  let existingUser = store.getUserByPhone(cleanPhone);

  if (!existingUser) {
    const avatar = userRole === 'moving_stall_owner' ? '🚲' : userRole === 'shop_owner' ? '🏪' : '😋';
    const newUser: UserProfile = {
      id: `user_${cleanPhone}`,
      name: userName,
      phone: cleanPhone,
      role: userRole,
      language: language || metadata.language || 'en',
      stateRegion: stateRegion || metadata.stateRegion || 'all',
      avatar,
      stallId: stallId || metadata.stallId || (userRole === 'moving_stall_owner' ? 'spot-cycle-1' : userRole === 'shop_owner' ? 'spot-mh-1' : undefined),
      businessName: (businessName || metadata.businessName)?.trim(),
      businessAddress: (businessAddress || metadata.businessAddress)?.trim(),
      fssaiNumber: (fssaiNumber || metadata.fssaiNumber)?.trim(),
      createdAt: new Date().toISOString()
    };
    existingUser = store.saveUser(newUser);
  } else {
    // Update profile with fresh inputs
    if (userName) existingUser.name = userName;
    if (role || record.role) existingUser.role = userRole;
    if (language || metadata.language) existingUser.language = language || metadata.language;
    if (stateRegion || metadata.stateRegion) existingUser.stateRegion = stateRegion || metadata.stateRegion;
    if (businessName || metadata.businessName) existingUser.businessName = (businessName || metadata.businessName).trim();
    if (businessAddress || metadata.businessAddress) existingUser.businessAddress = (businessAddress || metadata.businessAddress).trim();
    if (fssaiNumber || metadata.fssaiNumber) existingUser.fssaiNumber = (fssaiNumber || metadata.fssaiNumber).trim();
    if (stallId || metadata.stallId) existingUser.stallId = stallId || metadata.stallId;
    existingUser = store.saveUser(existingUser);
  }

  return res.json({
    success: true,
    message: 'Mobile number verified and login successful!',
    user: existingUser,
    token: `jwt_auth_${existingUser.id}_${Date.now()}`
  });
});

// 5. Quick 1-Click Demo Login
authRouter.post('/demo-login', (req: Request, res: Response) => {
  const { role } = req.body;
  let demoUser = SEED_USERS.find(u => u.role === role);
  if (!demoUser) {
    demoUser = SEED_USERS[0];
  }

  // Ensure demo user is saved in DB
  store.saveUser(demoUser);

  return res.json({
    success: true,
    message: `Logged in as Demo ${demoUser.role}`,
    user: demoUser,
    token: `jwt_auth_${demoUser.id}`
  });
});

// 6. Get Current User Profile
authRouter.get('/me/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  const user = store.getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.json({
    success: true,
    user
  });
});

// 7. Send Real Email OTP via Gmail / SMTP
authRouter.post('/send-email-otp', async (req: Request, res: Response) => {
  const { email, name, role } = req.body;
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email address is required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Send real email via configured SMTP / Gmail
  const dispatchResult = await emailGateway.sendOtpEmail(cleanEmail, otp, name);

  return res.json({
    success: true,
    email: cleanEmail,
    otp,
    isDelivered: dispatchResult.isDelivered,
    provider: dispatchResult.provider,
    error: dispatchResult.error,
    message: dispatchResult.isDelivered
      ? `Real email containing verification OTP sent to ${cleanEmail}`
      : `Email dispatch skipped: ${dispatchResult.error || 'Configure EMAIL_USER and EMAIL_PASS in .env'}`
  });
});

// 8. Email Gateway Status
authRouter.get('/email-gateway-status', (req: Request, res: Response) => {
  return res.json({
    isConfigured: emailGateway.isConfigured(),
    provider: (process.env.EMAIL_USER || process.env.GMAIL_USER) ? 'Gmail SMTP' : 'Unconfigured'
  });
});

