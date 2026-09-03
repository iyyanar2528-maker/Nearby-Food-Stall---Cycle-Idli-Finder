import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from './firebase';
import {
  FoodSpot,
  UserProfile,
  UserSubscription,
  ProximityAlertData
} from '../types';

export const firebaseSync = {
  // --- Check Firebase Connection Status ---
  testConnection: async (): Promise<boolean> => {
    try {
      const pingDoc = doc(db, '_health', 'ping');
      await setDoc(pingDoc, { timestamp: serverTimestamp() }, { merge: true });
      return true;
    } catch (e) {
      console.warn('Firebase Firestore test notice:', e);
      return false;
    }
  },

  // --- Real-Time Phone OTP & Cloud Dispatch ---
  sendRealtimeOtp: async (phone: string, otpCode: string, metadata?: any) => {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    try {
      const otpRef = doc(db, 'phone_otps', cleanPhone);
      await setDoc(
        otpRef,
        {
          phone: `+91 ${cleanPhone}`,
          cleanPhone,
          otp: otpCode,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
          isVerified: false,
          attempts: 0,
          metadata: metadata || {},
          createdAt: serverTimestamp(),
          dispatchedAt: new Date().toISOString()
        },
        { merge: true }
      );
      console.log(`🔥 [FIREBASE CLOUD OTP] Real-time OTP written to Firestore document phone_otps/${cleanPhone}`);
    } catch (e) {
      console.warn('Firebase OTP push fallback:', e);
    }
  },

  listenToPhoneOtp: (phone: string, onUpdate: (data: any) => void) => {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (!cleanPhone) return () => {};
    try {
      const otpRef = doc(db, 'phone_otps', cleanPhone);
      return onSnapshot(
        otpRef,
        (snap) => {
          if (snap.exists()) {
            onUpdate(snap.data());
          }
        },
        (error) => {
          console.warn('Firebase OTP listener fallback:', error);
        }
      );
    } catch (e) {
      console.warn('Firebase OTP listener setup error:', e);
      return () => {};
    }
  },

  // --- Stalls & Live GPS Broadcasting ---
  listenToLiveStalls: (onUpdate: (updatedSpots: Map<string, Partial<FoodSpot>>) => void) => {
    try {
      const stallsCol = collection(db, 'stalls');
      return onSnapshot(
        stallsCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const updatesMap = new Map<string, Partial<FoodSpot>>();
            snapshot.forEach((docSnap) => {
              const data = docSnap.data();
              updatesMap.set(docSnap.id, {
                distanceMeters: data.distanceMeters,
                isMovingNow: data.isMovingNow,
                speedKmh: data.speedKmh,
                stockCount: data.stockCount,
                isOpenNow: data.isOpenNow
              });
            });
            onUpdate(updatesMap);
          }
        },
        (error) => {
          console.warn('Firestore live stalls listener fallback:', error);
        }
      );
    } catch (e) {
      console.warn('Firestore subscription error:', e);
      return () => {};
    }
  },

  broadcastStallLocation: async (spotId: string, data: { distanceMeters: number; isMovingNow: boolean; speedKmh?: number; stockCount?: any }) => {
    try {
      const stallRef = doc(db, 'stalls', spotId);
      await setDoc(
        stallRef,
        {
          ...data,
          lastUpdated: new Date().toISOString(),
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('Firestore broadcast fallback:', e);
    }
  },

  // --- Proximity Horn / Bell Alert Sync ---
  listenToProximityAlerts: (onAlert: (alert: ProximityAlertData) => void) => {
    try {
      const alertsCol = collection(db, 'proximityAlerts');
      const q = query(alertsCol, orderBy('timestamp', 'desc'), limit(1));
      return onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const docSnap = snapshot.docs[0];
            const data = docSnap.data();
            // Trigger if less than 60 seconds old
            if (Date.now() - (data.timestamp || 0) < 60000) {
              onAlert({
                id: docSnap.id,
                stallId: data.stallId,
                stallName: data.stallName,
                vendorName: data.vendorName || 'Cycle Vendor',
                vendorPhone: data.vendorPhone || '+91 98401 23456',
                stallType: data.stallType || 'moving_cycle',
                speciality: data.speciality || 'Fresh Steaming Hot Idli & Vada',
                price: data.price || 30,
                distanceMeters: data.distanceMeters || 65,
                cityArea: data.cityArea || 'Near You',
                stateRegion: data.stateRegion || 'all',
                image: data.image || 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc',
                timestamp: data.timestamp || Date.now()
              });
            }
          }
        },
        (error) => {
          console.warn('Firestore alerts listener notice:', error);
        }
      );
    } catch (e) {
      console.warn('Firestore alerts subscription error:', e);
      return () => {};
    }
  },

  triggerProximityBell: async (spot: FoodSpot) => {
    try {
      const alertRef = doc(db, 'proximityAlerts', `alert_${spot.id}_${Date.now()}`);
      await setDoc(alertRef, {
        stallId: spot.id,
        stallName: spot.name,
        vendorName: spot.vendorName,
        vendorPhone: spot.vendorPhone,
        stallType: spot.stallType,
        speciality: `${spot.topDeal.item} (₹${spot.topDeal.price})`,
        price: spot.topDeal.price,
        distanceMeters: spot.distanceMeters,
        cityArea: spot.cityArea,
        stateRegion: spot.stateRegion,
        image: spot.image,
        timestamp: Date.now(),
        createdAt: serverTimestamp()
      });
    } catch (e) {
      console.warn('Firestore bell alert write fallback:', e);
    }
  },

  // --- Users Sync ---
  syncUserProfile: async (user: UserProfile) => {
    try {
      const userRef = doc(db, 'users', user.id);
      await setDoc(userRef, {
        ...user,
        syncedAt: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn('Firestore user profile sync fallback:', e);
    }
  },

  // --- Subscriptions Sync ---
  syncSubscription: async (sub: UserSubscription) => {
    try {
      const subRef = doc(db, 'subscriptions', sub.id);
      await setDoc(subRef, {
        ...sub,
        syncedAt: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn('Firestore subscription sync fallback:', e);
    }
  }
};
