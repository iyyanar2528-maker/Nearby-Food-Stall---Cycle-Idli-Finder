/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  FoodSpot, 
  RadiusFilter, 
  PriceFilter, 
  ViewMode, 
  LanguageCode, 
  StateRegion, 
  SortOrder, 
  UserProfile, 
  ProximityAlertData,
  UserRole
} from './types';
import { INITIAL_FOOD_SPOTS } from './data/foodSpots';
import { TRANSLATIONS } from './data/translations';
import { Card3DSwipeDeck } from './components/Card3DSwipeDeck';
import { Grid3DView } from './components/Grid3DView';
import { RadarProximityView } from './components/RadarProximityView';
import { FiltersBar } from './components/FiltersBar';
import { WalkingRouteModal } from './components/WalkingRouteModal';
import { SpotDetailModal } from './components/SpotDetailModal';
import { SavedPocketsModal } from './components/SavedPocketsModal';
import { LoginModal } from './components/LoginModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { MovingStallPortalModal } from './components/MovingStallPortalModal';
import { ShopOwnerPortalModal } from './components/ShopOwnerPortalModal';
import { MovingCyclePopup } from './components/MovingCyclePopup';
import { 
  Compass, 
  Heart, 
  Sparkles, 
  MapPin, 
  Footprints, 
  Zap, 
  RefreshCw, 
  Flame, 
  Shuffle, 
  Languages, 
  User, 
  Bike, 
  Store, 
  LogOut,
  Ticket,
  CheckCircle2,
  Radio,
  Server
} from 'lucide-react';
import { sound } from './utils/audioFeedback';
import { api } from './lib/api';
import { firebaseSync } from './lib/firebaseSync';

