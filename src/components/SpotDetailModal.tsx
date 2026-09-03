import React, { useState } from 'react';
import { FoodSpot, LanguageCode } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Navigation, 
  Flame, 
  Heart, 
  Clock, 
  CreditCard, 
  Check, 
  Sparkles, 
  MapPin, 
  ChevronRight,
  Share2,
  PhoneCall,
  Bike
} from 'lucide-react';
import { FastImage } from './FastImage';
import { sound } from '../utils/audioFeedback';
import { TRANSLATIONS } from '../data/translations';

interface SpotDetailModalProps {
  spot: FoodSpot | null;
  onClose: () => void;
  onNavigate: (spot: FoodSpot) => void;
  onToggleSave: (spot: FoodSpot) => void;
  isSaved?: boolean;
  currentLang?: LanguageCode;
}

export const SpotDetailModal: React.FC<SpotDetailModalProps> = ({
  spot,
  onClose,
  onNavigate,
  onToggleSave,
  isSaved = false,
  currentLang = 'en',
}) => {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const t = TRANSLATIONS[currentLang];

  if (!spot) return null;

  const displayName = currentLang === 'ta' && spot.nameTa ? spot.nameTa : currentLang === 'hi' && spot.nameHi ? spot.nameHi : spot.name;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-lg bg-[#121212] border border-[#262626] rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Image carousel / Hero */}
          <div className="relative h-64 sm:h-72 w-full shrink-0 bg-[#0A0A0A]">
            <FastImage
              src={spot.photos[activePhotoIdx] || spot.image}
              alt={displayName}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/30 to-black/60" />

            {/* Top Close and Action Icons */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
              <div className="flex items-center gap-1.5">
                <span className="px-3 py-1 rounded-full bg-[#0A0A0A]/90 backdrop-blur-md border border-[#E2FF3B]/40 text-[#E2FF3B] text-xs font-mono font-bold shadow-lg">
                  {spot.distanceMeters}m away • {spot.stepsCount} steps
                </span>
                {spot.stallType === 'moving_cycle' && (
                  <span className="px-2 py-1 rounded-full bg-[#E2FF3B] text-[#0A0A0A] text-[10px] font-mono font-black flex items-center gap-1">
                    <Bike className="w-3 h-3" />
                    <span>CYCLE</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    sound.playClick();
                    onToggleSave(spot);
                  }}
                  className={`p-2 rounded-full backdrop-blur-md border transition-all ${
                    isSaved
                      ? 'bg-[#FF5238]/20 border-[#FF5238]/60 text-[#FF5238]'
                      : 'bg-[#0A0A0A]/80 border-[#333333] text-[#D4D4D8] hover:text-[#FF5238]'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isSaved ? 'fill-[#FF5238]' : ''}`} />
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    onClose();
                  }}
                  className="p-2 rounded-full bg-[#0A0A0A]/80 backdrop-blur-md border border-[#333333] text-[#D4D4D8] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Photo thumbnails */}
            {spot.photos.length > 1 && (
              <div className="absolute bottom-3 right-4 flex gap-1.5 z-20">
                {spot.photos.map((photo, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      sound.playClick();
                      setActivePhotoIdx(i);
                    }}
                    className={`w-9 h-9 rounded-lg overflow-hidden border-2 transition-all ${
                      activePhotoIdx === i ? 'border-[#E2FF3B] scale-105' : 'border-[#333333] opacity-60'
                    }`}
                  >
                    <img src={photo} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Scrollable Content */}
          <div className="p-5 overflow-y-auto space-y-5 flex-1 bg-[#121212]">
            {/* Title & Ratings */}
            <div>
              <div className="flex items-center justify-between text-xs text-[#8E8E93] mb-1 font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-[#1C1C1E] text-[#E2FF3B] font-bold border border-[#2E2E32]">
                    {spot.stateRegion === 'tamil_nadu' ? 'Tamil Nadu' : 'Maharashtra'}
                  </span>
                  <span className="text-[10px] text-[#8E8E93]">
                    {spot.cityArea}
                  </span>
                </div>
                <span className="text-[#E2FF3B] font-bold">
                  ★ {spot.rating} ({spot.reviewCount} reviews)
                </span>
              </div>
              <h2 className="text-xl font-bold text-[#F0F0F0] font-display">{displayName}</h2>
              <p className="text-xs text-[#8E8E93] flex items-center gap-1 mt-1 font-mono">
                <MapPin className="w-3.5 h-3.5 text-[#8E8E93]" />
                <span>{spot.address}</span>
              </p>
            </div>

            {/* Vendor Phone Link */}
            {spot.vendorPhone && (
              <div className="p-3 rounded-2xl bg-[#1C1C1E] border border-[#2E2E32] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#8E8E93] block font-mono">Vendor Contact:</span>
                  <span className="text-xs font-bold text-[#F0F0F0] font-mono">{spot.vendorName || 'Food Stall Master'}</span>
                </div>
                <a
                  href={`tel:${spot.vendorPhone}`}
                  onClick={() => sound.playClick()}
                  className="px-3 py-1.5 rounded-xl bg-[#E2FF3B] text-[#0A0A0A] font-bold text-xs flex items-center gap-1.5 font-mono shadow-md"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call ({spot.vendorPhone})</span>
                </a>
              </div>
            )}

            {/* Top Deal Highlight */}
            <div className="p-3.5 rounded-2xl bg-[#0A0A0A] border border-[#E2FF3B]/35 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#E2FF3B] text-[#0A0A0A] flex items-center justify-center font-black">
                  <Flame className="w-5 h-5 fill-[#0A0A0A]" />
                </div>
                <div>
                  <div className="text-[10px] font-mono font-bold text-[#E2FF3B] uppercase tracking-wider">
                    {spot.topDeal.badge}
                  </div>
                  <div className="text-xs font-bold text-[#F0F0F0]">
                    {spot.topDeal.item}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-[#E2FF3B] font-mono">
                  ₹{spot.topDeal.price}
                </span>
              </div>
            </div>

            {/* Description & Secret Pro Tip */}
            <div>
              <h4 className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider mb-1.5 font-mono">
                About this Spot
              </h4>
              <p className="text-xs text-[#D4D4D8] leading-relaxed">
                {spot.description}
              </p>

              <div className="mt-2.5 p-3 rounded-xl bg-[#1C1C1E] border border-[#E2FF3B]/30 text-xs text-[#D4D4D8] flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-[#E2FF3B] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#E2FF3B] font-mono">{t.proTip}: </span>
                  <span className="text-[#F0F0F0]">{spot.secretTip}</span>
                </div>
              </div>
            </div>

            {/* Full Low-Budget Menu */}
            <div>
              <h4 className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider mb-2 font-mono">
                {t.fullMenu}
              </h4>
              <div className="space-y-2">
                {spot.menu.map((item) => {
                  const itemName = currentLang === 'ta' && item.nameTa ? item.nameTa : currentLang === 'hi' && item.nameHi ? item.nameHi : item.name;
                  return (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-[#1C1C1E] border border-[#2E2E32] flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#F0F0F0] truncate">
                            {itemName}
                          </span>
                          {item.isBestseller && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#E2FF3B]/20 text-[#E2FF3B] border border-[#E2FF3B]/30 font-bold">
                              TOP DEAL
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#8E8E93] mt-0.5">
                          {item.description}
                        </p>
                      </div>
                      <span className="text-xs font-black text-[#E2FF3B] shrink-0 font-mono">
                        ₹{item.price}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Details: Hours, Payments, Dietary */}
            <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#1C1C1E] border border-[#2E2E32]">
                <div className="flex items-center gap-1.5 text-[#8E8E93] mb-1">
                  <Clock className="w-3.5 h-3.5 text-[#E2FF3B]" />
                  <span className="font-semibold text-[11px]">{t.openingHours.toUpperCase()}</span>
                </div>
                <p className="text-[#D4D4D8] text-xs font-medium font-sans">{spot.openingHours}</p>
              </div>

              <div className="p-3 rounded-xl bg-[#1C1C1E] border border-[#2E2E32]">
                <div className="flex items-center gap-1.5 text-[#8E8E93] mb-1">
                  <CreditCard className="w-3.5 h-3.5 text-[#E2FF3B]" />
                  <span className="font-semibold text-[11px]">PAYMENT</span>
                </div>
                <p className="text-[#D4D4D8] text-xs font-medium font-sans">{spot.paymentTypes.join(', ')}</p>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-4 border-t border-[#262626] bg-[#0A0A0A] flex items-center gap-3">
            <button
              onClick={() => {
                sound.playSuccess();
                onNavigate(spot);
                onClose();
              }}
              className="w-full py-3 rounded-xl bg-[#E2FF3B] hover:bg-[#d5f330] text-[#0A0A0A] text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-[#E2FF3B]/20 active:scale-98 transition-all font-display tracking-tight"
            >
              <Navigation className="w-4 h-4 fill-[#0A0A0A]" />
              <span>{t.walkingRoute} ({spot.distanceMeters}m)</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
