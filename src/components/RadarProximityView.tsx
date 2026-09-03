import React, { useState } from 'react';
import { FoodSpot, LanguageCode } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Navigation, Flame, Footprints, Sparkles, MapPin, X, Bike } from 'lucide-react';
import { FastImage } from './FastImage';
import { sound } from '../utils/audioFeedback';
import { TRANSLATIONS } from '../data/translations';

interface RadarProximityViewProps {
  spots: FoodSpot[];
  radiusLimit: number;
  onNavigate: (spot: FoodSpot) => void;
  onOpenDetails: (spot: FoodSpot) => void;
  onToggleSave: (spot: FoodSpot) => void;
  savedSpotIds: Set<string>;
  currentLang?: LanguageCode;
}

export const RadarProximityView: React.FC<RadarProximityViewProps> = ({
  spots,
  radiusLimit,
  onNavigate,
  onOpenDetails,
  onToggleSave,
  savedSpotIds,
  currentLang = 'en',
}) => {
  const [selectedSpot, setSelectedSpot] = useState<FoodSpot | null>(null);
  const t = TRANSLATIONS[currentLang];

  // Filter spots within the current radius
  const visibleSpots = spots.filter((s) => s.distanceMeters <= radiusLimit);

  // Helper to convert polar coords (distance + bearing) into Cartesian (% on 0-100 grid)
  const getCoordinates = (distanceMeters: number, bearingDegrees: number) => {
    // Normalizing distance 0 to 150m relative to max radar radius
    const maxRadius = Math.max(radiusLimit, 100);
    const normalizedDist = (distanceMeters / maxRadius) * 42; // max 42% from center so it stays within circle
    const angleRad = ((bearingDegrees - 90) * Math.PI) / 180; // 0 deg is North (top)
    const x = 50 + normalizedDist * Math.cos(angleRad);
    const y = 50 + normalizedDist * Math.sin(angleRad);
    return { x, y };
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center">
      {/* Radar Container with Artistic Flair */}
      <div className="relative w-full aspect-square max-w-[380px] bg-[#0A0A0A] rounded-full border border-[#262626] shadow-2xl p-4 overflow-hidden flex items-center justify-center">
        {/* Subtle radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#E2FF3B]/10 via-[#141414]/50 to-transparent pointer-events-none" />

        {/* Outer 150m ring */}
        <div className="absolute w-[86%] h-[86%] rounded-full border border-dashed border-[#E2FF3B]/25 flex items-center justify-center pointer-events-none">
          <span className="absolute top-1 right-1/2 translate-x-1/2 text-[9px] text-[#E2FF3B]/60 font-mono font-bold tracking-widest">
            {radiusLimit}M LIMIT
          </span>
        </div>

        {/* Inner 50m ring */}
        <div className="absolute w-[46%] h-[46%] rounded-full border border-[#E2FF3B]/35 bg-[#E2FF3B]/5 flex items-center justify-center pointer-events-none">
          <span className="absolute top-1 right-1/2 translate-x-1/2 text-[9px] text-[#E2FF3B] font-mono font-bold tracking-widest">
            50M RING
          </span>
        </div>

        {/* Crosshair grid axes */}
        <div className="absolute w-full h-[1px] bg-[#222222] pointer-events-none" />
        <div className="absolute h-full w-[1px] bg-[#222222] pointer-events-none" />

        {/* Cardinal Direction Markers */}
        <span className="absolute top-2 text-[10px] font-mono font-bold text-[#8E8E93]">N</span>
        <span className="absolute bottom-2 text-[10px] font-mono font-bold text-[#8E8E93]">S</span>
        <span className="absolute left-2 text-[10px] font-mono font-bold text-[#8E8E93]">W</span>
        <span className="absolute right-2 text-[10px] font-mono font-bold text-[#8E8E93]">E</span>

        {/* Sweeping Radar Beam */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 pointer-events-none origin-center"
        >
          <div className="w-1/2 h-1/2 absolute top-0 right-0 bg-gradient-to-bl from-[#E2FF3B]/25 via-[#E2FF3B]/5 to-transparent rounded-tr-full origin-bottom-left" />
        </motion.div>

        {/* User Central Beacon */}
        <div className="relative z-20 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-[#E2FF3B]/20 border-2 border-[#E2FF3B] flex items-center justify-center shadow-lg shadow-[#E2FF3B]/50">
            <div className="w-2.5 h-2.5 rounded-full bg-[#E2FF3B] animate-ping" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#E2FF3B] absolute" />
          </div>
          <span className="absolute -bottom-5 text-[9px] font-mono font-black text-[#0A0A0A] bg-[#E2FF3B] whitespace-nowrap px-1.5 py-0.5 rounded-full shadow">
            YOU
          </span>
        </div>

        {/* Food Spot Radar Blips */}
        {visibleSpots.map((spot) => {
          const { x, y } = getCoordinates(spot.distanceMeters, spot.bearingDegrees);
          const isSelected = selectedSpot?.id === spot.id;

          return (
            <button
              key={spot.id}
              id={`radar-blip-${spot.id}`}
              onClick={() => {
                sound.playClick();
                setSelectedSpot(spot);
              }}
              style={{ top: `${y}%`, left: `${x}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-30 group transition-all duration-200 focus:outline-none`}
            >
              <div
                className={`relative p-1.5 rounded-full backdrop-blur-md transition-all ${
                  isSelected
                    ? 'bg-[#E2FF3B] text-[#0A0A0A] scale-125 ring-4 ring-[#E2FF3B]/40 font-mono font-black'
                    : 'bg-[#141414] border border-[#E2FF3B]/70 text-[#E2FF3B] hover:scale-110 hover:border-[#E2FF3B] shadow-md font-mono'
                }`}
              >
                <div className="flex items-center gap-0.5">
                  {spot.stallType === 'moving_cycle' && (
                    <Bike className="w-3 h-3 text-[#0A0A0A]" />
                  )}
                  <span className="text-[10px] font-black px-1">
                    ₹{spot.topDeal.price}
                  </span>
                </div>
              </div>

              {/* Mini pin label */}
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 hidden group-hover:flex whitespace-nowrap z-40 px-2 py-0.5 rounded-md bg-[#0A0A0A] text-[10px] text-[#F0F0F0] border border-[#333333] shadow-xl font-mono">
                {spot.name.split(' ')[0]} ({spot.distanceMeters}m)
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Spot Detail Popup on Radar */}
      <AnimatePresence>
        {selectedSpot && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="w-full mt-4 p-3.5 rounded-2xl bg-[#141414] border border-[#E2FF3B]/40 shadow-2xl flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-[#2E2E32]">
                <FastImage src={selectedSpot.image} alt={selectedSpot.name} className="w-full h-full" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 font-mono">
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#E2FF3B]/20 text-[#E2FF3B] font-bold">
                    {selectedSpot.distanceMeters}m away
                  </span>
                  <span className="text-[10px] text-[#8E8E93]">
                    ★ {selectedSpot.rating}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-[#F0F0F0] truncate mt-0.5 font-display">
                  {currentLang === 'ta' && selectedSpot.nameTa ? selectedSpot.nameTa : currentLang === 'hi' && selectedSpot.nameHi ? selectedSpot.nameHi : selectedSpot.name}
                </h4>
                <p className="text-[11px] text-[#E2FF3B] font-bold truncate font-mono">
                  {selectedSpot.topDeal.item} • ₹{selectedSpot.topDeal.price}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  sound.playSuccess();
                  onNavigate(selectedSpot);
                }}
                className="px-3 py-2 rounded-xl bg-[#E2FF3B] hover:bg-[#d5f330] text-[#0A0A0A] text-xs font-extrabold flex items-center gap-1 transition-colors font-display"
              >
                <Navigation className="w-3.5 h-3.5 fill-[#0A0A0A]" />
                <span>Go</span>
              </button>
              <button
                onClick={() => setSelectedSpot(null)}
                className="p-2 rounded-xl bg-[#1C1C1E] text-[#8E8E93] hover:text-white border border-[#2E2E32]"
                aria-label="Close preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
