import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  User
} from 'firebase/auth';
import { auth } from './firebase';

let confirmationResult: ConfirmationResult | null = null;
let recaptchaVerifier: RecaptchaVerifier | null = null;

export const firebasePhoneAuth = {
  getRecaptchaVerifier: (containerId: string = 'recaptcha-container'): RecaptchaVerifier => {
    if (typeof window === 'undefined') {
      throw new Error('Window not defined');
    }

    if (!recaptchaVerifier) {
      recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: () => {
          console.log('✅ Firebase reCAPTCHA solved for SMS verification');
        },
        'expired-callback': () => {
          console.warn('⚠️ Firebase reCAPTCHA expired. Resetting verifier.');
          if (recaptchaVerifier) {
            try { recaptchaVerifier.clear(); } catch {}
            recaptchaVerifier = null;
          }
        }
      });
    }
    return recaptchaVerifier;
  },

  sendRealSmsOtp: async (phoneNumber: string, containerId: string = 'recaptcha-container'): Promise<{ success: boolean; isRealSms: boolean; error?: string }> => {
    const cleanPhone = phoneNumber.replace(/\D/g, '').slice(-10);
    const fullPhone = `+91${cleanPhone}`;

    try {
      const appVerifier = firebasePhoneAuth.getRecaptchaVerifier(containerId);
      console.log(`📡 [FIREBASE AUTH SMS] Triggering Google SMS Gateway for ${fullPhone}...`);
      confirmationResult = await signInWithPhoneNumber(auth, fullPhone, appVerifier);
      console.log('📲 [FIREBASE AUTH SMS] SMS dispatched via Google Telecom Gateway!');
      return { success: true, isRealSms: true };
    } catch (err: any) {
      console.warn('Firebase Phone Auth notice:', err);
      // If Firebase Phone Auth has domain or quota restrictions, return details
      return {
        success: false,
        isRealSms: false,
        error: err.code === 'auth/invalid-app-credential' || err.code === 'auth/captcha-check-failed'
          ? 'Firebase Phone Auth is active. If your domain is not yet whitelisted in Firebase Console, test codes or authorized SMS numbers can be used.'
          : err.message || 'Firebase SMS delivery notice'
      };
    }
  },

  verifyRealSmsOtp: async (otpCode: string): Promise<User | null> => {
    if (!confirmationResult) {
      return null;
    }
    try {
      const userCredential = await confirmationResult.confirm(otpCode);
      return userCredential.user;
    } catch (err: any) {
      console.warn('Firebase OTP confirmation error:', err);
      throw err;
    }
  },

  clearVerifier: () => {
    if (recaptchaVerifier) {
      try { recaptchaVerifier.clear(); } catch {}
      recaptchaVerifier = null;
    }
    confirmationResult = null;
  }
};
