import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bike,
  PhoneCall,
  Navigation,
  X,
  Volume2,
  Flame,
  Clock,
  Sparkles,
  MapPin
} from 'lucide-react';
import { FoodSpot, LanguageCode, ProximityAlertData } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { sound } from '../utils/audioFeedback';
import { FastImage } from './FastImage';

interface MovingCyclePopupProps {
  alert: ProximityAlertData | null;
  onClose: () => void;
  onNavigate: (spotId: string) => void;
  onOpenDetails: (spotId: string) => void;
  currentLang: LanguageCode;
}

export const MovingCyclePopup: React.FC<MovingCyclePopupProps> = ({
  alert,
  onClose,
  onNavigate,
  onOpenDetails,
  currentLang
}) => {
  const [isRinging, setIsRinging] = useState(false);
  const t = TRANSLATIONS[currentLang];

  useEffect(() => {
    if (alert) {
      sound.playCycleBell();
      setIsRinging(true);
      const timer = setTimeout(() => setIsRinging(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  if (!alert) return null;

  return (
    <AnimatePresence>
      <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 max-w-md pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          className="bg-[#121212] border-2 border-[#E2FF3B] rounded-3xl p-4 shadow-[0_10px_35px_rgba(226,255,59,0.25)] relative overflow-hidden"
        >
          {/* Neon animated pulse corner */}
          <div className="absolute top-0 right-0 w-28 h-28 bg-[#E2FF3B]/15 rounded-full blur-xl pointer-events-none" />

          {/* Top Banner Tag */}
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#262626]">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E2FF3B] opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#E2FF3B]" />
              </span>
              <div className="flex items-center gap-1.5 text-xs font-mono font-black text-[#E2FF3B] uppercase tracking-wider">
                <Bike className={`w-4 h-4 ${isRinging ? 'animate-bounce text-white' : ''}`} />
                <span>{t.movingCycleTitle}</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  sound.playCycleBell();
                  setIsRinging(true);
                  setTimeout(() => setIsRinging(false), 1500);
                }}
                className="p-1 rounded-lg bg-[#1C1C1E] border border-[#2E2E32] text-[#E2FF3B] hover:scale-105"
                title="Ring Cycle Bell"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onClose}
                className="p-1 rounded-lg bg-[#1C1C1E] border border-[#2E2E32] text-[#8E8E93] hover:text-white"
                aria-label="Dismiss alert"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Body content */}
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-[#E2FF3B]/40 bg-[#0A0A0A]">
              <FastImage src={alert.image} alt={alert.stallName} className="w-full h-full object-cover" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#E2FF3B] font-bold">
                <span className="px-1.5 py-0.5 rounded bg-[#E2FF3B]/20 border border-[#E2FF3B]/40">
                  {alert.distanceMeters}m AWAY
                </span>
                <span className="text-[#8E8E93]">~{Math.round(alert.distanceMeters * 0.8)}s walk</span>
              </div>

              <h4 className="text-xs font-bold text-[#F0F0F0] truncate mt-0.5 font-display">
                {alert.stallName}
              </h4>

              <p className="text-[11px] text-[#D4D4D8] truncate flex items-center gap-1 mt-0.5 font-sans">
                <Flame className="w-3 h-3 text-[#E2FF3B] shrink-0" />
                <span>{alert.speciality}</span>
                <span className="font-mono font-black text-[#E2FF3B]">₹{alert.price}</span>
              </p>

              <div className="text-[10px] text-[#8E8E93] font-mono truncate mt-0.5 flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5 text-[#8E8E93]" />
                <span>{alert.cityArea}</span>
              </div>
            </div>
          </div>

          {/* Alert Callout Description */}
          <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-[#0A0A0A] border border-[#262626] text-[10px] text-[#8E8E93] flex items-center justify-between font-mono">
            <span>{t.alertCyclePassing}</span>
          </div>

          {/* Actions */}
          <div className="mt-3 flex items-center gap-2">
            <a
              href={`tel:${alert.vendorPhone}`}
              onClick={() => sound.playClick()}
              className="py-2 px-3 rounded-xl bg-[#1C1C1E] hover:bg-[#262629] text-[#E2FF3B] text-xs font-mono font-bold flex items-center justify-center gap-1.5 border border-[#2E2E32] transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{t.callVendor}</span>
            </a>

            <button
              onClick={() => {
                sound.playSuccess();
                onNavigate(alert.stallId);
                onClose();
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-[#E2FF3B] hover:bg-[#d5f330] text-[#0A0A0A] text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md shadow-[#E2FF3B]/20 transition-all font-display tracking-tight"
            >
              <Navigation className="w-3.5 h-3.5 fill-[#0A0A0A]" />
              <span>{t.walkNow} ({alert.distanceMeters}m)</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
