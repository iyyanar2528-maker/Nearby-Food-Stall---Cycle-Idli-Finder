import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { FoodSpot, LanguageCode } from '../types';
import { FastImage } from './FastImage';
import { 
  Navigation, 
  Flame, 
  Sparkles, 
  RotateCcw, 
  Clock, 
  ShieldCheck, 
  Compass, 
  Footprints,
  ChevronRight,
  Heart,
  Share2,
  Info,
  Bike,
  PhoneCall,
  MapPin
} from 'lucide-react';
import { sound } from '../utils/audioFeedback';
import { TRANSLATIONS } from '../data/translations';

interface Card3DItemProps {
  spot: FoodSpot;
  onNavigate: (spot: FoodSpot) => void;
  onOpenDetails: (spot: FoodSpot) => void;
  onToggleSave: (spot: FoodSpot) => void;
  isSaved?: boolean;
  priority?: boolean;
  interactiveTilt?: boolean;
  currentLang?: LanguageCode;
}

export const Card3DItem: React.FC<Card3DItemProps> = ({
  spot,
  onNavigate,
  onOpenDetails,
  onToggleSave,
  isSaved = false,
  priority = false,
  interactiveTilt = true,
  currentLang = 'en',
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[currentLang];

  // Localized spot name & item names
  const displayName = currentLang === 'ta' && spot.nameTa ? spot.nameTa : currentLang === 'hi' && spot.nameHi ? spot.nameHi : spot.name;

  // Mouse / Pointer 3D Parallax Tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 200, mass: 0.5 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), springConfig);
  const glareOpacity = useSpring(useTransform(mouseY, [-0.5, 0.5], [0.15, 0]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactiveTilt || isFlipped || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const toggleFlip = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sound.playFlip();
    setIsFlipped(!isFlipped);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playClick();
    if (navigator.share) {
      try {
        await navigator.share({
          title: displayName,
          text: `Check out ${displayName}: ${spot.topDeal.item} for just ₹${spot.topDeal.price} (${spot.distanceMeters}m away)!`,
          url: window.location.href,
        });
      } catch {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(`${displayName} - ${spot.topDeal.item} for ₹${spot.topDeal.price} (${spot.distanceMeters}m away)`);
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-[535px] max-w-sm mx-auto perspective-1200 select-none"
    >
      <motion.div
        style={{
          rotateX: isFlipped ? 0 : rotateX,
          rotateY: isFlipped ? 180 : rotateY,
          transformStyle: 'preserve-3d',
        }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="w-full h-full relative rounded-3xl preserve-3d shadow-2xl shadow-black/80 border border-[#262626] bg-[#121212]"
      >
        {/* FRONT FACE */}
        <div
          className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden backface-hidden flex flex-col bg-[#121212] border border-[#262626]"
          style={{ transform: 'rotateY(0deg)' }}
        >
          {/* Dynamic glare shine overlay */}
          <motion.div
            style={{ opacity: glareOpacity }}
            className="pointer-events-none absolute inset-0 z-30 bg-gradient-to-tr from-transparent via-white/10 to-transparent mix-blend-overlay"
          />

          {/* Top image header with full-bleed aesthetic */}
          <div className="relative h-[280px] w-full shrink-0 overflow-hidden bg-[#0A0A0A]">
            <FastImage
              src={spot.image}
              alt={displayName}
              priority={priority}
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700 ease-out"
            />
            {/* Gradient Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/30 to-black/60" />

            {/* Top Proximity & Moving Stall Tag */}
            <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-20">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0A0A0A]/90 backdrop-blur-md border border-[#E2FF3B]/40 text-[#E2FF3B] text-xs font-mono font-bold shadow-lg">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E2FF3B] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E2FF3B]"></span>
                </span>
                <span>{spot.distanceMeters}m away</span>
                <span className="text-[#555555]">•</span>
                <span className="text-[#D4D4D8]">~{spot.walkingTimeSeconds}s</span>
              </div>

              <div className="flex items-center gap-1.5">
                {spot.stallType === 'moving_cycle' && (
                  <div className="px-2.5 py-1 rounded-full bg-[#E2FF3B] text-[#0A0A0A] text-[10px] font-mono font-black flex items-center gap-1 shadow-md animate-pulse">
                    <Bike className="w-3 h-3" />
                    <span>CYCLE</span>
                  </div>
                )}
                <button
                  id={`share-btn-${spot.id}`}
                  onClick={handleShare}
                  aria-label="Share spot"
                  className="p-2 rounded-full bg-[#0A0A0A]/80 backdrop-blur-md border border-[#333333] text-[#D4D4D8] hover:text-white hover:bg-[#1F1F1F] active:scale-95 transition-all"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
                <button
                  id={`save-btn-${spot.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    sound.playClick();
                    onToggleSave(spot);
                  }}
                  aria-label="Save spot"
                  className={`p-2 rounded-full backdrop-blur-md border transition-all active:scale-95 ${
                    isSaved
                      ? 'bg-[#FF5238]/20 border-[#FF5238]/60 text-[#FF5238]'
                      : 'bg-[#0A0A0A]/80 border-[#333333] text-[#D4D4D8] hover:text-[#FF5238]'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#FF5238]' : ''}`} />
                </button>
              </div>
            </div>

            {/* Top Deal Banner floating over image */}
            <div className="absolute bottom-3 left-3.5 right-3.5 z-20">
              <div className="p-2.5 rounded-2xl bg-[#0A0A0A]/90 backdrop-blur-md border border-[#E2FF3B]/35 shadow-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#E2FF3B] text-[#0A0A0A] flex items-center justify-center shrink-0 font-black">
                    <Flame className="w-4 h-4 fill-[#0A0A0A]" />
                  </div>
                  <div className="min-w-0 pr-1">
                    <div className="text-[10px] font-mono font-bold text-[#E2FF3B] uppercase tracking-wider truncate">
                      {spot.topDeal.badge}
                    </div>
                    <div className="text-xs font-bold text-[#F0F0F0] truncate">
                      {spot.topDeal.item}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0 pl-2">
                  <span className="text-lg font-black text-[#E2FF3B] font-mono">
                    ₹{spot.topDeal.price}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Lower Card Info Section */}
          <div className="p-4 flex-1 flex flex-col justify-between bg-gradient-to-b from-[#121212] to-[#0A0A0A]">
            <div>
              {/* Category, Location & Rating */}
              <div className="flex items-center justify-between text-xs text-[#8E8E93] mb-1 font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-[#1F1F1F] text-[#E2FF3B] font-bold text-[10px] border border-[#2E2E2E]">
                    {spot.stateRegion === 'tamil_nadu' ? 'Tamil Nadu' : 'Maharashtra'}
                  </span>
                  <span className="text-[10px] text-[#8E8E93] truncate max-w-[120px]">
                    {spot.cityArea}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[#E2FF3B] font-bold">★ {spot.rating}</span>
                  <span className="text-[#71717A]">({spot.reviewCount})</span>
                </div>
              </div>

              {/* Spot Name */}
              <h3 className="text-sm font-bold text-[#F0F0F0] line-clamp-1 leading-snug tracking-tight font-display">
                {displayName}
              </h3>

              {/* Brief Description */}
              <p className="text-xs text-[#8E8E93] line-clamp-2 mt-1 leading-relaxed">
                {spot.description}
              </p>

              {/* Dietary / Fast Tags */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {spot.dietaryTags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1A1A1A] border border-[#2E2E2E] text-[#A1A1AA]"
                  >
                    {tag}
                  </span>
                ))}
                <button
                  onClick={toggleFlip}
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E2FF3B]/10 hover:bg-[#E2FF3B]/20 text-[#E2FF3B] border border-[#E2FF3B]/30 flex items-center gap-1 font-bold ml-auto transition-colors"
                >
                  <span>Menu (₹)</span>
                  <RotateCcw className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="pt-3 border-t border-[#222222] flex items-center gap-2 mt-2">
              <button
                id={`details-btn-${spot.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  sound.playClick();
                  onOpenDetails(spot);
                }}
                className="flex-1 py-2.5 px-2.5 rounded-xl bg-[#1C1C1E] hover:bg-[#262629] text-[#D4D4D8] hover:text-[#F0F0F0] text-xs font-semibold flex items-center justify-center gap-1.5 border border-[#2E2E32] active:scale-98 transition-all"
              >
                <Info className="w-3.5 h-3.5 text-[#8E8E93]" />
                <span>Full Spot</span>
              </button>

              <button
                id={`navigate-btn-${spot.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  sound.playSuccess();
                  onNavigate(spot);
                }}
                className="flex-[1.4] py-2.5 px-3 rounded-xl bg-[#E2FF3B] hover:bg-[#d5f330] text-[#0A0A0A] text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-lg shadow-[#E2FF3B]/20 active:scale-98 transition-all font-display tracking-tight"
              >
                <Navigation className="w-3.5 h-3.5 fill-[#0A0A0A]" />
                <span>{t.walkNow} ({spot.stepsCount} steps)</span>
              </button>
            </div>
          </div>
        </div>

        {/* BACK FACE: Quick Menu in INR (₹) */}
        <div
          className="absolute inset-0 w-full h-full rounded-3xl p-4 bg-[#141414] border border-[#E2FF3B]/40 backface-hidden flex flex-col justify-between shadow-2xl"
          style={{ transform: 'rotateY(180deg)' }}
        >
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#E2FF3B]/20 text-[#E2FF3B] flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#F0F0F0] font-display">{t.fullMenu}</h4>
                  <p className="text-[10px] text-[#8E8E93] font-mono">{displayName}</p>
                </div>
              </div>
              <button
                onClick={toggleFlip}
                className="p-1.5 rounded-full bg-[#222222] text-[#D4D4D8] hover:text-white transition-colors"
                aria-label="Flip back"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Menu Items List */}
            <div className="mt-3 space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {spot.menu.map((item) => {
                const itemName = currentLang === 'ta' && item.nameTa ? item.nameTa : currentLang === 'hi' && item.nameHi ? item.nameHi : item.name;
                return (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-[#1C1C1E] border border-[#2E2E32] flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-[#F0F0F0] truncate">
                          {itemName}
                        </span>
                        {item.isBestseller && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#E2FF3B]/20 text-[#E2FF3B] border border-[#E2FF3B]/40 font-bold">
                            TOP
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#8E8E93] truncate mt-0.5">
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

            {/* Secret Hack */}
            <div className="mt-3 p-2.5 rounded-xl bg-[#E2FF3B]/10 border border-[#E2FF3B]/30 text-[#E2FF3B] text-[11px] flex items-start gap-2">
              <span className="font-bold shrink-0 font-mono">💡 {t.proTip}:</span>
              <span className="text-[#D4D4D8] text-[10px] leading-tight font-sans">
                {spot.secretTip}
              </span>
            </div>
          </div>

          {/* Quick Route footer on back */}
          <div className="pt-3 border-t border-[#262626] flex items-center gap-2">
            <button
              onClick={() => {
                sound.playSuccess();
                onNavigate(spot);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-[#E2FF3B] hover:bg-[#d5f330] text-[#0A0A0A] text-xs font-extrabold flex items-center justify-center gap-2 transition-colors font-display tracking-tight"
            >
              <Navigation className="w-3.5 h-3.5 fill-[#0A0A0A]" />
              <span>{t.walkNow} ({spot.distanceMeters}m)</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
