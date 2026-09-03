import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ShieldCheck,
  Languages,
  Store,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Flame,
  AlertCircle,
  KeyRound,
  RefreshCw,
  ChevronRight,
  Check,
  Camera,
  Image as ImageIcon,
  Plus,
  Trash2,
  Upload,
  UtensilsCrossed
} from 'lucide-react';
import { LanguageCode, StateRegion, UserProfile, UserRole, FoodSpot, MenuItem } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { sound } from '../utils/audioFeedback';
import { firebaseSync } from '../lib/firebaseSync';
import { emailOtpAuth } from '../lib/emailOtpAuth';
import confetti from 'canvas-confetti';

export const PRESET_SHOP_IMAGES = [
  {
    name: 'Cycle Idli Cart',
    url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800'
  },
  {
    name: 'Vada Pav Stall',
    url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800'
  },
  {
    name: 'Dosa & Tiffin Corner',
    url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800'
  },
  {
    name: 'Chai & Snacks',
    url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800'
  },
  {
    name: 'Street Chaat Counter',
    url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800'
  }
];

export const PRESET_FOOD_IMAGES = [
  {
    name: 'Idli & Vada',
    url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500'
  },
  {
    name: 'Masala Dosa',
    url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500'
  },
  {
    name: 'Vada Pav',
    url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500'
  },
  {
    name: 'Samosa',
    url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500'
  },
  {
    name: 'Pav Bhaji',
    url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500'
  },
  {
    name: 'Filter Coffee',
    url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=500'
  }
];

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLoginSuccess: (user: UserProfile) => void;
  onAddNewSpot?: (newSpot: FoodSpot) => void;
  onVendorRegistered?: (stallName: string) => void;
  currentLang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  initialRole?: UserRole;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onAddNewSpot,
  onVendorRegistered,
  currentLang,
  onLanguageChange,
  initialRole = 'customer'
}) => {
  // Wizard steps: 'credentials' -> 'otp'
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  
  // Auth Modes: 'signin' (existing user) | 'signup' (new user)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [role, setRole] = useState<UserRole>(initialRole);

  // Basic Credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [stateRegion, setStateRegion] = useState<StateRegion>('all');

  // Vendor / Shop Details
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [fssaiNumber, setFssaiNumber] = useState('');
  
  // Shop Image
  const [shopImage, setShopImage] = useState<string>(PRESET_SHOP_IMAGES[1].url);
  const [customShopImageUrl, setCustomShopImageUrl] = useState<string>('');

  // Menu & Food Items
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    {
      id: 'init_item_1',
      name: 'Steaming Hot Idli & Vada (2 pcs)',
      price: 30,
      description: 'Soft idlis & crispy medu vada with chutney & sambar',
      image: PRESET_FOOD_IMAGES[0].url,
      isVegetarian: true,
      isBestseller: true
    },
    {
      id: 'init_item_2',
      name: 'Crispy Butter Masala Dosa',
      price: 50,
      description: 'Golden crepe with spicy potato filling & podi butter',
      image: PRESET_FOOD_IMAGES[1].url,
      isVegetarian: true,
      isBestseller: true
    }
  ]);

  // Add Item Mini-form
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemImage, setNewItemImage] = useState(PRESET_FOOD_IMAGES[0].url);
  const [newItemIsVeg, setNewItemIsVeg] = useState(true);
  const [isAddingItemOpen, setIsAddingItemOpen] = useState(false);

  // OTP Verification
  const [otp, setOtp] = useState('');
  const [dispatchedOtp, setDispatchedOtp] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [isRealEmailSent, setIsRealEmailSent] = useState(false);
  const [deliveryProvider, setDeliveryProvider] = useState('');

  // Status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const t = TRANSLATIONS[currentLang];

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setSuccessMsg('');
      if (currentUser) {
        setName(currentUser.name || '');
        setEmail(currentUser.email || '');
        setRole(currentUser.role || 'customer');
        setStateRegion(currentUser.stateRegion || 'all');
        setBusinessName(currentUser.businessName || '');
        setBusinessAddress(currentUser.businessAddress || '');
        setFssaiNumber(currentUser.fssaiNumber || '');
        setAuthMode('signin');
        setStep('credentials');
      } else {
        setEmail('');
        setPassword('');
        setName('');
        setOtp('');
        setDispatchedOtp(null);
        setRole(initialRole);
        setAuthMode('signin');
        setStep('credentials');
        setShopImage(initialRole === 'moving_stall_owner' ? PRESET_SHOP_IMAGES[0].url : PRESET_SHOP_IMAGES[1].url);
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

  // Complete login pipeline: store locally, sync with Firestore, notify parent
  const completeLogin = (userProfile: UserProfile) => {
    localStorage.setItem('budget_eats_user', JSON.stringify(userProfile));
    firebaseSync.syncUserProfile(userProfile);
    confetti({ particleCount: 75, spread: 85, origin: { y: 0.6 } });
    sound.playSuccess();
    onLoginSuccess(userProfile);
    onClose();
  };

  // 1. Send 6-Digit OTP to Email
  const handleSendEmailOtp = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address (e.g. name@gmail.com).');
      return;
    }

    if (!password.trim() || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (authMode === 'signup' && !name.trim()) {
      setErrorMsg(
        currentLang === 'ta'
          ? 'தயவுசெய்து உங்கள் பெயரை உள்ளிடவும்'
          : currentLang === 'hi'
          ? 'कृपया अपना नाम दर्ज करें'
          : 'Please enter your full name'
      );
      return;
    }

    if (authMode === 'signup' && (role === 'shop_owner' || role === 'moving_stall_owner') && !businessName.trim()) {
      setErrorMsg('Please enter your Shop or Cart Name.');
      return;
    }

    setIsLoading(true);
    sound.playClick();

    const res = await emailOtpAuth.sendEmailOtp({
      email: cleanEmail,
      password: password.trim(),
      name: name.trim() || cleanEmail.split('@')[0],
      role,
      stateRegion,
      language: currentLang,
      businessName: businessName.trim() || undefined,
      businessAddress: businessAddress.trim() || undefined,
      fssaiNumber: fssaiNumber.trim() || undefined,
      stallId: role === 'moving_stall_owner' ? 'spot-cycle-1' : role === 'shop_owner' ? 'spot-mh-1' : undefined
    });

    setIsLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to dispatch email verification OTP.');
      return;
    }

    setDispatchedOtp(res.otp || null);
    setIsRealEmailSent(Boolean(res.isRealEmailDelivered));
    setDeliveryProvider(res.deliveryProvider || '');
    setOtp('');
    setResendTimer(60);
    setStep('otp');
    sound.playSuccess();
  };

  // 2. Resend OTP to Email
  const handleResendOtp = async () => {
    if (resendTimer > 0 || isLoading) return;
    setIsLoading(true);
    setErrorMsg('');
    sound.playClick();

    const res = await emailOtpAuth.resendEmailOtp(email);
    setIsLoading(false);

    if (res.success) {
      setDispatchedOtp(res.otp || null);
      setIsRealEmailSent(Boolean(res.isRealEmailDelivered));
      setDeliveryProvider(res.deliveryProvider || '');
      setResendTimer(60);
      setSuccessMsg(
        res.isRealEmailDelivered
          ? `Fresh verification code emailed to ${email}`
          : `Fresh verification code generated for ${email}`
      );
      sound.playSuccess();
    } else {
      setErrorMsg(res.error || 'Failed to resend verification OTP.');
    }
  };

  // 3. Verify OTP and complete login (also publishing new FoodSpot if vendor)
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setErrorMsg('');

    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6) {
      setErrorMsg('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    setIsLoading(true);
    sound.playClick();

    const res = await emailOtpAuth.verifyEmailOtp(email, cleanOtp);
    setIsLoading(false);

    if (!res.success || !res.user) {
      setErrorMsg(res.error || 'Invalid verification OTP code.');
      return;
    }

    const userProfile: UserProfile = { ...res.user };

    // If registered as a Shop Owner or Moving Stall Vendor, create and publish their FoodSpot
    if (role === 'shop_owner' || role === 'moving_stall_owner') {
      const newSpotId = `spot-${role === 'moving_stall_owner' ? 'cycle' : 'shop'}-${Date.now().toString().slice(-6)}`;
      const activeShopImage = shopImage.trim() || (role === 'moving_stall_owner' ? PRESET_SHOP_IMAGES[0].url : PRESET_SHOP_IMAGES[1].url);

      const newSpot: FoodSpot = {
        id: newSpotId,
        name: businessName.trim() || (role === 'moving_stall_owner' ? `${name.trim()}'s Cycle Idli` : `${name.trim()}'s Food Stall`),
        vendorId: userProfile.id,
        vendorName: name.trim() || 'Stall Owner',
        category: role === 'moving_stall_owner' ? 'Cycle Idli' : 'Street Stall',
        stallType: role === 'moving_stall_owner' ? 'moving_cycle' : 'fixed_stall',
        stateRegion: stateRegion === 'all' ? 'tamil_nadu' : stateRegion,
        cityArea: businessAddress.trim() || (stateRegion === 'maharashtra' ? 'Dadar, Mumbai' : 'T. Nagar, Chennai'),
        address: businessAddress.trim() || (stateRegion === 'maharashtra' ? 'Dadar West, Mumbai' : 'T. Nagar, Chennai'),
        image: activeShopImage,
        thumbnail: activeShopImage,
        rating: 4.9,
        reviewCount: 18,
        priceRange: '₹',
        topDeal: {
          item: menuItems[0]?.name || 'Special Meal Deal',
          price: menuItems[0]?.price || 30,
          badge: 'Bestseller'
        },
        distanceMeters: Math.floor(40 + Math.random() * 55),
        walkingTimeSeconds: 45,
        stepsCount: 60,
        bearingDegrees: 160,
        openingHours: '6:30 AM - 10:30 PM',
        isOpenNow: true,
        isMovingNow: role === 'moving_stall_owner',
        speedKmh: role === 'moving_stall_owner' ? 6 : 0,
        dietaryTags: ['Pure Veg', 'Freshly Steamed', 'Quick Bites'],
        paymentTypes: ['Cash', 'UPI / GPay'],
        description: `${businessName.trim() || name.trim()} serving steaming hot street flavors within 50-150m.`,
        secretTip: 'Ask for the freshly ground chutney & podi butter!',
        menu: menuItems.length > 0 ? menuItems : [
          {
            id: `item_${Date.now()}_1`,
            name: 'Steaming Hot Idli & Vada (2 pcs)',
            price: 30,
            description: 'Served with fresh coconut chutney & hot sambar',
            image: PRESET_FOOD_IMAGES[0].url,
            isVegetarian: true,
            isBestseller: true
          }
        ],
        photos: [activeShopImage],
        liveStatusText: 'Serving Hot Now'
      };

      userProfile.stallId = newSpotId;
      userProfile.businessName = newSpot.name;
      userProfile.businessAddress = newSpot.address;

      // Broadcast and add to live radar spots
      onAddNewSpot?.(newSpot);
      onVendorRegistered?.(newSpot.name);
    }

    completeLogin(userProfile);
  };

  // Helper to add a menu item in registration form
  const handleAddMenuItemToList = () => {
    if (!newItemName.trim() || !newItemPrice.trim()) return;
    const priceNum = Number(newItemPrice);
    const item: MenuItem = {
      id: `reg_item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: newItemName.trim(),
      price: isNaN(priceNum) || priceNum <= 0 ? 25 : priceNum,
      description: newItemDesc.trim() || 'Freshly made street delicacy',
      image: newItemImage || PRESET_FOOD_IMAGES[0].url,
      isVegetarian: newItemIsVeg,
      isBestseller: true
    };
    setMenuItems((prev) => [...prev, item]);
    setNewItemName('');
    setNewItemPrice('');
    setNewItemDesc('');
    setIsAddingItemOpen(false);
    sound.playClick();
  };

  // Helper to remove item from menu
  const handleRemoveMenuItem = (id: string) => {
    sound.playClick();
    setMenuItems((prev) => prev.filter((m) => m.id !== id));
  };

  // Image Upload helper (FileReader -> base64 data URL)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'shop' | 'food') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (target === 'shop') {
        setShopImage(dataUrl);
      } else {
        setNewItemImage(dataUrl);
      }
      sound.playSuccess();
    };
    reader.readAsDataURL(file);
  };

  // Helper to append @gmail.com
  const appendGmailDomain = () => {
    sound.playClick();
    if (!email.includes('@')) {
      setEmail(email.trim() + '@gmail.com');
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
        className="w-full max-w-lg bg-[#141414] border border-[#2E2E32] rounded-3xl p-5 sm:p-6 shadow-2xl relative my-8 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#262626] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#E2FF3B]/15 border border-[#E2FF3B]/30 flex items-center justify-center text-[#E2FF3B]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#F0F0F0] tracking-tight flex items-center gap-2">
                <span>{step === 'credentials' ? (authMode === 'signup' ? t.signUpBtn : t.signInBtn) : 'Verify Email OTP'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#E2FF3B]/15 text-[#E2FF3B] border border-[#E2FF3B]/30 font-mono font-bold flex items-center gap-1">
                  <Mail className="w-2.5 h-2.5 text-[#E2FF3B]" /> Email + OTP
                </span>
              </h2>
              <p className="text-xs text-[#8E8E93] font-mono">
                {step === 'credentials' ? 'Sign in securely with Email, Password & OTP' : `Enter the 6-digit code sent to ${email}`}
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
        <div className="my-3 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-[#E2FF3B]/15 via-[#F59E0B]/10 to-transparent border border-[#E2FF3B]/30 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🍲</span>
            <div>
              <p className="text-xs font-bold text-white">Welcome to Street Radar!</p>
              <p className="text-[11px] font-medium text-[#E2FF3B]">Eat first, thank me later ✨</p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-black/40 text-[#30D158] border border-[#30D158]/30 shrink-0 font-bold flex items-center gap-1">
            <Check className="w-3 h-3" /> No SMS MFA
          </span>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center justify-between py-2 border-b border-[#262626] shrink-0">
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

        {/* SCROLLABLE BODY */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-4 pt-3">
          {/* STEP 1: EMAIL & PASSWORD INPUTS */}
          {step === 'credentials' && (
            <div className="space-y-4">
              {/* Mode Switcher Tabs */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#1C1C1E] border border-[#2E2E32] rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setAuthMode('signin');
                    setErrorMsg('');
                  }}
                  className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    authMode === 'signin'
                      ? 'bg-[#E2FF3B] text-[#0A0A0A] shadow-md font-bold'
                      : 'text-[#8E8E93] hover:text-white'
                  }`}
                >
                  <span>{t.signInBtn}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setAuthMode('signup');
                    setErrorMsg('');
                  }}
                  className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    authMode === 'signup'
                      ? 'bg-[#E2FF3B] text-[#0A0A0A] shadow-md font-bold'
                      : 'text-[#8E8E93] hover:text-white'
                  }`}
                >
                  <span>{t.signUpBtn}</span>
                </button>
              </div>

              <form onSubmit={handleSendEmailOtp} className="space-y-4">
                {/* Account Role Selector (Sign Up only) */}
                {authMode === 'signup' && (
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
                        className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                          role === 'customer'
                            ? 'bg-[#E2FF3B]/10 border-[#E2FF3B] text-[#E2FF3B]'
                            : 'bg-[#1C1C1E] border-[#2E2E32] text-[#8E8E93] hover:text-white'
                        }`}
                      >
                        <span className="text-lg">😋</span>
                        <span className="text-[11px] font-bold">Customer</span>
                        <span className="text-[9px] text-[#8E8E93] font-mono">Radar & Passes</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setRole('moving_stall_owner');
                          setShopImage(PRESET_SHOP_IMAGES[0].url);
                        }}
                        className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                          role === 'moving_stall_owner'
                            ? 'bg-[#E2FF3B]/10 border-[#E2FF3B] text-[#E2FF3B]'
                            : 'bg-[#1C1C1E] border-[#2E2E32] text-[#8E8E93] hover:text-white'
                        }`}
                      >
                        <span className="text-lg">🚲</span>
                        <span className="text-[11px] font-bold">Cycle Cart</span>
                        <span className="text-[9px] text-[#8E8E93] font-mono">Live GPS Radar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setRole('shop_owner');
                          setShopImage(PRESET_SHOP_IMAGES[1].url);
                        }}
                        className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                          role === 'shop_owner'
                            ? 'bg-[#E2FF3B]/10 border-[#E2FF3B] text-[#E2FF3B]'
                            : 'bg-[#1C1C1E] border-[#2E2E32] text-[#8E8E93] hover:text-white'
                        }`}
                      >
                        <span className="text-lg">🏪</span>
                        <span className="text-[11px] font-bold">Shop Owner</span>
                        <span className="text-[9px] text-[#8E8E93] font-mono">Menu & Orders</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Full Name (Sign Up only) */}
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-[#8E8E93] uppercase font-mono tracking-wider mb-1.5">
                      {t.nameLabel} *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#8E8E93] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Ramesh Kumar / Ananya"
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#1C1C1E] border border-[#2E2E32] text-sm text-[#F0F0F0] placeholder-[#555] focus:outline-none focus:border-[#E2FF3B]"
                      />
                    </div>
                  </div>
                )}

                {/* Email / Gmail Address */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-[#8E8E93] uppercase font-mono tracking-wider">
                      {t.emailLabel} *
                    </label>
                    {!email.includes('@') && email.length > 0 && (
                      <button
                        type="button"
                        onClick={appendGmailDomain}
                        className="text-[10px] font-mono text-[#E2FF3B] hover:underline bg-[#E2FF3B]/10 px-2 py-0.5 rounded border border-[#E2FF3B]/20"
                      >
                        + @gmail.com
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#8E8E93] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="yourname@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#1C1C1E] border border-[#2E2E32] text-sm font-mono text-[#F0F0F0] placeholder-[#555] focus:outline-none focus:border-[#E2FF3B]"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-[#8E8E93] uppercase font-mono tracking-wider mb-1.5">
                    {t.passwordLabel} *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8E8E93] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-[#1C1C1E] border border-[#2E2E32] text-sm font-mono text-[#F0F0F0] placeholder-[#555] focus:outline-none focus:border-[#E2FF3B]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-white p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* VENDOR & SHOP OWNER CUSTOM SECTIONS */}
                {authMode === 'signup' && (role === 'shop_owner' || role === 'moving_stall_owner') && (
                  <div className="space-y-4 pt-1">
                    {/* Basic Shop Information */}
                    <div className="p-3.5 rounded-2xl bg-[#1C1C1E] border border-[#2E2E32] space-y-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#E2FF3B] font-mono uppercase">
                        <Store className="w-3.5 h-3.5" />
                        <span>{role === 'moving_stall_owner' ? 'Cycle Cart Information' : 'Shop / Stall Information'}</span>
                      </div>

                      <div>
                        <label className="block text-[11px] text-[#8E8E93] font-mono mb-1">
                          {role === 'moving_stall_owner' ? 'Cycle Cart Name *' : 'Shop / Stall Name *'}
                        </label>
                        <input
                          type="text"
                          required
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          placeholder={role === 'moving_stall_owner' ? 'e.g. Muthu Anna Hot Idli Cart' : 'e.g. Aaba Vada Pav & Chai Center'}
                          className="w-full px-3 py-2 rounded-xl bg-[#141414] border border-[#262626] text-xs text-[#F0F0F0] focus:outline-none focus:border-[#E2FF3B]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-[#8E8E93] font-mono mb-1">
                          Street Area / Location *
                        </label>
                        <input
                          type="text"
                          required
                          value={businessAddress}
                          onChange={(e) => setBusinessAddress(e.target.value)}
                          placeholder="e.g. T. Nagar, Chennai / Dadar West, Mumbai"
                          className="w-full px-3 py-2 rounded-xl bg-[#141414] border border-[#262626] text-xs text-[#F0F0F0] focus:outline-none focus:border-[#E2FF3B]"
                        />
                      </div>

                      {role === 'shop_owner' && (
                        <div>
                          <label className="block text-[11px] text-[#8E8E93] font-mono mb-1 flex items-center justify-between">
                            <span>FSSAI License</span>
                            <span className="text-[9px] text-[#555]">(Optional)</span>
                          </label>
                          <input
                            type="text"
                            value={fssaiNumber}
                            onChange={(e) => setFssaiNumber(e.target.value)}
                            placeholder="e.g. FSSAI-21524098000123"
                            className="w-full px-3 py-2 rounded-xl bg-[#141414] border border-[#262626] text-xs text-[#F0F0F0] focus:outline-none focus:border-[#E2FF3B]"
                          />
                        </div>
                      )}
                    </div>

                    {/* 1. SHOP IMAGE SECTION */}
                    <div className="p-3.5 rounded-2xl bg-[#1C1C1E] border border-[#2E2E32] space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#E2FF3B] font-mono uppercase">
                          <Camera className="w-3.5 h-3.5" />
                          <span>Shop & Stall Front Photo</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">Visible on Radar</span>
                      </div>

                      {/* Live Image Preview */}
                      <div className="relative h-32 rounded-xl overflow-hidden border border-[#333] group bg-black/40">
                        <img
                          src={shopImage}
                          alt="Shop Front"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                          <span className="text-[10px] font-mono font-bold text-white bg-black/60 px-2 py-0.5 rounded border border-white/20">
                            {businessName.trim() || 'Your Stall'} Front Photo
                          </span>
                        </div>
                      </div>

                      {/* Image Upload or URL Input */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="url"
                            value={customShopImageUrl}
                            onChange={(e) => {
                              setCustomShopImageUrl(e.target.value);
                              if (e.target.value.trim()) setShopImage(e.target.value.trim());
                            }}
                            placeholder="Paste image URL (or upload below)"
                            className="flex-1 px-3 py-1.5 rounded-xl bg-[#141414] border border-[#262626] text-xs text-[#F0F0F0] focus:outline-none focus:border-[#E2FF3B]"
                          />
                          <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-[#2C2C2E] hover:bg-[#3A3A3C] text-xs font-mono font-bold text-[#F0F0F0] border border-[#3A3A3C] flex items-center gap-1.5 shrink-0">
                            <Upload className="w-3.5 h-3.5 text-[#E2FF3B]" />
                            <span>Upload</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleImageFileChange(e, 'shop')}
                            />
                          </label>
                        </div>

                        {/* Presets Gallery */}
                        <div>
                          <span className="text-[10px] text-[#8E8E93] font-mono block mb-1.5">
                            Or choose a preset stall photo:
                          </span>
                          <div className="grid grid-cols-3 gap-1.5">
                            {PRESET_SHOP_IMAGES.slice(0, 3).map((img, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  sound.playClick();
                                  setShopImage(img.url);
                                }}
                                className={`p-1 rounded-xl border text-left flex items-center gap-1.5 transition-all ${
                                  shopImage === img.url
                                    ? 'bg-[#E2FF3B]/15 border-[#E2FF3B] text-[#E2FF3B]'
                                    : 'bg-[#141414] border-[#262626] text-[#8E8E93] hover:text-white'
                                }`}
                              >
                                <img src={img.url} alt={img.name} className="w-6 h-6 rounded-lg object-cover" />
                                <span className="text-[10px] font-mono truncate">{img.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2. MENU & FOOD ITEMS SECTION */}
                    <div className="p-3.5 rounded-2xl bg-[#1C1C1E] border border-[#2E2E32] space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#E2FF3B] font-mono uppercase">
                          <UtensilsCrossed className="w-3.5 h-3.5" />
                          <span>Menu & Food Items ({menuItems.length})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setIsAddingItemOpen(!isAddingItemOpen);
                          }}
                          className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-[#E2FF3B] text-[#0A0A0A] font-bold flex items-center gap-1 hover:bg-[#d4f22e]"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Item</span>
                        </button>
                      </div>

                      {/* Current Menu Items List */}
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {menuItems.map((item) => (
                          <div
                            key={item.id}
                            className="p-2 rounded-xl bg-[#141414] border border-[#262626] flex items-center justify-between gap-2 text-xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={item.image || PRESET_FOOD_IMAGES[0].url}
                                alt={item.name}
                                className="w-9 h-9 rounded-lg object-cover shrink-0 border border-white/10"
                              />
                              <div className="min-w-0">
                                <div className="font-bold text-white flex items-center gap-1.5 truncate">
                                  <span>{item.name}</span>
                                  {item.isVegetarian && (
                                    <span className="w-2 h-2 rounded-full bg-[#30D158] inline-block shrink-0" title="Veg" />
                                  )}
                                </div>
                                <div className="text-[10px] text-[#8E8E93] font-mono truncate">{item.description}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-mono font-bold text-[#E2FF3B]">₹{item.price}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveMenuItem(item.id)}
                                className="text-[#8E8E93] hover:text-[#FF3B30] p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add Food Item Mini Form */}
                      {isAddingItemOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="p-3 rounded-xl bg-[#141414] border border-[#E2FF3B]/30 space-y-2.5"
                        >
                          <span className="text-[11px] font-mono font-bold text-[#E2FF3B] block">
                            Add New Dish to Menu
                          </span>

                          <div className="grid grid-cols-3 gap-2">
                            <input
                              type="text"
                              placeholder="Dish Name (e.g. Masala Dosa)"
                              value={newItemName}
                              onChange={(e) => setNewItemName(e.target.value)}
                              className="col-span-2 px-2.5 py-1.5 rounded-lg bg-[#1C1C1E] border border-[#2E2E32] text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#E2FF3B]"
                            />
                            <input
                              type="number"
                              placeholder="Price ₹"
                              value={newItemPrice}
                              onChange={(e) => setNewItemPrice(e.target.value)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#1C1C1E] border border-[#2E2E32] text-xs text-white placeholder-[#555] font-mono focus:outline-none focus:border-[#E2FF3B]"
                            />
                          </div>

                          <input
                            type="text"
                            placeholder="Short description (e.g. Served with chutney & sambar)"
                            value={newItemDesc}
                            onChange={(e) => setNewItemDesc(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[#1C1C1E] border border-[#2E2E32] text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#E2FF3B]"
                          />

                          {/* Food Photo Picker */}
                          <div>
                            <span className="text-[10px] text-[#8E8E93] font-mono block mb-1">
                              Choose food photo preset or upload:
                            </span>
                            <div className="grid grid-cols-3 gap-1 mb-2">
                              {PRESET_FOOD_IMAGES.slice(0, 3).map((f, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setNewItemImage(f.url)}
                                  className={`p-1 rounded-lg border text-left flex items-center gap-1 transition-all ${
                                    newItemImage === f.url
                                      ? 'bg-[#E2FF3B]/15 border-[#E2FF3B] text-[#E2FF3B]'
                                      : 'bg-[#1C1C1E] border-[#2E2E32] text-[#8E8E93]'
                                  }`}
                                >
                                  <img src={f.url} alt={f.name} className="w-5 h-5 rounded object-cover" />
                                  <span className="text-[9px] font-mono truncate">{f.name}</span>
                                </button>
                              ))}
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="url"
                                placeholder="Food image URL"
                                value={newItemImage}
                                onChange={(e) => setNewItemImage(e.target.value)}
                                className="flex-1 px-2.5 py-1 rounded-lg bg-[#1C1C1E] border border-[#2E2E32] text-[11px] text-white focus:outline-none focus:border-[#E2FF3B]"
                              />
                              <label className="cursor-pointer px-2.5 py-1 rounded-lg bg-[#2C2C2E] text-[11px] font-mono text-white border border-[#3A3A3C] flex items-center gap-1 shrink-0">
                                <Upload className="w-3 h-3 text-[#E2FF3B]" />
                                <span>Upload</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleImageFileChange(e, 'food')}
                                />
                              </label>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={newItemIsVeg}
                                onChange={(e) => setNewItemIsVeg(e.target.checked)}
                                className="rounded text-[#E2FF3B]"
                              />
                              <span>Pure Vegetarian</span>
                            </label>

                            <button
                              type="button"
                              onClick={handleAddMenuItemToList}
                              className="px-3 py-1.5 rounded-lg bg-[#E2FF3B] text-black font-bold text-xs hover:bg-[#d4f22e]"
                            >
                              + Add to List
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                )}

                {/* State Region (Sign Up only) */}
                {authMode === 'signup' && (
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
                )}

                {errorMsg && (
                  <div className="text-xs font-mono text-[#FF3B30] bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-xl p-3 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#FF3B30]" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-2xl bg-[#E2FF3B] text-[#0A0A0A] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#d4f22e] transition-all shadow-lg shadow-[#E2FF3B]/20 active:scale-[0.98] disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Send Verification OTP to Email</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Switch Mode Footer */}
              <div className="pt-2 border-t border-[#262626] flex items-center justify-between text-xs font-mono text-[#8E8E93]">
                {authMode === 'signin' ? (
                  <>
                    <span>{t.noAccountText}</span>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setAuthMode('signup');
                        setErrorMsg('');
                      }}
                      className="text-[#E2FF3B] font-bold hover:underline flex items-center gap-1"
                    >
                      <span>{t.signUpBtn}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <span>{t.haveAccountText}</span>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setAuthMode('signin');
                        setErrorMsg('');
                      }}
                      className="text-[#E2FF3B] font-bold hover:underline flex items-center gap-1"
                    >
                      <span>{t.signInBtn}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: ENTER 6-DIGIT EMAIL OTP */}
          {step === 'otp' && (
            <div className="space-y-4">
              {/* Email Dispatch Notice */}
              {isRealEmailSent ? (
                <div className="p-3.5 rounded-2xl bg-[#1C1C1E] border border-[#30D158]/40 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#30D158]/15 text-[#30D158] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5 text-[#30D158]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-mono font-bold text-[#30D158] flex items-center gap-1.5">
                      <span>Real Email Dispatched via {deliveryProvider}</span>
                      <span className="text-[9px] px-1.5 py-0.2 bg-[#30D158]/20 text-[#30D158] rounded">Delivered</span>
                    </div>
                    <p className="text-[11px] text-[#A1A1AA] font-mono mt-0.5 leading-snug">
                      We sent the 6-digit verification OTP directly to <b className="text-white">{email}</b>. Please check your inbox & Spam/Junk folder!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-[#1C1C1E] border border-[#F59E0B]/30 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#F59E0B]/15 text-[#F59E0B] flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-4 h-4 text-[#F59E0B]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-mono font-bold text-[#F59E0B] flex items-center gap-1.5">
                      <span>Verification Code Ready</span>
                      <span className="text-[9px] px-1.5 py-0.2 bg-[#F59E0B]/20 text-[#F59E0B] rounded font-mono">Quick Access</span>
                    </div>
                    <p className="text-[11px] text-[#A1A1AA] font-mono mt-0.5 leading-snug">
                      To receive real emails in your personal inbox, configure <code className="text-[#E2FF3B]">EMAIL_USER</code> & <code className="text-[#E2FF3B]">EMAIL_PASS</code> in <code className="text-[#E2FF3B]">.env</code>.
                      Your code for <b className="text-white">{email}</b> is displayed below:
                    </p>
                  </div>
                </div>
              )}

              {/* Account Info & Change Button */}
              <div className="p-3 rounded-2xl bg-[#1C1C1E] border border-[#2E2E32] flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-[10px] text-[#8E8E93] uppercase block">Logging in as:</span>
                  <span className="font-bold text-[#F0F0F0]">{email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setStep('credentials');
                    setErrorMsg('');
                  }}
                  className="text-[11px] text-[#E2FF3B] hover:underline"
                >
                  Change Email
                </button>
              </div>

              {/* Testing Helper Chip: Dispatched OTP */}
              {dispatchedOtp && (
                <div className="p-2.5 rounded-xl bg-[#E2FF3B]/10 border border-[#E2FF3B]/30 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#E2FF3B]" />
                    <span className="text-[#E2FF3B]">Dispatched Code: <b>{dispatchedOtp}</b></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setOtp(dispatchedOtp);
                    }}
                    className="px-2 py-0.5 rounded bg-[#E2FF3B] text-black font-bold text-[10px] hover:bg-[#d4f22e]"
                  >
                    Auto-fill
                  </button>
                </div>
              )}

              {/* OTP Form */}
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#8E8E93] uppercase font-mono tracking-wider mb-2">
                    Enter 6-Digit Email OTP *
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-[#8E8E93] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
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
                      <span>Resend Email OTP</span>
                    </button>
                  </div>
                </div>

                {successMsg && (
                  <div className="text-xs font-mono text-[#30D158] bg-[#30D158]/10 border border-[#30D158]/30 rounded-xl p-2.5 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {errorMsg && (
                  <div className="text-xs font-mono text-[#FF3B30] bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-xl p-2.5 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#FF3B30]" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Verify & Enter Button */}
                <button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className="w-full py-3 rounded-2xl bg-[#E2FF3B] text-[#0A0A0A] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#d4f22e] transition-all shadow-lg shadow-[#E2FF3B]/20 active:scale-[0.98] disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify & Enter Street Radar</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
