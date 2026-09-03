import {
  UserProfile,
  FoodSpot,
  SubscriptionPlan,
  UserSubscription,
  CustomerOrder,
  LiveBroadcastState,
  UserRole
} from '../types';
import { INITIAL_FOOD_SPOTS } from '../data/foodSpots';
import { SEED_PLANS } from '../data/subscriptionPlans';

const API_BASE = '/api';

// In-memory OTP store for static / offline demo fallback
const simulatedOtps = new Map<string, { code: string; expiresAt: number }>();

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    }
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

// Helper to get / set LocalStorage items safely
function getLocalItem<T>(key: string, defaultVal: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setLocalItem(key: string, val: any) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }
}

export const api = {
  // --- Auth Endpoints ---
  auth: {
    sendOtp: async (data: {
      phone: string;
      name?: string;
      role?: UserRole;
      language?: string;
      stateRegion?: string;
      businessName?: string;
      businessAddress?: string;
      fssaiNumber?: string;
      stallId?: string;
    }) => {
      try {
        return await request<{
          success: boolean;
          message: string;
          otp: string;
          phone: string;
          expiresAt: string;
          smsGatewayStatus?: string;
          smsBody?: string;
        }>('/auth/send-otp', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      } catch (err) {
        console.warn('Backend API unavailable. Using simulated OTP for static deployment.', err);
        // Fallback for GitHub Pages / static hosting: generate a realistic 6-digit OTP
        const cleanPhone = data.phone.replace(/\D/g, '').slice(-10);
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        simulatedOtps.set(cleanPhone, { code, expiresAt: Date.now() + 10 * 60 * 1000 });

        return {
          success: true,
          message: 'OTP sent successfully (Simulated mode on GitHub Pages)',
          otp: code,
          phone: cleanPhone,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
          smsGatewayStatus: 'Simulated SMS Gateway (Carrier delivered)',
          smsBody: `[Street Radar] Your verification code is ${code}. Valid for 10 minutes.`
        };
      }
    },

    resendOtp: async (phone: string) => {
      try {
        return await request<{
          success: boolean;
          message: string;
          otp: string;
          phone: string;
          expiresAt: string;
          smsGatewayStatus?: string;
          smsBody?: string;
        }>('/auth/resend-otp', {
          method: 'POST',
          body: JSON.stringify({ phone })
        });
      } catch (err) {
        console.warn('Backend API unavailable. Using simulated OTP resend.', err);
        const cleanPhone = phone.replace(/\D/g, '').slice(-10);
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        simulatedOtps.set(cleanPhone, { code, expiresAt: Date.now() + 10 * 60 * 1000 });

        return {
          success: true,
          message: 'OTP resent successfully',
          otp: code,
          phone: cleanPhone,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
          smsGatewayStatus: 'Simulated SMS Gateway',
          smsBody: `[Street Radar] Your fresh verification code is ${code}. Valid for 10 minutes.`
        };
      }
    },

    verifyOtp: async (data: {
      phone: string;
      otp: string;
      name?: string;
      role?: UserRole;
      language?: string;
      stateRegion?: string;
      businessName?: string;
      businessAddress?: string;
      fssaiNumber?: string;
      stallId?: string;
    }) => {
      try {
        return await request<{ success: boolean; user: UserProfile; token: string }>('/auth/verify-otp', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      } catch (err) {
        console.warn('Backend API unavailable. Using simulated OTP verification.', err);
        const cleanPhone = data.phone.replace(/\D/g, '').slice(-10);
        const stored = simulatedOtps.get(cleanPhone);

        // Accept if matches generated OTP or demo pass '123456' or any 6-digit number in static preview
        const isValid = !stored || stored.code === data.otp || data.otp === '123456' || data.otp.length === 6;

        if (!isValid) {
          throw new Error('Invalid OTP code. Please enter the 6-digit code shown.');
        }

        const user: UserProfile = {
          id: `user-${Date.now()}`,
          name: data.name?.trim() || 'Food Lover',
          phone: cleanPhone,
          role: data.role || 'customer',
          language: (data.language as any) || 'en',
          stateRegion: (data.stateRegion as any) || 'all',
          businessName: data.businessName?.trim(),
          businessAddress: data.businessAddress?.trim(),
          fssaiNumber: data.fssaiNumber?.trim(),
          stallId: data.stallId || (data.role === 'moving_stall_owner' ? 'spot-cycle-1' : data.role === 'shop_owner' ? 'spot-mh-1' : undefined),
          createdAt: new Date().toISOString()
        };

        return {
          success: true,
          user,
          token: `simulated-token-${Date.now()}`
        };
      }
    },

    demoLogin: async (role: UserRole) => {
      try {
        return await request<{ success: boolean; user: UserProfile; token: string }>('/auth/demo-login', {
          method: 'POST',
          body: JSON.stringify({ role })
        });
      } catch (err) {
        console.warn('Backend API unavailable. Using simulated demo login for role:', role, err);
        const demoProfiles: Record<UserRole, UserProfile> = {
          customer: {
            id: 'demo-customer-1',
            name: 'Arun Kumar',
            phone: '9876543210',
            role: 'customer',
            language: 'en',
            stateRegion: 'tamil_nadu',
            createdAt: new Date().toISOString()
          },
          moving_stall_owner: {
            id: 'demo-vendor-1',
            name: 'Muthu Krishnan',
            phone: '9840123456',
            role: 'moving_stall_owner',
            language: 'ta',
            stateRegion: 'tamil_nadu',
            businessName: 'Muthu Anna Cycle Idli & Hot Vadai',
            stallId: 'spot-cycle-1',
            createdAt: new Date().toISOString()
          },
          shop_owner: {
            id: 'demo-shop-1',
            name: 'Aaba Shinde',
            phone: '9820145678',
            role: 'shop_owner',
            language: 'hi',
            stateRegion: 'maharashtra',
            businessName: 'Aaba Chulivarcha Vada Pav & Masala Chai',
            stallId: 'spot-mh-1',
            fssaiNumber: '11521034000123',
            createdAt: new Date().toISOString()
          }
        };

        const user = demoProfiles[role] || demoProfiles.customer;
        return {
          success: true,
          user,
          token: `demo-token-${role}-${Date.now()}`
        };
      }
    },

    getProfile: async (userId: string) => {
      try {
        return await request<{ success: boolean; user: UserProfile }>(`/auth/me/${userId}`);
      } catch (err) {
        const stored = getLocalItem<UserProfile | null>('budget_eats_user', null);
        if (stored && stored.id === userId) {
          return { success: true, user: stored };
        }
        return {
          success: true,
          user: {
            id: userId,
            name: 'Street Explorer',
            phone: '9876543210',
            role: 'customer',
            language: 'en',
            stateRegion: 'all',
            createdAt: new Date().toISOString()
          }
        };
      }
    }
  },

  // --- Food Spots Endpoints ---
  spots: {
    getAll: async (params?: { region?: string; stallType?: string; maxDistance?: number; search?: string }) => {
      try {
        const query = new URLSearchParams();
        if (params?.region) query.append('region', params.region);
        if (params?.stallType) query.append('stallType', params.stallType);
        if (params?.maxDistance) query.append('maxDistance', String(params.maxDistance));
        if (params?.search) query.append('search', params.search);

        const qs = query.toString() ? `?${query.toString()}` : '';
        return await request<{ success: boolean; count: number; spots: FoodSpot[] }>(`/spots${qs}`);
      } catch (err) {
        // Fallback to static food spots list
        let spots = [...INITIAL_FOOD_SPOTS];
        if (params?.region && params.region !== 'all') {
          spots = spots.filter(s => s.stateRegion === params.region);
        }
        if (params?.stallType && params.stallType !== 'all') {
          spots = spots.filter(s => s.stallType === params.stallType);
        }
        if (params?.search) {
          const q = params.search.toLowerCase();
          spots = spots.filter(s =>
            s.name.toLowerCase().includes(q) ||
            s.cityArea.toLowerCase().includes(q) ||
            s.category.toLowerCase().includes(q)
          );
        }
        return {
          success: true,
          count: spots.length,
          spots
        };
      }
    },

    getById: async (id: string) => {
      try {
        return await request<{ success: boolean; spot: FoodSpot }>(`/spots/${id}`);
      } catch (err) {
        const spot = INITIAL_FOOD_SPOTS.find(s => s.id === id) || INITIAL_FOOD_SPOTS[0];
        return { success: true, spot };
      }
    },

    updateLocation: async (id: string, distanceMeters: number, isMoving: boolean, speedKmh?: number) => {
      try {
        return await request<{ success: boolean; spot: FoodSpot }>(`/spots/${id}/location`, {
          method: 'PATCH',
          body: JSON.stringify({ distanceMeters, isMoving, speedKmh })
        });
      } catch (err) {
        const spot = INITIAL_FOOD_SPOTS.find(s => s.id === id) || INITIAL_FOOD_SPOTS[0];
        const updated = {
          ...spot,
          distanceMeters,
          isMovingNow: isMoving,
          speedKmh: speedKmh ?? spot.speedKmh
        };
        return { success: true, spot: updated };
      }
    },

    updateStock: async (id: string, stock: { [key: string]: number }) => {
      try {
        return await request<{ success: boolean; spot: FoodSpot }>(`/spots/${id}/stock`, {
          method: 'PATCH',
          body: JSON.stringify({ stock })
        });
      } catch (err) {
        const spot = INITIAL_FOOD_SPOTS.find(s => s.id === id) || INITIAL_FOOD_SPOTS[0];
        const updated = { ...spot, stockCount: { ...(spot.stockCount || {}), ...stock } };
        return { success: true, spot: updated };
      }
    },

    updateMenu: async (id: string, menu: any[]) => {
      try {
        return await request<{ success: boolean; spot: FoodSpot }>(`/spots/${id}/menu`, {
          method: 'PUT',
          body: JSON.stringify({ menu })
        });
      } catch (err) {
        const spot = INITIAL_FOOD_SPOTS.find(s => s.id === id) || INITIAL_FOOD_SPOTS[0];
        return { success: true, spot: { ...spot, menu } };
      }
    }
  },

  // --- Broadcast & Proximity Alerts ---
  broadcast: {
    getMovingCycles: async () => {
      try {
        return await request<{ success: boolean; count: number; broadcasts: LiveBroadcastState[] }>('/broadcast/moving-cycles');
      } catch (err) {
        return {
          success: true,
          count: 1,
          broadcasts: [
            {
              spotId: 'spot-cycle-1',
              spotName: 'Muthu Anna Cycle Idli & Hot Vadai',
              vendorName: 'Muthu Krishnan',
              distanceMeters: 65,
              isMoving: true,
              speedKmh: 6,
              lastBroadcast: new Date().toISOString()
            }
          ]
        };
      }
    },

    broadcastLiveLocation: async (spotId: string, distanceMeters: number, isMoving: boolean, speedKmh?: number) => {
      try {
        return await request<{ success: boolean; spot: FoodSpot }>('/broadcast/live-location', {
          method: 'POST',
          body: JSON.stringify({ spotId, distanceMeters, isMoving, speedKmh })
        });
      } catch (err) {
        const spot = INITIAL_FOOD_SPOTS.find(s => s.id === spotId) || INITIAL_FOOD_SPOTS[0];
        return {
          success: true,
          spot: { ...spot, distanceMeters, isMovingNow: isMoving, speedKmh: speedKmh ?? 6 }
        };
      }
    },

    triggerBell: async (spotId: string) => {
      try {
        return await request<{ success: boolean; message: string; timestamp: string }>('/broadcast/trigger-bell', {
          method: 'POST',
          body: JSON.stringify({ spotId })
        });
      } catch (err) {
        return {
          success: true,
          message: 'Bicycle bell sound triggered successfully (Simulated broadcast)',
          timestamp: new Date().toISOString()
        };
      }
    }
  },

  // --- Subscriptions & Passes ---
  subscriptions: {
    getPlans: async (role?: string) => {
      try {
        const qs = role ? `?role=${role}` : '';
        return await request<{ success: boolean; plans: SubscriptionPlan[] }>(`/subscriptions/plans${qs}`);
      } catch (err) {
        let plans = [...SEED_PLANS];
        if (role) {
          plans = plans.filter(
            p =>
              p.targetRole === role ||
              (role === 'moving_stall_owner' && p.targetRole === 'vendor') ||
              (role === 'shop_owner' && p.targetRole === 'shop')
          );
        }
        return { success: true, plans };
      }
    },

    create: async (data: {
      userId: string;
      userName?: string;
      userPhone?: string;
      planId: string;
      paymentMethod?: string;
      selectedSpotId?: string;
      selectedSpotName?: string;
      specialInstructions?: string;
    }) => {
      try {
        return await request<{ success: boolean; message: string; subscription: UserSubscription }>('/subscriptions/create', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      } catch (err) {
        const plan = SEED_PLANS.find(p => p.id === data.planId) || SEED_PLANS[0];
        const daysValid = plan.period === 'weekly' ? 7 : plan.period === '15days' ? 15 : 30;
        const now = new Date();
        const expiry = new Date(now.getTime() + daysValid * 24 * 60 * 60 * 1000);

        const newSub: UserSubscription = {
          id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          userId: data.userId,
          userName: data.userName || 'Food Explorer',
          userPhone: data.userPhone || '9876543210',
          planId: plan.id,
          planTitle: plan.title,
          targetRole: plan.targetRole,
          amount: plan.price,
          status: 'active',
          startDate: now.toISOString(),
          expiryDate: expiry.toISOString(),
          deliveriesRemaining: plan.deliveriesCount || daysValid,
          paymentMethod: (data.paymentMethod as any) || 'upi_gpay',
          paymentId: `TXN_${Date.now()}_UPI`,
          selectedSpotId: data.selectedSpotId || (plan.targetRole === 'customer' ? 'spot-cycle-1' : undefined),
          selectedSpotName: data.selectedSpotName || (plan.targetRole === 'customer' ? 'Muthu Anna Cycle Idli' : undefined),
          specialInstructions: data.specialInstructions?.trim(),
          qrPassCode: `PASS-${Date.now().toString().slice(-6)}`
        };

        const existing = getLocalItem<UserSubscription[]>('budget_eats_subscriptions', []);
        setLocalItem('budget_eats_subscriptions', [newSub, ...existing]);

        return {
          success: true,
          message: 'Subscription pass activated successfully!',
          subscription: newSub
        };
      }
    },

    getMySubscriptions: async (userId: string) => {
      try {
        return await request<{ success: boolean; count: number; subscriptions: UserSubscription[] }>(`/subscriptions/my-subscriptions/${userId}`);
      } catch (err) {
        const list = getLocalItem<UserSubscription[]>('budget_eats_subscriptions', []).filter(s => s.userId === userId);
        return {
          success: true,
          count: list.length,
          subscriptions: list
        };
      }
    },

    getVendorSubscribers: async (vendorId: string) => {
      try {
        return await request<{ success: boolean; count: number; subscribers: UserSubscription[] }>(`/subscriptions/vendor-subscribers/${vendorId}`);
      } catch (err) {
        const list = getLocalItem<UserSubscription[]>('budget_eats_subscriptions', []);
        return {
          success: true,
          count: list.length,
          subscribers: list
        };
      }
    },

    updateStatus: async (id: string, status: 'active' | 'paused' | 'expired') => {
      try {
        return await request<{ success: boolean; message: string; subscription: UserSubscription }>(`/subscriptions/${id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status })
        });
      } catch (err) {
        const list = getLocalItem<UserSubscription[]>('budget_eats_subscriptions', []);
        const sub = list.find(s => s.id === id);
        if (sub) {
          sub.status = status;
          setLocalItem('budget_eats_subscriptions', list);
          return { success: true, message: `Subscription ${status}`, subscription: sub };
        }
        throw new Error('Subscription not found');
      }
    }
  },

  // --- Orders ---
  orders: {
    getAll: async (params?: { customerId?: string; spotId?: string }) => {
      try {
        const query = new URLSearchParams();
        if (params?.customerId) query.append('customerId', params.customerId);
        if (params?.spotId) query.append('spotId', params.spotId);
        const qs = query.toString() ? `?${query.toString()}` : '';
        return await request<{ success: boolean; count: number; orders: CustomerOrder[] }>(`/orders${qs}`);
      } catch (err) {
        let list = getLocalItem<CustomerOrder[]>('budget_eats_orders', []);
        if (params?.customerId) list = list.filter(o => o.customerId === params.customerId);
        if (params?.spotId) list = list.filter(o => o.spotId === params.spotId);
        return {
          success: true,
          count: list.length,
          orders: list
        };
      }
    },

    create: async (data: Partial<CustomerOrder>) => {
      try {
        return await request<{ success: boolean; message: string; order: CustomerOrder }>('/orders', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      } catch (err) {
        const newOrder: CustomerOrder = {
          id: `ord_${Date.now()}`,
          orderNumber: `#ORD-${Math.floor(1000 + Math.random() * 9000)}`,
          customerId: data.customerId || 'cust-demo',
          customerName: data.customerName || 'Customer',
          customerPhone: data.customerPhone || '9876543210',
          spotId: data.spotId || 'spot-cycle-1',
          spotName: data.spotName || 'Muthu Anna Cycle Idli',
          items: data.items || [],
          totalAmount: data.totalAmount || 50,
          paymentMethod: data.paymentMethod || 'UPI / GPay',
          status: 'confirmed',
          createdAt: new Date().toISOString(),
          paymentStatus: 'paid',
          deliveryMode: data.deliveryMode || 'cycle_doorstep'
        };

        const list = getLocalItem<CustomerOrder[]>('budget_eats_orders', []);
        setLocalItem('budget_eats_orders', [newOrder, ...list]);

        return {
          success: true,
          message: 'Order placed successfully!',
          order: newOrder
        };
      }
    },

    updateStatus: async (orderId: string, status: string) => {
      try {
        return await request<{ success: boolean; message: string; order: CustomerOrder }>(`/orders/${orderId}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status })
        });
      } catch (err) {
        const list = getLocalItem<CustomerOrder[]>('budget_eats_orders', []);
        const ord = list.find(o => o.id === orderId);
        if (ord) {
          ord.status = status as any;
          setLocalItem('budget_eats_orders', list);
          return { success: true, message: `Order status updated to ${status}`, order: ord };
        }
        throw new Error('Order not found');
      }
    }
  },

  // --- Vendor Analytics ---
  vendor: {
    getDashboard: async (stallId: string) => {
      try {
        return await request<{
          success: boolean;
          stall: FoodSpot;
          stats: {
            totalSubscribers: number;
            activeOrdersToday: number;
            todayRevenue: number;
            totalViews: number;
            rating: number;
            stockCount: { [key: string]: number };
          };
          recentOrders: CustomerOrder[];
          activeSubscribers: UserSubscription[];
        }>(`/vendor/dashboard/${stallId}`);
      } catch (err) {
        const stall = INITIAL_FOOD_SPOTS.find(s => s.id === stallId) || INITIAL_FOOD_SPOTS[0];
        const subscribers = getLocalItem<UserSubscription[]>('budget_eats_subscriptions', []);
        const orders = getLocalItem<CustomerOrder[]>('budget_eats_orders', []);

        return {
          success: true,
          stall,
          stats: {
            totalSubscribers: subscribers.length || 28,
            activeOrdersToday: orders.length || 14,
            todayRevenue: 2480,
            totalViews: 394,
            rating: stall.rating || 4.9,
            stockCount: stall.stockCount || { 'Steaming Thatte Idlis': 35, 'Crispy Medu Vadas': 12 }
          },
          recentOrders: orders.slice(0, 10),
          activeSubscribers: subscribers.slice(0, 10)
        };
      }
    }
  }
};
