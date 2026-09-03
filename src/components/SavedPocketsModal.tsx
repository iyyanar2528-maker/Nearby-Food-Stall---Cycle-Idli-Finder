import React from 'react';
import { FoodSpot, LanguageCode } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, Navigation, Heart, Trash2, Flame, MapPin, Sparkles, Bike } from 'lucide-react';
import { FastImage } from './FastImage';
import { sound } from '../utils/audioFeedback';
import { TRANSLATIONS } from '../data/translations';

interface SavedPocketsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedSpots: FoodSpot[];
  onRemoveSave: (spot: FoodSpot) => void;
  onNavigate: (spot: FoodSpot) => void;
  currentLang?: LanguageCode;
}

export const SavedPocketsModal: React.FC<SavedPocketsModalProps> = ({
  isOpen,
  onClose,
  savedSpots,
  onRemoveSave,
  onNavigate,
  currentLang = 'en',
}) => {
  const t = TRANSLATIONS[currentLang];
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-md bg-[#121212] border border-[#262626] rounded-3xl p-5 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FF5238]/20 text-[#FF5238] flex items-center justify-center">
                <Heart className="w-4 h-4 fill-[#FF5238]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#F0F0F0] font-display">{t.savedPockets}</h3>
                <p className="text-[11px] text-[#8E8E93] font-mono">{savedSpots.length} saved</p>
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

          {/* List of Saved Spots */}
          <div className="mt-4 space-y-3 overflow-y-auto flex-1 pr-1">
            {savedSpots.length === 0 ? (
              <div className="py-12 text-center text-[#8E8E93] font-mono">
                <Heart className="w-8 h-8 mx-auto text-[#444444] mb-2" />
                <p className="text-xs font-bold text-[#D4D4D8]">No saved food spots yet</p>
                <p className="text-[11px] text-[#71717A] mt-1 font-sans">
                  Swipe right or tap the heart icon on any card to save it for quick access.
                </p>
              </div>
            ) : (
              savedSpots.map((spot) => {
                const displayName = currentLang === 'ta' && spot.nameTa ? spot.nameTa : currentLang === 'hi' && spot.nameHi ? spot.nameHi : spot.name;
                return (
                  <div
                    key={spot.id}
                    className="p-3 rounded-2xl bg-[#0A0A0A] border border-[#262626] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-[#2E2E32]">
                        <FastImage src={spot.image} alt={displayName} className="w-full h-full" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#F0F0F0] truncate font-display">{displayName}</span>
                          {spot.stallType === 'moving_cycle' && (
                            <Bike className="w-3 h-3 text-[#E2FF3B] shrink-0" />
                          )}
                        </div>
                        <div className="text-[11px] text-[#E2FF3B] font-bold font-mono truncate flex items-center gap-1 mt-0.5">
                          <Flame className="w-3 h-3 text-[#E2FF3B]" />
                          <span>₹{spot.topDeal.price} • {spot.topDeal.item}</span>
                        </div>
                        <div className="text-[10px] text-[#8E8E93] font-mono truncate mt-0.5">
                          {spot.distanceMeters}m away • ~{spot.walkingTimeSeconds}s walk
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          sound.playSuccess();
                          onNavigate(spot);
                          onClose();
                        }}
                        className="p-2.5 rounded-xl bg-[#E2FF3B] hover:bg-[#d5f330] text-[#0A0A0A] font-extrabold text-xs flex items-center gap-1 transition-colors shadow-md"
                        title="Walk there"
                      >
                        <Navigation className="w-3.5 h-3.5 fill-[#0A0A0A]" />
                      </button>
                      <button
                        onClick={() => {
                          sound.playClick();
                          onRemoveSave(spot);
                        }}
                        className="p-2.5 rounded-xl bg-[#1C1C1E] hover:bg-[#FF5238]/20 text-[#8E8E93] hover:text-[#FF5238] border border-[#2E2E32] transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