export default function App() {
  const [spots, setSpots] = useState<FoodSpot[]>(INITIAL_FOOD_SPOTS);
  const [radius, setRadius] = useState<RadiusFilter>(100);
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('deck');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Regional & Multilingual states (English default, Tamil, Hindi)
  const [currentLang, setCurrentLang] = useState<LanguageCode>('en');
  const [selectedState, setSelectedState] = useState<StateRegion>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('nearest');
  const [onlyMovingStalls, setOnlyMovingStalls] = useState<boolean>(false);

  // Authentication state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem('budget_eats_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Modals & Navigation state
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [loginInitialRole, setLoginInitialRole] = useState<UserRole>('customer');
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState<boolean>(false);
  const [isMovingStallPortalOpen, setIsMovingStallPortalOpen] = useState<boolean>(false);
  const [isShopOwnerPortalOpen, setIsShopOwnerPortalOpen] = useState<boolean>(false);

  const [navigatingSpot, setNavigatingSpot] = useState<FoodSpot | null>(null);
  const [inspectingSpot, setInspectingSpot] = useState<FoodSpot | null>(null);
  const [isSavedOpen, setIsSavedOpen] = useState<boolean>(false);

  // Moving cycle proximity alert state (100 - 150m trigger)
  const [cycleAlert, setCycleAlert] = useState<ProximityAlertData | null>(null);
  const [hasDismissedAlert, setHasDismissedAlert] = useState<boolean>(false);
  const [apiConnected, setApiConnected] = useState<boolean>(true);

  // Saved Spot IDs (persisted to localStorage)
  const [savedSpotIds, setSavedSpotIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('budget_eats_saved');
      return stored ? new Set(JSON.parse(stored)) : new Set(['spot-cycle-1']);
    } catch {
      return new Set(['spot-cycle-1']);
    }
  });

  const t = TRANSLATIONS[currentLang];

  // Fetch initial spots from backend API with fallback
  useEffect(() => {
    api.spots.getAll().then((res) => {
      if (res.spots && res.spots.length > 0) {
        setSpots(res.spots);
        setApiConnected(true);
      }
    }).catch((err) => {
      console.warn('Backend API connection notice (using offline seed data):', err);
    });
  }, []);

  // Real-time Firebase Firestore Stalls Listener
  useEffect(() => {
    const unsubStalls = firebaseSync.listenToLiveStalls((updatedMap) => {
      setSpots((prev) =>
        prev.map((spot) => {
          if (updatedMap.has(spot.id)) {
            const live = updatedMap.get(spot.id)!;
            const newDist = live.distanceMeters ?? spot.distanceMeters;
            return {
              ...spot,
              distanceMeters: newDist,
              isMovingNow: live.isMovingNow ?? spot.isMovingNow,
              speedKmh: live.speedKmh ?? spot.speedKmh,
              stockCount: live.stockCount ?? spot.stockCount,
              isOpenNow: live.isOpenNow ?? spot.isOpenNow,
              stepsCount: Math.round((newDist / 75) * 100),
              walkingTimeSeconds: Math.round((newDist / 75) * 60)
            };
          }
          return spot;
        })
      );
    });

    const unsubAlerts = firebaseSync.listenToProximityAlerts((alert) => {
      setCycleAlert(alert);
      sound.playCycleBell();
    });

    return () => {
      unsubStalls();
      unsubAlerts();
    };
  }, []);

  // Periodic check for moving cycle live broadcasts via API
  useEffect(() => {
    const interval = setInterval(() => {
      api.broadcast.getMovingCycles().then((res) => {
        if (res.broadcasts) {
          const map = new Map(res.broadcasts.map(b => [b.spotId, b]));
          setSpots((prev) =>
            prev.map((s) => {
              if (map.has(s.id)) {
                const b = map.get(s.id)!;
                return {
                  ...s,
                  distanceMeters: b.distanceMeters,
                  isMovingNow: b.isMoving,
                  speedKmh: b.speedKmh,
                  stepsCount: Math.round((b.distanceMeters / 75) * 100),
                  walkingTimeSeconds: Math.round((b.distanceMeters / 75) * 60)
                };
              }
              return s;
            })
          );
        }
      }).catch(() => {});
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Proximity Alert Detection: Checks if any moving cycle stall is within 100-150m
  useEffect(() => {
    if (hasDismissedAlert) return;

    const nearbyMovingStall = spots.find(
      (s) => s.stallType === 'moving_cycle' && s.distanceMeters <= 150
    );

    if (nearbyMovingStall && !cycleAlert) {
      const timer = setTimeout(() => {
        setCycleAlert({
          id: `alert_${nearbyMovingStall.id}`,
          stallId: nearbyMovingStall.id,
          stallName: nearbyMovingStall.name,
          vendorName: nearbyMovingStall.vendorName || 'Cycle Vendor',
          vendorPhone: nearbyMovingStall.vendorPhone || '+91 98401 23456',
          stallType: nearbyMovingStall.stallType,
          speciality: `${nearbyMovingStall.topDeal.item} (₹${nearbyMovingStall.topDeal.price})`,
          price: nearbyMovingStall.topDeal.price,
          distanceMeters: nearbyMovingStall.distanceMeters,
          cityArea: nearbyMovingStall.cityArea,
          stateRegion: nearbyMovingStall.stateRegion,
          image: nearbyMovingStall.image,
          timestamp: Date.now()
        });
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [spots, hasDismissedAlert, cycleAlert]);

  const toggleSave = (spot: FoodSpot) => {
    setSavedSpotIds((prev) => {
      const next = new Set(prev);
      if (next.has(spot.id)) {
        next.delete(spot.id);
      } else {
        next.add(spot.id);
      }
      try {
        localStorage.setItem('budget_eats_saved', JSON.stringify(Array.from(next)));
      } catch {
        // storage unavailable
      }
      return next;
    });
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('budget_eats_user', JSON.stringify(user));
    } catch {
      // storage unavailable
    }
    if (user.stateRegion && user.stateRegion !== 'all') {
      setSelectedState(user.stateRegion);
    }
  };

  const handleLogout = () => {
    sound.playClick();
    setCurrentUser(null);
    localStorage.removeItem('budget_eats_user');
  };

  const handleOpenLoginWithRole = (role: UserRole) => {
    sound.playClick();
    setLoginInitialRole(role);
    setIsLoginOpen(true);
  };

  const handleUpdateSpotLocation = (spotId: string, newDistance: number, isMoving: boolean) => {
    setSpots((prev) =>
      prev.map((s) => {
        if (s.id === spotId) {
          return {
            ...s,
            distanceMeters: newDistance,
            isMovingNow: isMoving,
            stepsCount: Math.round((newDistance / 75) * 100),
            walkingTimeSeconds: Math.round((newDistance / 75) * 60),
          };
        }
        return s;
      })
    );
  };

  const handleUpdateSpot = (updatedSpot: FoodSpot) => {
    setSpots((prev) => prev.map((s) => (s.id === updatedSpot.id ? updatedSpot : s)));
  };

  // Filter & Sort spots based on radius, price, state, and category
  const filteredSpots = useMemo(() => {
    let result = spots.filter((spot) => {
      if (selectedState !== 'all' && spot.stateRegion !== selectedState) return false;
      if (onlyMovingStalls && spot.stallType !== 'moving_cycle') return false;
      if (spot.distanceMeters > radius) return false;

      if (priceFilter === 'under20' && spot.topDeal.price > 20) return false;
      if (priceFilter === 'under40' && spot.topDeal.price > 40) return false;
      if (priceFilter === 'under70' && spot.topDeal.price > 70) return false;
      if (priceFilter === 'under100' && spot.topDeal.price > 100) return false;

      if (selectedCategory !== 'All') {
        if (selectedCategory === 'Moving Cycle Stall' && spot.stallType !== 'moving_cycle') return false;
        if (selectedCategory === 'Street Cart' && spot.stallType !== 'handcart') return false;
        if (selectedCategory === 'Fixed Stall' && spot.stallType !== 'fixed_stall') return false;
        if (selectedCategory === 'Small Shop' && spot.stallType !== 'small_shop') return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = spot.name.toLowerCase().includes(q) || (spot.nameTa && spot.nameTa.toLowerCase().includes(q)) || (spot.nameHi && spot.nameHi.toLowerCase().includes(q));
        const matchDeal = spot.topDeal.item.toLowerCase().includes(q);
        const matchCategory = spot.category.toLowerCase().includes(q);
        const matchArea = spot.cityArea?.toLowerCase().includes(q);
        if (!matchName && !matchDeal && !matchCategory && !matchArea) return false;
      }

      return true;
    });

    if (sortOrder === 'low_to_high') {
      result = [...result].sort((a, b) => a.topDeal.price - b.topDeal.price);
    } else if (sortOrder === 'high_to_low') {
      result = [...result].sort((a, b) => b.topDeal.price - a.topDeal.price);
    } else {
      result = [...result].sort((a, b) => a.distanceMeters - b.distanceMeters);
    }

    return result;
  }, [spots, radius, priceFilter, selectedCategory, searchQuery, selectedState, sortOrder, onlyMovingStalls]);

  const savedSpotsList = useMemo(() => {
    return spots.filter((s) => savedSpotIds.has(s.id));
  }, [spots, savedSpotIds]);

  // Preload top images for instant rendering
  useEffect(() => {
    filteredSpots.slice(0, 4).forEach((s) => {
      const img = new Image();
      img.src = s.image;
    });
  }, [filteredSpots]);

  const handleSurprisePick = () => {
    sound.playSuccess();
    if (filteredSpots.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredSpots.length);
      setInspectingSpot(filteredSpots[randomIndex]);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0F0F0] flex flex-col selection:bg-[#E2FF3B]/30 selection:text-[#E2FF3B]">
      {/* Top Mobile-Optimized Header */}
      <header className="sticky top-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#222222] px-3 sm:px-4 py-2.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {/* Logo & Ultra-Local Proximity Indicator */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#E2FF3B] text-[#0A0A0A] flex items-center justify-center font-black shadow-md shadow-[#E2FF3B]/20 shrink-0">
              <Zap className="w-4 h-4 fill-[#0A0A0A]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-[#F0F0F0] font-display">
                  {t.appName}
                </h1>
                <span className="hidden sm:inline-flex px-1.5 py-0.5 text-[9px] font-mono font-bold rounded-md bg-[#E2FF3B]/15 text-[#E2FF3B] border border-[#E2FF3B]/30 tracking-wider">
                  TN & MH RADAR
                </span>
              </div>
              <p className="text-[10px] text-[#8E8E93] flex items-center gap-1.5 font-mono">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#E2FF3B] animate-pulse" />
                <span>Radius: {radius}m • 🟢 SQLite DB • 🔥 Firebase Realtime</span>
              </p>
            </div>
          </div>

          {/* Action Buttons: Language, Subscriptions, Role Portals, Login, Saved */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Language Selector */}
            <div className="flex items-center p-0.5 sm:p-1 rounded-xl bg-[#141414] border border-[#262626]">
              {(['en', 'ta', 'hi'] as LanguageCode[]).map((lang) => (
                <button
                  type="button"
                  key={lang}
                  onClick={(e) => {
                    e.preventDefault();
                    sound.playClick();
                    setCurrentLang(lang);
                  }}
                  className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[10px] font-bold transition-all ${
                    currentLang === lang
                      ? 'bg-[#E2FF3B] text-[#0A0A0A] shadow-sm'
                      : 'text-[#8E8E93] hover:text-[#F0F0F0]'
                  }`}
                >
                  {lang === 'en' ? 'EN' : lang === 'ta' ? 'தமிழ்' : 'हिंदी'}
                </button>
              ))}
            </div>

            {/* Subscriptions & Daily Passes Button */}
            <button
              type="button"
              id="subscriptions-header-btn"
              onClick={(e) => {
                e.preventDefault();
                sound.playClick();
                setIsSubscriptionOpen(true);
              }}
              title="Daily Breakfast Passes & Subscriptions"
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#1C1C1E] border border-[#E2FF3B]/50 text-[#E2FF3B] hover:bg-[#E2FF3B]/15 flex items-center gap-1 text-xs font-bold transition-all active:scale-95 shadow-sm"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Meal Passes</span>
            </button>

            {/* Dynamic Role-Based Hub Portal Button */}
            {currentUser?.role === 'moving_stall_owner' ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  sound.playClick();
                  setIsMovingStallPortalOpen(true);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-[#E2FF3B] text-[#0A0A0A] font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#E2FF3B]/20 active:scale-95"
              >
                <Bike className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cycle Radar Hub</span>
              </button>
            ) : currentUser?.role === 'shop_owner' ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  sound.playClick();
                  setIsShopOwnerPortalOpen(true);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-[#E2FF3B] text-[#0A0A0A] font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#E2FF3B]/20 active:scale-95"
              >
                <Store className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Shop Hub</span>
              </button>
            ) : (
              <div className="relative group">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    sound.playClick();
                    setIsMovingStallPortalOpen(true);
                  }}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#141414] border border-[#2E2E32] hover:border-[#E2FF3B]/40 text-[#D4D4D8] hover:text-[#E2FF3B] flex items-center gap-1 text-xs font-bold transition-all active:scale-95"
                >
                  <Bike className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Vendor Radar</span>
                </button>
              </div>
            )}

            {/* Saved Pockets Drawer Button */}
            <button
              type="button"
              id="saved-pockets-btn"
              onClick={(e) => {
                e.preventDefault();
                sound.playClick();
                setIsSavedOpen(true);
              }}
              className="relative p-1.5 sm:p-2 rounded-xl bg-[#141414] border border-[#262626] text-[#D4D4D8] hover:text-[#FF5238] hover:border-[#FF5238]/40 flex items-center gap-1 text-xs font-bold transition-all active:scale-95"
            >
              <Heart className="w-3.5 h-3.5 fill-[#FF5238] text-[#FF5238]" />
              {savedSpotIds.size > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#FF5238] text-white font-bold text-[9px]">
                  {savedSpotIds.size}
                </span>
              )}
            </button>

            {/* User Profile / Multi-Role Login Button */}
            {currentUser ? (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    sound.playClick();
                    setIsLoginOpen(true);
                  }}
                  className="px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#1C1C1E] border border-[#2E2E32] text-xs font-mono text-[#E2FF3B] flex items-center gap-1"
                >
                  <span className="text-xs">{currentUser.avatar || '👤'}</span>
                  <span className="max-w-[65px] truncate font-bold">{currentUser.name}</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLogout();
                  }}
                  title="Logout"
                  className="p-1.5 rounded-xl bg-[#1C1C1E] text-[#8E8E93] hover:text-white border border-[#2E2E32]"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                id="login-header-btn"
                onClick={(e) => {
                  e.preventDefault();
                  handleOpenLoginWithRole('customer');
                }}
                className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-[#E2FF3B] text-[#0A0A0A] font-bold text-xs flex items-center gap-1 shadow-md shadow-[#E2FF3B]/20 active:scale-95 transition-all"
              >
                <User className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Pass Announcement Ribbon */}
      <div className="bg-gradient-to-r from-[#1C1C1E] via-[#2A2A1A] to-[#1C1C1E] border-b border-[#33331A] py-1.5 px-4 text-center">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-left truncate">
            <span className="px-1.5 py-0.2 rounded bg-[#E2FF3B] text-[#0A0A0A] font-black text-[9px] uppercase tracking-wider">
              NEW PASS
            </span>
            <span className="text-[#E0E0E0] truncate font-medium">
              30-Day Morning Cycle Idli & Vada Pass • Doorstep Proximity Audio Chime at 100m
            </span>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              setIsSubscriptionOpen(true);
            }}
            className="text-[11px] font-mono font-bold text-[#E2FF3B] hover:underline shrink-0 ml-3 flex items-center gap-1"
          >
            <span>View Passes (₹499) →</span>
          </button>
        </div>
      </div>

      {/* Main Experience Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-4 flex flex-col">
        {/* Radius, Price Filters, State Selector & View Controls */}
        <FiltersBar
          radius={radius}
          setRadius={setRadius}
          priceFilter={priceFilter}
          setPriceFilter={setPriceFilter}
          viewMode={viewMode}
          setViewMode={setViewMode}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          totalCount={filteredSpots.length}
          currentLang={currentLang}
          selectedState={selectedState}
          setSelectedState={setSelectedState}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          onlyMovingStalls={onlyMovingStalls}
          setOnlyMovingStalls={setOnlyMovingStalls}
        />

        {/* View Renderer */}
        <div className="flex-1 flex flex-col justify-center my-2">
          {viewMode === 'deck' && (
            <Card3DSwipeDeck
              spots={filteredSpots}
              savedSpotIds={savedSpotIds}
              onToggleSave={toggleSave}
              onNavigate={(spot) => setNavigatingSpot(spot)}
              onOpenDetails={(spot) => setInspectingSpot(spot)}
              onResetDeck={() => setRadius(100)}
              currentLang={currentLang}
            />
          )}

          {viewMode === 'grid' && (
            <Grid3DView
              spots={filteredSpots}
              savedSpotIds={savedSpotIds}
              onNavigate={(spot) => setNavigatingSpot(spot)}
              onOpenDetails={(spot) => setInspectingSpot(spot)}
              onToggleSave={toggleSave}
              currentLang={currentLang}
            />
          )}

          {viewMode === 'radar' && (
            <RadarProximityView
              spots={spots}
              radiusLimit={radius}
              onNavigate={(spot) => setNavigatingSpot(spot)}
              onOpenDetails={(spot) => setInspectingSpot(spot)}
              onToggleSave={toggleSave}
              savedSpotIds={savedSpotIds}
              currentLang={currentLang}
            />
          )}
        </div>
      </main>

      {/* Footer Info Pill */}
      <footer className="py-3 text-center text-xs text-[#8E8E93] border-t border-[#1F1F1F]">
        <div className="max-w-md mx-auto px-4 flex items-center justify-between text-[11px] font-mono">
          <span className="flex items-center gap-1.5 text-[#A1A1AA]">
            <Footprints className="w-3.5 h-3.5 text-[#E2FF3B]" />
            <span>Avg. walk: ~60s (75m radius)</span>
          </span>
          <span className="flex items-center gap-1 text-[#71717A]">
            <span>Maharashtra & Tamil Nadu Radar</span>
          </span>
        </div>
      </footer>

      {/* 100-150m Proximity Alert Popup for Moving Cycle Food Stalls */}
      <MovingCyclePopup
        alert={cycleAlert}
        onClose={() => {
          setCycleAlert(null);
          setHasDismissedAlert(true);
        }}
        onNavigate={(spotId) => {
          const target = spots.find((s) => s.id === spotId);
          if (target) setNavigatingSpot(target);
          setCycleAlert(null);
        }}
        onOpenDetails={(spotId) => {
          const target = spots.find((s) => s.id === spotId);
          if (target) setInspectingSpot(target);
          setCycleAlert(null);
        }}
        currentLang={currentLang}
      />

      {/* Multi-Role Login & OTP Auth Modal (Customer / Shop Owner / Cycle Vendor) */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        initialRole={loginInitialRole}
      />

      {/* Subscription & Meal Pass Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionOpen}
        onClose={() => setIsSubscriptionOpen(false)}
        currentUser={currentUser}
        currentLang={currentLang}
        onOpenLogin={() => {
          setIsSubscriptionOpen(false);
          setIsLoginOpen(true);
        }}
      />

      {/* Dedicated Moving Stall Owner Live GPS Radar Portal */}
      <MovingStallPortalModal
        isOpen={isMovingStallPortalOpen}
        onClose={() => setIsMovingStallPortalOpen(false)}
        currentUser={currentUser}
        currentLang={currentLang}
        spots={spots}
        onUpdateSpotLocation={handleUpdateSpotLocation}
      />

      {/* Dedicated Fixed Shop Owner Portal (Menu & Price Editor) */}
      <ShopOwnerPortalModal
        isOpen={isShopOwnerPortalOpen}
        onClose={() => setIsShopOwnerPortalOpen(false)}
        currentUser={currentUser}
        currentLang={currentLang}
        spots={spots}
        onUpdateSpot={handleUpdateSpot}
      />

      {/* Walking Route Navigation Modal */}
      <WalkingRouteModal
        spot={navigatingSpot}
        onClose={() => setNavigatingSpot(null)}
        currentLang={currentLang}
      />

      {/* Spot Detail & Menu Modal */}
      <SpotDetailModal
        spot={inspectingSpot}
        onClose={() => setInspectingSpot(null)}
        onNavigate={(spot) => setNavigatingSpot(spot)}
        onToggleSave={toggleSave}
        isSaved={inspectingSpot ? savedSpotIds.has(inspectingSpot.id) : false}
        currentLang={currentLang}
      />

      {/* Saved Pockets Modal */}
      <SavedPocketsModal
        isOpen={isSavedOpen}
        onClose={() => setIsSavedOpen(false)}
        savedSpots={savedSpotsList}
        onRemoveSave={toggleSave}
        onNavigate={(spot) => setNavigatingSpot(spot)}
        currentLang={currentLang}
      />
    </div>
  );
}
