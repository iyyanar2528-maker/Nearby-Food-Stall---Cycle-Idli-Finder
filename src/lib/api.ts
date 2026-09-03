import {
  UserProfile,
  FoodSpot,
  SubscriptionPlan,
  UserSubscription,
  CustomerOrder,
  LiveBroadcastState,
  UserRole
} from '../types';

const API_BASE = '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
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
  } catch (error) {
    console.warn(`API call to ${endpoint} fallback:`, error);
    throw error;
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
      return request<{
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
    },

    resendOtp: async (phone: string) => {
      return request<{
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
      return request<{ success: boolean; user: UserProfile; token: string }>('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    demoLogin: async (role: UserRole) => {
      return request<{ success: boolean; user: UserProfile; token: string }>('/auth/demo-login', {
        method: 'POST',
        body: JSON.stringify({ role })
      });
    },

    getProfile: async (userId: string) => {
      return request<{ success: boolean; user: UserProfile }>(`/auth/me/${userId}`);
    }
  },

  // --- Food Spots Endpoints ---
  spots: {
    getAll: async (params?: { region?: string; stallType?: string; maxDistance?: number; search?: string }) => {
      const query = new URLSearchParams();
      if (params?.region) query.append('region', params.region);
      if (params?.stallType) query.append('stallType', params.stallType);
      if (params?.maxDistance) query.append('maxDistance', String(params.maxDistance));
      if (params?.search) query.append('search', params.search);

      const qs = query.toString() ? `?${query.toString()}` : '';
      return request<{ success: boolean; count: number; spots: FoodSpot[] }>(`/spots${qs}`);
    },

    getById: async (id: string) => {
      return request<{ success: boolean; spot: FoodSpot }>(`/spots/${id}`);
    },

    updateLocation: async (id: string, distanceMeters: number, isMoving: boolean, speedKmh?: number) => {
      return request<{ success: boolean; spot: FoodSpot }>(`/spots/${id}/location`, {
        method: 'PATCH',
        body: JSON.stringify({ distanceMeters, isMoving, speedKmh })
      });
    },

    updateStock: async (id: string, stock: { [key: string]: number }) => {
      return request<{ success: boolean; spot: FoodSpot }>(`/spots/${id}/stock`, {
        method: 'PATCH',
        body: JSON.stringify({ stock })
      });
    },

    updateMenu: async (id: string, menu: any[]) => {
      return request<{ success: boolean; spot: FoodSpot }>(`/spots/${id}/menu`, {
        method: 'PUT',
        body: JSON.stringify({ menu })
      });
    }
  },

  // --- Broadcast & Proximity Alerts ---
  broadcast: {
    getMovingCycles: async () => {
      return request<{ success: boolean; count: number; broadcasts: LiveBroadcastState[] }>('/broadcast/moving-cycles');
    },

    broadcastLiveLocation: async (spotId: string, distanceMeters: number, isMoving: boolean, speedKmh?: number) => {
      return request<{ success: boolean; spot: FoodSpot }>('/broadcast/live-location', {
        method: 'POST',
        body: JSON.stringify({ spotId, distanceMeters, isMoving, speedKmh })
      });
    },

    triggerBell: async (spotId: string) => {
      return request<{ success: boolean; message: string; timestamp: string }>('/broadcast/trigger-bell', {
        method: 'POST',
        body: JSON.stringify({ spotId })
      });
    }
  },

  // --- Subscriptions & Passes ---
  subscriptions: {
    getPlans: async (role?: string) => {
      const qs = role ? `?role=${role}` : '';
      return request<{ success: boolean; plans: SubscriptionPlan[] }>(`/subscriptions/plans${qs}`);
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
      return request<{ success: boolean; message: string; subscription: UserSubscription }>('/subscriptions/create', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    getMySubscriptions: async (userId: string) => {
      return request<{ success: boolean; count: number; subscriptions: UserSubscription[] }>(`/subscriptions/my-subscriptions/${userId}`);
    },

    getVendorSubscribers: async (vendorId: string) => {
      return request<{ success: boolean; count: number; subscribers: UserSubscription[] }>(`/subscriptions/vendor-subscribers/${vendorId}`);
    },

    updateStatus: async (id: string, status: 'active' | 'paused' | 'expired') => {
      return request<{ success: boolean; message: string; subscription: UserSubscription }>(`/subscriptions/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
    }
  },

  // --- Orders ---
  orders: {
    getAll: async (params?: { customerId?: string; spotId?: string }) => {
      const query = new URLSearchParams();
      if (params?.customerId) query.append('customerId', params.customerId);
      if (params?.spotId) query.append('spotId', params.spotId);
      const qs = query.toString() ? `?${query.toString()}` : '';
      return request<{ success: boolean; count: number; orders: CustomerOrder[] }>(`/orders${qs}`);
    },

    create: async (data: Partial<CustomerOrder>) => {
      return request<{ success: boolean; message: string; order: CustomerOrder }>('/orders', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    updateStatus: async (orderId: string, status: string) => {
      return request<{ success: boolean; message: string; order: CustomerOrder }>(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
    }
  },

  // --- Vendor Analytics ---
  vendor: {
    getDashboard: async (stallId: string) => {
      return request<{
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
    }
  }
};
