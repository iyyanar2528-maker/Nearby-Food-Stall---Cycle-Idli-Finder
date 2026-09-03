import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Phone,
  User,
  ShieldCheck,
  Languages,
  Store,
  CheckCircle2,
  ArrowRight,
  KeyRound,
  RefreshCw,
  MessageSquare,
  Sparkles,
  Flame
} from 'lucide-react';
import { LanguageCode, StateRegion, UserProfile, UserRole } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { sound } from '../utils/audioFeedback';
import { api } from '../lib/api';
import { firebaseSync } from '../lib/firebaseSync';
import { firebasePhoneAuth } from '../lib/firebasePhoneAuth';
import confetti from 'canvas-confetti';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLoginSuccess: (user: UserProfile) => void;
  currentLang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  initialRole?: UserRole;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  currentLang,
  onLanguageChange,
  initialRole = 'customer'
}) => {
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [role, setRole] = useState<UserRole>(initialRole);
  
  // Clean empty inputs - No default numbers
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [stateRegion, setStateRegion] = useState<StateRegion>('all');
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [fssaiNumber, setFssaiNumber] = useState('');
  
  // OTP state - Completely blank, no default or pre-filled code shown
  const [otp, setOtp] = useState('');
  const [smsBody, setSmsBody] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [otpSentSuccess, setOtpSentSuccess] = useState(false);

  // 30-Second Resend Countdown
  const [resendTimer, setResendTimer] = useState(0);

  const t = TRANSLATIONS[currentLang];

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setOtpSentSuccess(false);
      if (currentUser) {
        setName(currentUser.name || '');
        setPhone(currentUser.phone || '');
        setRole(currentUser.role || 'customer');
        setStateRegion(currentUser.stateRegion || 'all');
        setBusinessName(currentUser.businessName || '');
        setBusinessAddress(currentUser.businessAddress || '');
        setFssaiNumber(currentUser.fssaiNumber || '');
      } else {
        // Fresh blank start
        setName('');
        setPhone('');
        setOtp('');
        setRole(initialRole);
        setStep('details');
      }
    }
  }, [isOpen, currentUser, initialRole]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  if (!isOpen) return null;

  // 1. Send Real OTP to Mobile Number via Google Firebase SMS Gateway
  const handleSendOtp = async (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg(
        currentLang === 'ta'
          ? 'தயவுசெய்து உங்கள் பெயரை உள்ளிடவும்'
          : currentLang === 'hi'
          ? 'कृपया अपना नाम दर्ज करें'
          : 'Please enter your full name'
      );
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setErrorMsg(
        currentLang === 'ta'
          ? 'சரியான 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்'
          : currentLang === 'hi'
          ? 'कृपया वैध 10 अंकों का मोबाइल नंबर दर्ज करें'
          : 'Please enter a valid 10-digit mobile number'
      );
      return;
    }

    sound.playClick();
    setIsLoading(true);

    try {
      // Dispatch real SMS via Google Firebase Phone Auth
      console.log(`📱 Triggering Google Firebase real SMS to +91 ${cleanPhone}...`);
      const phoneRes = await firebasePhoneAuth.sendRealSmsOtp(cleanPhone, 'recaptcha-container');

      if (!phoneRes.success) {
        throw new Error(phoneRes.error || 'Could not send SMS. Please verify your mobile number.');
      }

      // Also notify backend / firestore if online
      api.auth.sendOtp({
        phone: cleanPhone,
        name: name.trim(),
        role,
        language: currentLang,
        stateRegion,
        businessName: businessName.trim() || undefined,
        businessAddress: businessAddress.trim() || undefined,
        fssaiNumber: fssaiNumber.trim() || undefined,
        stallId: role === 'moving_stall_owner' ? 'spot-cycle-1' : role === 'shop_owner' ? 'spot-mh-1' : undefined
      }).catch(() => {});

      setOtp('');
      setOtpSentSuccess(true);
      setResendTimer(60);
      setStep('otp');
      sound.playSuccess();
    } catch (err: any) {
      console.error('Send OTP Error:', err);
      setErrorMsg(err.message || 'Failed to dispatch real SMS OTP. Please check your network.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Resend Real OTP handler
  const handleResendOtp = async (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (resendTimer > 0 || isLoading) return;

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (!cleanPhone) return;

    sound.playClick();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const phoneRes = await firebasePhoneAuth.sendRealSmsOtp(cleanPhone, 'recaptcha-container');
      if (!phoneRes.success) {
        throw new Error(phoneRes.error || 'Failed to resend SMS.');
      }

      setOtp('');
      setOtpSentSuccess(true);
      setResendTimer(60);
      sound.playSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resend SMS.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Verify Real SMS Code with Google Firebase Telecom Gateway
  const handleVerifyOtp = async (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setErrorMsg('');

    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6) {
      setErrorMsg(
        currentLang === 'ta'
          ? 'தயவுசெய்து உங்கள் மொபைலில் பெறப்பட்ட 6 இலக்க OTP-ஐ உள்ளிடவும்'
          : currentLang === 'hi'
          ? 'कृपया अपने मोबाइल पर प्राप्त 6 अंकों का OTP दर्ज करें'
          : 'Please enter the 6-digit OTP code received on your mobile phone'
      );
      return;
    }

    setIsLoading(true);
    sound.playClick();

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);

    try {
      // 1. Confirm code with real Google Firebase SMS confirmation result
      const verifyResult = await firebasePhoneAuth.verifyRealSmsOtp(cleanOtp);
      if (!verifyResult.success) {
        throw new Error(verifyResult.error || 'Invalid OTP code. Please check your SMS and re-enter.');
      }

      const realUser = verifyResult.user;
      const userProfile: UserProfile = {
        id: realUser?.uid || `user-${Date.now()}`,
        name: name.trim() || 'Food Lover',
        phone: cleanPhone,
        role,
        language: currentLang,
        stateRegion,
        businessName: businessName.trim() || undefined,
        businessAddress: businessAddress.trim() || undefined,
        fssaiNumber: fssaiNumber.trim() || undefined,
        stallId: role === 'moving_stall_owner' ? 'spot-cycle-1' : role === 'shop_owner' ? 'spot-mh-1' : undefined,
        createdAt: new Date().toISOString()
      };

      localStorage.setItem('budget_eats_user', JSON.stringify(userProfile));
      firebaseSync.syncUserProfile(userProfile);

      setIsLoading(false);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      sound.playSuccess();
      onLoginSuccess(userProfile);
      onClose();
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Invalid SMS verification code. Please check your SMS inbox and re-enter.');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg bg-[#141414] border border-[#2E2E32] rounded-3xl p-5 sm:p-6 shadow-2xl relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#262626]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#E2FF3B]/15 border border-[#E2FF3B]/30 flex items-center justify-center text-[#E2FF3B]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#F0F0F0] tracking-tight flex items-center gap-2">
                <span>{step === 'details' ? t.loginTitle : t.otpTitle}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#FF9500]/15 text-[#FF9500] border border-[#FF9500]/30 font-mono font-bold flex items-center gap-1">
                  <Flame className="w-2.5 h-2.5 fill-[#FF9500]" /> Firebase Realtime
                </span>
              </h2>
              <p className="text-xs text-[#8E8E93] font-mono">
                {step === 'details' ? t.loginSubtitle : t.otpSubtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onClose();
            }}
            className="text-xs font-mono text-[#8E8E93] hover:text-white px-2.5 py-1 rounded-lg bg-[#1C1C1E] border border-[#2E2E32] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Welcome Tagline Banner */}
        <div className="my-3 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-[#E2FF3B]/15 via-[#F59E0B]/10 to-transparent border border-[#E2FF3B]/30 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🍲</span>
            <div>
              <p className="text-xs font-bold text-white">Welcome to Street Radar!</p>
              <p className="text-[11px] font-medium text-[#E2FF3B]">Eat first, thank me later ✨</p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-black/40 text-slate-300 border border-white/10 shrink-0">
            Quick OTP
          </span>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center justify-between py-3 border-b border-[#262626]">
          <div className="flex items-center gap-1.5 text-xs text-[#8E8E93] font-mono">
            <Languages className="w-3.5 h-3.5 text-[#E2FF3B]" />
            <span>{t.selectLanguage}:</span>
          </div>
          <div className="flex items-center gap-1">
            {(['en', 'ta', 'hi'] as LanguageCode[]).map((l) => (
              <button
                type="button"
                key={l}
                onClick={(e) => {
                  e.preventDefault();
                  sound.playClick();
                  onLanguageChange(l);
                }}
                className={`text-[11px] font-mono px-2.5 py-0.5 rounded-lg border transition-all ${
                  currentLang === l
                    ? 'bg-[#E2FF3B] text-[#0A0A0A] border-[#E2FF3B] font-bold'
                    : 'bg-[#1C1C1E] text-[#8E8E93] border-[#2E2E32] hover:text-[#F0F0F0]'
                }`}
              >
                {l === 'en' ? 'English' : l === 'ta' ? 'தமிழ்' : 'हिंदी'}
              </button>
            ))}
          </div>
        </div>

        {/* Real Mobile SMS Notice */}
        <div className="py-2.5 px-3 rounded-2xl bg-[#1C1C1E] border border-[#2E2E32] flex items-center justify-between text-xs font-mono text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#30D158] animate-pulse shrink-0" />
            <span className="text-[11px]">Real Cellular SMS Gateway (+91 India)</span>
          </div>
          <span className="text-[10px] text-[#E2FF3B] font-bold uppercase tracking-wider bg-[#E2FF3B]/10 px-2 py-0.5 rounded border border-[#E2FF3B]/20">
            Real OTP
          </span>
        </div>

        {/* Step 1: User Mobile Number & Details */}
        {step === 'details' && (
          <div className="pt-4 space-y-4">
            {/* Role Selection Tabs */}
            <div>
              <label className="block text-xs font-bold text-[#8E8E93] uppercase font-mono tracking-wider mb-2">
                {t.roleLabel}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setRole('customer');
                  }}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    role === 'customer'
                      ? 'bg-[#E2FF3B]/10 border-[#E2FF3B] text-[#E2FF3B]'
                      : 'bg-[#1C1C1E] border-[#2E2E32] text-[#8E8E93] hover:text-white'
                  }`}
                >
                  <span className="text-xl">😋</span>
                  <span className="text-xs font-bold">{t.roleCustomer}</span>
                  <span className="text-[9px] text-[#8E8E93] font-mono">Radar & Passes</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setRole('moving_stall_owner');
                  }}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    role === 'moving_stall_owner'
                      ? 'bg-[#E2FF3B]/10 border-[#E2FF3B] text-[#E2FF3B]'
                      : 'bg-[#1C1C1E] border-[#2E2E32] text-[#8E8E93] hover:text-white'
                  }`}
                >
                  <span className="text-xl">🚲</span>
                  <span className="text-xs font-bold">{t.roleMovingVendor}</span>
                  <span className="text-[9px] text-[#8E8E93] font-mono">GPS Radar & Horn</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setRole('shop_owner');
                  }}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    role === 'shop_owner'
                      ? 'bg-[#E2FF3B]/10 border-[#E2FF3B] text-[#E2FF3B]'
                      : 'bg-[#1C1C1E] border-[#2E2E32] text-[#8E8E93] hover:text-white'
                  }`}
                >
                  <span className="text-xl">🏪</span>
                  <span className="text-xs font-bold">{t.roleShopOwner}</span>
                  <span className="text-[9px] text-[#8E8E93] font-mono">Menu & Analytics</span>
                </button>
              </div>
            </div>

            {/* Name Input */}
            <div>
              <label className="block text-xs font-bold text-[#8E8E93] uppercase font-mono tracking-wider mb-1.5">
                {t.nameLabel} *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8E8E93] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendOtp(e);
                  }}
                  placeholder="Enter your name"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#1C1C1E] border border-[#2E2E32] text-sm text-[#F0F0F0] placeholder-[#555] focus:outline-none focus:border-[#E2FF3B]"
                />
              </div>
            </div>

            {/* Mobile Number Input */}
            <div>
              <label className="block text-xs font-bold text-[#8E8E93] uppercase font-mono tracking-wider mb-1.5">
                {t.phoneLabel} *
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center gap-1.5 text-xs font-mono font-bold text-[#E2FF3B]">
                  <Phone className="w-3.5 h-3.5" />
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendOtp(e);
                  }}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full pl-16 pr-4 py-2.5 rounded-2xl bg-[#1C1C1E] border border-[#2E2E32] text-sm font-mono text-[#F0F0F0] placeholder-[#555] focus:outline-none focus:border-[#E2FF3B]"
                />
              </div>
            </div>

            {/* Vendor / Shopkeeper Additional Fields */}
            {(role === 'shop_owner' || role === 'moving_stall_owner') && (
              <div className="p-3.5 rounded-2xl bg-[#1C1C1E] border border-[#2E2E32] space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#E2FF3B] font-mono uppercase">
                  <Store className="w-3.5 h-3.5" />
                  <span>{role === 'moving_stall_owner' ? 'Cycle Cart Name & Route' : 'Shop Name & Location'}</span>
                </div>

                <div>
                  <label className="block text-[11px] text-[#8E8E93] font-mono mb-1">
                    {t.businessNameLabel}
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder={role === 'moving_stall_owner' ? 'e.g., Muthu Anna Idli Cart' : 'e.g., Aaba Vada Pav Center'}
                    className="w-full px-3 py-2 rounded-xl bg-[#141414] border border-[#262626] text-xs text-[#F0F0F0] focus:outline-none focus:border-[#E2FF3B]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#8E8E93] font-mono mb-1">
                    {t.businessAddressLabel}
                  </label>
                  <input
                    type="text"
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    placeholder="e.g., T. Nagar / Dadar West"
                    className="w-full px-3 py-2 rounded-xl bg-[#141414] border border-[#262626] text-xs text-[#F0F0F0] focus:outline-none focus:border-[#E2FF3B]"
                  />
                </div>

                {role === 'shop_owner' && (
                  <div>
                    <label className="block text-[11px] text-[#8E8E93] font-mono mb-1 flex items-center justify-between">
                      <span>{t.fssaiLabel}</span>
                      <span className="text-[9px] text-[#555]">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={fssaiNumber}
                      onChange={(e) => setFssaiNumber(e.target.value)}
                      placeholder="e.g., FSSAI-21524098000123"
                      className="w-full px-3 py-2 rounded-xl bg-[#141414] border border-[#262626] text-xs text-[#F0F0F0] focus:outline-none focus:border-[#E2FF3B]"
                    />
                  </div>
                )}
              </div>
            )}

            {/* State Region */}
            <div>
              <label className="block text-xs font-bold text-[#8E8E93] uppercase font-mono tracking-wider mb-1.5">
                {t.stateFilter}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setStateRegion('all');
                  }}
                  className={`py-2 px-2 rounded-xl border text-center font-mono text-xs transition-all ${
                    stateRegion === 'all'
                      ? 'bg-[#E2FF3B]/10 border-[#E2FF3B] text-[#E2FF3B] font-bold'
                      : 'bg-[#1C1C1E] border-[#2E2E32] text-[#8E8E93]'
                  }`}
                >
                  {t.stateAll}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setStateRegion('maharashtra');
                  }}
                  className={`py-2 px-2 rounded-xl border text-center font-mono text-xs transition-all ${
                    stateRegion === 'maharashtra'
                      ? 'bg-[#E2FF3B]/10 border-[#E2FF3B] text-[#E2FF3B] font-bold'
                      : 'bg-[#1C1C1E] border-[#2E2E32] text-[#8E8E93]'
                  }`}
                >
                  MH (Mumbai)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setStateRegion('tamil_nadu');
                  }}
                  className={`py-2 px-2 rounded-xl border text-center font-mono text-xs transition-all ${
                    stateRegion === 'tamil_nadu'
                      ? 'bg-[#E2FF3B]/10 border-[#E2FF3B] text-[#E2FF3B] font-bold'
                      : 'bg-[#1C1C1E] border-[#2E2E32] text-[#8E8E93]'
                  }`}
                >
                  TN (Chennai)
                </button>
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs font-mono text-[#FF3B30] bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-xl p-2.5">
                ⚠️ {errorMsg}
              </p>
            )}

            {/* Send OTP Button */}
            <button
              type="button"
              disabled={isLoading}
              onClick={handleSendOtp}
              className="w-full py-3 rounded-2xl bg-[#E2FF3B] text-[#0A0A0A] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#d4f22e] transition-all shadow-lg shadow-[#E2FF3B]/20 active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Send OTP via SMS</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 2: OTP Entry & Verification */}
        {step === 'otp' && (
          <div className="pt-4 space-y-4">
            {/* Clean Status Alert - No Code Shown on Screen */}
            <div className="p-3.5 rounded-2xl bg-[#1C1C1E] border border-[#30D158]/30 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#30D158]/15 text-[#30D158] flex items-center justify-center shrink-0 mt-0.5">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-mono font-bold text-[#30D158]">
                  Verification Code Dispatched via SMS
                </div>
                <p className="text-[11px] text-[#A1A1AA] font-mono mt-0.5 leading-snug">
                  A 6-digit OTP code has been sent to your mobile <b className="text-white">+91 {phone}</b>. Please check your phone's SMS app and enter the code below.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#1C1C1E] border border-[#2E2E32] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#8E8E93] uppercase block">
                  Verifying Mobile Number:
                </span>
                <span className="text-xs font-mono font-bold text-[#F0F0F0]">
                  +91 {phone} ({name})
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  sound.playClick();
                  setStep('details');
                }}
                className="text-[11px] font-mono text-[#E2FF3B] hover:underline"
              >
                Change Number
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8E8E93] uppercase font-mono tracking-wider mb-1.5">
                Enter 6-Digit OTP *
              </label>

              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#8E8E93] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleVerifyOtp(e);
                  }}
                  placeholder="------"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#1C1C1E] border border-[#2E2E32] text-center tracking-[0.5em] font-mono text-2xl font-black text-[#E2FF3B] focus:outline-none focus:border-[#E2FF3B]"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-between mt-2 text-xs font-mono">
                <span className="text-[#8E8E93]">
                  {resendTimer > 0 ? (
                    <span>⏳ Resend code in <b className="text-[#E2FF3B]">{resendTimer}s</b></span>
                  ) : (
                    <span className="text-[#30D158]">Ready to resend</span>
                  )}
                </span>

                <button
                  type="button"
                  disabled={resendTimer > 0 || isLoading}
                  onClick={handleResendOtp}
                  className="text-xs font-mono text-[#E2FF3B] hover:underline disabled:opacity-40 disabled:hover:no-underline flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Resend OTP</span>
                </button>
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs font-mono text-[#FF3B30] bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-xl p-2.5">
                ⚠️ {errorMsg}
              </p>
            )}

            {/* Verify & Submit Button */}
            <button
              type="button"
              disabled={isLoading || otp.length !== 6}
              onClick={handleVerifyOtp}
              className="w-full py-3 rounded-2xl bg-[#E2FF3B] text-[#0A0A0A] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#d4f22e] transition-all shadow-lg shadow-[#E2FF3B]/20 active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify & Submit OTP</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Invisible Google Firebase reCAPTCHA container for authentic SMS delivery */}
        <div id="recaptcha-container" className="flex justify-center" />
      </motion.div>
    </div>
  );
};
