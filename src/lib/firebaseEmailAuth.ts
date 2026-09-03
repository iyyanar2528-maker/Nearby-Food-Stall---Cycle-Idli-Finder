import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  updateProfile,
  User
} from 'firebase/auth';
import { auth } from './firebase';

const googleProvider = new GoogleAuthProvider();
// Request standard profile & email scopes
googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.setCustomParameters({ prompt: 'select_account' });

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  isOperationNotAllowed?: boolean;
}

function mapAuthError(err: any): string {
  const code = err?.code || '';
  const msg = err?.message || '';

  if (code === 'auth/operation-not-allowed' || msg.includes('PASSWORD_LOGIN_DISABLED') || msg.includes('OPERATION_NOT_ALLOWED')) {
    return 'Authentication provider is not enabled in Firebase Console. Please visit Firebase Console -> Authentication -> Sign-in method, click "Email/Password" (or "Google"), and turn ON the toggle.';
  }
  if (code === 'auth/unauthorized-domain') {
    const domain = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    return `Domain "${domain}" is not authorized. Please add "${domain}" in Firebase Console -> Authentication -> Settings -> Authorized domains.`;
  }
  if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
    return 'Invalid email or password. Please verify your credentials or create a new account.';
  }
  if (code === 'auth/email-already-in-use') {
    return 'This email address is already registered. Please click "Sign In" instead.';
  }
  if (code === 'auth/weak-password') {
    return 'Password is too weak. Please use at least 6 characters.';
  }
  if (code === 'auth/invalid-email') {
    return 'Please enter a valid email address (e.g. yourname@gmail.com).';
  }
  if (code === 'auth/popup-closed-by-user') {
    return 'Google Sign-In popup was closed before completing.';
  }
  if (code === 'auth/cancelled-popup-request') {
    return 'Google Sign-In popup was cancelled. Please try again.';
  }
  if (code === 'auth/too-many-requests') {
    return 'Too many failed attempts. Please wait a moment or reset your password.';
  }
  if (code === 'auth/network-request-failed') {
    return 'Network connection error. Please check your internet connection.';
  }

  return msg || 'Authentication failed. Please check your credentials and try again.';
}

export const firebaseEmailAuth = {
  /**
   * Sign In with Email (Gmail) and Password
   */
  signIn: async (
    email: string,
    pass: string
  ): Promise<AuthResult> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (!cleanEmail) {
      return { success: false, error: 'Please enter your email address.' };
    }
    if (!cleanPass) {
      return { success: false, error: 'Please enter your password.' };
    }

    try {
      console.log(`🔑 [FIREBASE AUTH] Signing in with email: ${cleanEmail}...`);
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
      console.log('✅ [FIREBASE AUTH] Sign in successful:', userCredential.user.uid);
      return {
        success: true,
        user: userCredential.user
      };
    } catch (err: any) {
      console.warn('Firebase Email Sign In error:', err);
      const isOpNotAllowed = err?.code === 'auth/operation-not-allowed' || err?.message?.includes('PASSWORD_LOGIN_DISABLED') || err?.message?.includes('OPERATION_NOT_ALLOWED');
      const friendlyError = mapAuthError(err);
      return {
        success: false,
        error: friendlyError,
        isOperationNotAllowed: isOpNotAllowed
      };
    }
  },

  /**
   * Create New Account with Email (Gmail) and Password
   */
  signUp: async (
    email: string,
    pass: string,
    displayName?: string
  ): Promise<AuthResult> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (!cleanEmail) {
      return { success: false, error: 'Please enter your email address.' };
    }
    if (!cleanPass || cleanPass.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    try {
      console.log(`📝 [FIREBASE AUTH] Registering new user with email: ${cleanEmail}...`);
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);
      
      if (displayName && userCredential.user) {
        try {
          await updateProfile(userCredential.user, { displayName: displayName.trim() });
        } catch (nameErr) {
          console.warn('Could not update display name:', nameErr);
        }
      }

      console.log('✅ [FIREBASE AUTH] Registration successful:', userCredential.user.uid);
      return {
        success: true,
        user: userCredential.user
      };
    } catch (err: any) {
      console.warn('Firebase Email Sign Up error:', err);
      const isOpNotAllowed = err?.code === 'auth/operation-not-allowed' || err?.message?.includes('PASSWORD_LOGIN_DISABLED') || err?.message?.includes('OPERATION_NOT_ALLOWED');
      const friendlyError = mapAuthError(err);
      return {
        success: false,
        error: friendlyError,
        isOperationNotAllowed: isOpNotAllowed
      };
    }
  },

  /**
   * Sign In with Google Popup (One-click Gmail authentication)
   */
  signInWithGoogle: async (): Promise<AuthResult> => {
    try {
      console.log('🌐 [FIREBASE AUTH] Opening Google Sign-In popup...');
      const result = await signInWithPopup(auth, googleProvider);
      console.log('✅ [FIREBASE AUTH] Google Sign-In successful:', result.user.email);
      return {
        success: true,
        user: result.user
      };
    } catch (err: any) {
      console.warn('Firebase Google Sign-In error:', err);
      const isOpNotAllowed = err?.code === 'auth/operation-not-allowed';
      return {
        success: false,
        error: mapAuthError(err),
        isOperationNotAllowed: isOpNotAllowed
      };
    }
  },

  /**
   * Send Password Reset Email via Firebase
   */
  sendPasswordReset: async (email: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, error: 'Please enter your email address to reset password.' };
    }

    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: mapAuthError(err)
      };
    }
  },

  /**
   * Sign Out
   */
  signOut: async (): Promise<{ success: boolean; error?: string }> => {
    try {
      await firebaseSignOut(auth);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
};
