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

    // Always clear existing verifier before re-instantiating to prevent "reCAPTCHA already rendered" error
    if (recaptchaVerifier) {
      try {
        recaptchaVerifier.clear();
      } catch (e) {
        console.warn('Notice clearing recaptcha:', e);
      }
      recaptchaVerifier = null;
    }

    recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        console.log('✅ Google reCAPTCHA verified for real SMS dispatch');
      },
      'expired-callback': () => {
        console.warn('⚠️ Google reCAPTCHA expired. Resetting verifier.');
        if (recaptchaVerifier) {
          try {
            recaptchaVerifier.clear();
          } catch {}
          recaptchaVerifier = null;
        }
      }
    });

    return recaptchaVerifier;
  },

  sendRealSmsOtp: async (
    phoneNumber: string,
    containerId: string = 'recaptcha-container'
  ): Promise<{ success: boolean; confirmationResult?: ConfirmationResult; error?: string }> => {
    const cleanPhone = phoneNumber.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      return { success: false, error: 'Please enter a valid 10-digit mobile number' };
    }
    const fullPhone = `+91${cleanPhone}`;

    try {
      const appVerifier = firebasePhoneAuth.getRecaptchaVerifier(containerId);
      console.log(`📡 [FIREBASE AUTH SMS] Triggering Google Telecom Gateway for ${fullPhone}...`);
      confirmationResult = await signInWithPhoneNumber(auth, fullPhone, appVerifier);
      console.log('📲 [FIREBASE AUTH SMS] Real SMS dispatched via Google Telecom Gateway!');
      return { success: true, confirmationResult };
    } catch (err: any) {
      console.error('Firebase Phone Auth error:', err);
      let errorDetail = err.message || 'Failed to dispatch SMS to your phone.';

      if (err.code === 'auth/unauthorized-domain') {
        errorDetail = `Domain "${window.location.hostname}" is not authorized in Firebase Console. Please add "${window.location.hostname}" to Firebase Console -> Authentication -> Settings -> Authorized Domains.`;
      } else if (err.code === 'auth/operation-not-allowed') {
        errorDetail = 'Phone authentication is not enabled. Please enable "Phone" provider in Firebase Console -> Authentication -> Sign-in method.';
      } else if (err.code === 'auth/invalid-phone-number') {
        errorDetail = 'Invalid phone number. Please enter a valid 10-digit Indian mobile number.';
      } else if (err.code === 'auth/too-many-requests') {
        errorDetail = 'Too many requests sent to this number. Please wait a few minutes before requesting a new code.';
      } else if (err.code === 'auth/captcha-check-failed') {
        errorDetail = 'Google reCAPTCHA verification failed. Please refresh the page and try again.';
      } else if (err.code === 'auth/network-request-failed') {
        errorDetail = 'Network connection error. Please check your internet connection.';
      }

      return {
        success: false,
        error: errorDetail
      };
    }
  },

  verifyRealSmsOtp: async (otpCode: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    if (!confirmationResult) {
      return {
        success: false,
        error: 'No active SMS session. Please click "Change Number" or "Resend" to get a fresh SMS code.'
      };
    }

    try {
      const userCredential = await confirmationResult.confirm(otpCode);
      return {
        success: true,
        user: userCredential.user
      };
    } catch (err: any) {
      console.error('Firebase OTP confirmation error:', err);
      let msg = 'Invalid SMS verification code. Please check your SMS inbox and re-enter.';
      if (err.code === 'auth/invalid-verification-code') {
        msg = 'Incorrect 6-digit code. Please enter the exact code received on your mobile phone via SMS.';
      } else if (err.code === 'auth/code-expired') {
        msg = 'This SMS verification code has expired. Please click "Resend Code" to receive a new one.';
      }
      return {
        success: false,
        error: msg
      };
    }
  },

  clearVerifier: () => {
    if (recaptchaVerifier) {
      try {
        recaptchaVerifier.clear();
      } catch {}
      recaptchaVerifier = null;
    }
    confirmationResult = null;
  }
};
