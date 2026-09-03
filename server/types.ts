export type UserRole = 'customer' | 'shop_owner' | 'moving_stall_owner';
export type LanguageCode = 'en' | 'ta' | 'hi';
export type StateRegion = 'all' | 'maharashtra' | 'tamil_nadu';
export type StallType = 'moving_cycle' | 'fixed_stall' | 'handcart' | 'small_shop';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  language: LanguageCode;
  stateRegion: StateRegion;
  avatar?: string;
  stallId?: string;
  businessName?: string;
  businessAddress?: string;
  fssaiNumber?: string;
  createdAt: string;
  activeSubscriptionId?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  nameTa?: string;
  nameHi?: string;
  price: number;
  description: string;
  isBestseller?: boolean;
  isVegetarian?: boolean;
  isHalal?: boolean;
  isGlutenFree?: boolean;
}

export interface FoodSpot {
  id: string;
  name: string;
  nameTa?: string;
  nameHi?: string;
  vendorId?: string;
  vendorName?: string;
  vendorPhone?: string;
  category: string;
  stallType: StallType;
  stateRegion: 'maharashtra' | 'tamil_nadu';
  cityArea: string;
  image: string;
  thumbnail: string;
  rating: number;
  reviewCount: number;
  priceRange: '₹' | '₹₹';
  topDeal: {
    item: string;
    price: number;
    badge: string;
  };
  distanceMeters: number;
  walkingTimeSeconds: number;
  stepsCount: number;
  bearingDegrees: number;
  address: string;
  openingHours: string;
  isOpenNow: boolean;
  isMovingNow?: boolean;
  speedKmh?: number;
  currentLocation?: {
    lat: number;
    lng: number;
    lastUpdated: string;
  };
  dietaryTags: string[];
  paymentTypes: ('Cash' | 'UPI / GPay' | 'Paytm' | 'Card')[];
  description: string;
  secretTip: string;
  menu: MenuItem[];
  photos: string[];
  liveStatusText?: string;
  stockCount?: {
    [key: string]: number; // e.g. "Thatte Idli": 45, "Medu Vada": 12
  };
  activeSubscribersCount?: number;
}

export interface SubscriptionPlan {
  id: string;
  title: string;
  titleTa: string;
  titleHi: string;
  targetRole: 'customer' | 'vendor' | 'shop';
  price: number;
  period: 'monthly' | 'weekly' | '15days';
  features: string[];
  featuresTa: string[];
  featuresHi: string[];
  badge?: string;
  popular?: boolean;
  savingsText?: string;
  deliveriesCount?: number;
}

export interface UserSubscription {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  planId: string;
  planTitle: string;
  targetRole: 'customer' | 'vendor' | 'shop';
  amount: number;
  status: 'active' | 'paused' | 'expired';
  startDate: string;
  expiryDate: string;
  deliveriesRemaining?: number;
  paymentMethod: 'upi_gpay' | 'upi_phonepe' | 'upi_paytm' | 'card' | 'cash';
  paymentId: string;
  selectedSpotId?: string;
  selectedSpotName?: string;
  specialInstructions?: string;
  qrPassCode: string;
}

export interface OrderItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  spotId: string;
  spotName: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  isSubscriptionDelivery?: boolean;
  createdAt: string;
  deliveryNotes?: string;
}

export interface LiveBroadcastState {
  spotId: string;
  isMoving: boolean;
  distanceMeters: number;
  speedKmh: number;
  bearingDegrees: number;
  lastBellRungAt?: string;
  lastUpdated: string;
  currentArea: string;
}
