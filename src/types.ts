export type LanguageCode = 'en' | 'ta' | 'hi';
export type StateRegion = 'all' | 'maharashtra' | 'tamil_nadu';
export type SortOrder = 'low_to_high' | 'high_to_low' | 'nearest';
export type StallType = 'all' | 'moving_cycle' | 'fixed_stall' | 'handcart' | 'small_shop';
export type UserRole = 'customer' | 'shop_owner' | 'moving_stall_owner';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
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
  price: number; // in Indian Rupees (₹)
  description: string;
  image?: string;
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
  stallType: 'moving_cycle' | 'fixed_stall' | 'handcart' | 'small_shop';
  stateRegion: 'maharashtra' | 'tamil_nadu';
  cityArea: string; // e.g. "Dadar, Mumbai" or "T. Nagar, Chennai"
  image: string;
  thumbnail: string;
  rating: number;
  reviewCount: number;
  priceRange: '₹' | '₹₹';
  topDeal: {
    item: string;
    price: number; // INR ₹
    badge: string;
  };
  distanceMeters: number; // dynamically updated 50 - 150m
  walkingTimeSeconds: number;
  stepsCount: number;
  bearingDegrees: number; // compass direction
  address: string;
  openingHours: string;
  isOpenNow: boolean;
  isMovingNow?: boolean; // If mobile cycle moving around
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
    [key: string]: number;
  };
  activeSubscribersCount?: number;
}

export interface ProximityAlertData {
  id: string;
  stallId: string;
  stallName: string;
  vendorName: string;
  vendorPhone: string;
  stallType: string;
  speciality: string;
  price: number;
  distanceMeters: number;
  cityArea: string;
  stateRegion: string;
  image: string;
  timestamp: number;
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
  qrPassCode?: string;
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
  paymentMethod?: string;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled' | 'confirmed';
  isSubscriptionDelivery?: boolean;
  createdAt: string;
  deliveryNotes?: string;
  deliveryMode?: string;
  paymentStatus?: 'pending' | 'paid' | 'failed' | string;
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

export type RadiusFilter = 50 | 75 | 100 | 150;
export type PriceFilter = 'all' | 'under20' | 'under40' | 'under70' | 'under100';
export type ViewMode = 'deck' | 'grid' | 'radar';
