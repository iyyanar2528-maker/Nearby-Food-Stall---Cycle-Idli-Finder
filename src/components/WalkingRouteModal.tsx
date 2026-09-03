import React, { useState, useEffect } from 'react';
import { FoodSpot, LanguageCode } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Navigation, 
  X, 
  Compass, 
  Footprints, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  Sparkles,
  Volume2,
  VolumeX,
  Flame,
  Bike
} from 'lucide-react';
import { FastImage } from './FastImage';
import { sound } from '../utils/audioFeedback';
import { TRANSLATIONS } from '../data/translations';

interface WalkingRouteModalProps {
  spot: FoodSpot | null;
  onClose: () => void;
  currentLang?: LanguageCode;
}

export const WalkingRouteModal: React.FC<WalkingRouteModalProps> = ({
  spot,
  onClose,
  currentLang = 'en',
}) => {
  const [stepsLeft, setStepsLeft] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isArrived, setIsArrived] = useState(false);
  const [isSimulating, setIsSimulating] = useState(true);

  const t = TRANSLATIONS[currentLang];

  useEffect(() => {
    if (!spot) return;
    setStepsLeft(spot.stepsCount);
    setSecondsLeft(spot.walkingTimeSeconds);
    setIsArrived(false);
    setIsSimulating(true);

    const interval = setInterval(() => {
      setStepsLeft((prev) => {
        if (prev <= 2) {
          setIsArrived(true);
          sound.playSuccess();
          return 0;
        }
        return prev - 2;
      });

      setSecondsLeft((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [spot]);

  if (!spot) return null;

  const displayName = currentLang === 'ta' && spot.nameTa ? spot.nameTa : currentLang === 'hi' && spot.nameHi ? spot.nameHi : spot.name;
  const totalSteps = spot.stepsCount;
  const progressPercent = Math.min(100, Math.round(((totalSteps - stepsLeft) / totalSteps) * 100));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-md bg-[#121212] border border-[#262626] rounded-3xl p-5 shadow-2xl overflow-hidden relative"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#E2FF3B] text-[#0A0A0A] flex items-center justify-center">
                <Navigation className="w-4 h-4 fill-[#0A0A0A]" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-[#E2FF3B] uppercase tracking-wider">
                  {t.walkingRoute}
                </span>
                <h3 className="text-sm font-bold text-[#F0F0F0] font-display line-clamp-1">{displayName}</h3>
              </div>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1.5 rounded-full bg-[#1C1C1E] text-[#8E8E93] hover:text-white border border-[#2E2E32]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Compass & Distance HUD */}
          <div className="mt-4 p-4 rounded-2xl bg-[#0A0A0A] border border-[#262626] flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Rotating Compass Indicator */}
              <div className="relative w-12 h-12 rounded-2xl bg-[#1C1C1E] border border-[#2E2E32] flex items-center justify-center">
                <motion.div
                  style={{ rotate: spot.bearingDegrees }}
                  className="w-full h-full flex items-center justify-center text-[#E2FF3B]"
                >
                  <Navigation className="w-6 h-6 fill-[#E2FF3B]" />
                </motion.div>
                <span className="absolute bottom-0.5 text-[8px] font-mono text-[#8E8E93] font-bold">
                  {spot.bearingDegrees}°
                </span>
              </div>

              <div>
                <div className="text-2xl font-black text-[#E2FF3B] font-mono">
                  {Math.max(0, Math.round((stepsLeft / totalSteps) * spot.distanceMeters))}m
                </div>
                <div className="text-[11px] text-[#8E8E93] font-mono flex items-center gap-1">
                  <Footprints className="w-3 h-3 text-[#E2FF3B]" />
                  <span>{stepsLeft} steps remaining</span>
                </div>
              </div>
            </div>

            <div className="text-right font-mono">
              <div className="text-xs font-bold text-[#D4D4D8] flex items-center justify-end gap-1">
                <Clock className="w-3 h-3 text-[#E2FF3B]" />
                <span>~{secondsLeft}s ETA</span>
              </div>
              <span className="text-[10px] text-[#71717A]">Normal Walking Pace</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-[11px] font-mono text-[#8E8E93] mb-1">
              <span>{t.walkingRoute}</span>
              <span className="text-[#E2FF3B] font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#1C1C1E] overflow-hidden border border-[#2E2E32]">
              <motion.div
                className="h-full bg-gradient-to-r from-[#E2FF3B]/60 to-[#E2FF3B]"
                style={{ width: `${progressPercent}%` }}
                transition={{ ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Destination Preview Card */}
          <div className="mt-4 p-3 rounded-2xl bg-[#1C1C1E] border border-[#2E2E32] flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
              <FastImage src={spot.image} alt={displayName} className="w-full h-full" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#F0F0F0] truncate font-display">{displayName}</span>
                {spot.stallType === 'moving_cycle' && (
                  <Bike className="w-3.5 h-3.5 text-[#E2FF3B] shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-[#E2FF3B] font-mono truncate">
                Target: {spot.topDeal.item} • ₹{spot.topDeal.price}
              </p>
              <p className="text-[10px] text-[#8E8E93] truncate font-sans">{spot.address}</p>
            </div>
          </div>

          {/* Arrival Banner */}
          {isArrived && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 p-3 rounded-2xl bg-[#E2FF3B] text-[#0A0A0A] flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 fill-[#0A0A0A] text-[#E2FF3B]" />
                <span className="text-xs font-black font-display uppercase tracking-tight">
                  You Have Arrived! Enjoy Your Meal
                </span>
              </div>
              <Sparkles className="w-4 h-4 fill-[#0A0A0A]" />
            </motion.div>
          )}

          {/* Footer Action */}
          <div className="mt-5 flex gap-2">
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-[#1C1C1E] hover:bg-[#262629] text-[#D4D4D8] hover:text-[#F0F0F0] text-xs font-bold transition-all border border-[#2E2E32]"
            >
              {isArrived ? 'Close Navigation' : 'Cancel Route'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
