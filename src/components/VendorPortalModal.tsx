import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Bike,
  MapPin,
  Radio,
  Sparkles,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Plus,
  RefreshCw,
  Clock,
  IndianRupee,
  Store
} from 'lucide-react';
import { FoodSpot, LanguageCode, UserProfile } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { sound } from '../utils/audioFeedback';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import confetti from 'canvas-confetti';

interface VendorPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  currentLang: LanguageCode;
  spots: FoodSpot[];
  onUpdateSpotLocation: (spotId: string, newDistance: number, isMoving: boolean) => void;
}

export const VendorPortalModal: React.FC<VendorPortalModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentLang,
  spots,
  onUpdateSpotLocation
}) => {
  const [selectedSpotId, setSelectedSpotId] = useState<string>(spots[0]?.id || 'spot-cycle-1');
  const [isBroadcasting, setIsBroadcasting] = useState(true);
  const [distanceSim, setDistanceSim] = useState(75);
  const [statusMsg, setStatusMsg] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const t = TRANSLATIONS[currentLang];
  if (!isOpen) return null;

  const currentSpot = spots.find(s => s.id === selectedSpotId) || spots[0];

  const handleBroadcastCoordinates = async () => {
    sound.playClick();
    setIsUpdating(true);

    try {
      // Update in Firestore
      const stallRef = doc(db, 'stalls', selectedSpotId);
      await setDoc(stallRef, {
        isMovingNow: isBroadcasting,
        distanceMeters: distanceSim,
        lastUpdated: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore update fallback:', err);
    }

    onUpdateSpotLocation(selectedSpotId, distanceSim, isBroadcasting);

    setTimeout(() => {
      setIsUpdating(false);
      setStatusMsg(currentLang === 'ta' ? 'சைக்கிள் இருப்பிடம் வெற்றிகரமாக பகிரப்பட்டது!' : currentLang === 'hi' ? 'साइकिल लोकेशन सफलतापूर्वक अपडेट हो गई!' : 'Cycle location broadcasted live to nearby customers!');
      sound.playCycleBell();
      confetti({
        particleCount: 30,
        spread: 40,
        origin: { y: 0.7 }
      });
      setTimeout(() => setStatusMsg(''), 4000);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg bg-[#121212] border border-[#262626] rounded-3xl p-6 shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#E2FF3B]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#262626]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E2FF3B] text-[#0A0A0A] flex items-center justify-center font-black">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F0F0F0] font-display">
                {t.vendorHub}
              </h3>
              <p className="text-xs text-[#8E8E93] font-mono">
                {currentUser?.name ? `${currentUser.name} (+91 ${currentUser.phone})` : t.vendorBroadcast}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-xs font-mono text-[#8E8E93] hover:text-white px-2 py-1 rounded-lg bg-[#1C1C1E] border border-[#2E2E32]"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4 overflow-y-auto flex-1">
          {/* Active Stall Selector */}
          <div>
            <label className="block text-xs font-bold text-[#8E8E93] uppercase font-mono tracking-wider mb-1.5">
              Select Your Food Stall / Mobile Cycle Cart:
            </label>
            <select
              value={selectedSpotId}
              onChange={(e) => setSelectedSpotId(e.target.value)}
              className="w-full p-2.5 rounded-2xl bg-[#1C1C1E] border border-[#2E2E32] text-xs font-bold text-[#F0F0F0] focus:outline-none focus:border-[#E2FF3B]"
            >
              {spots.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.stallType === 'moving_cycle' ? '🚲 Moving Cycle' : '🏪 Fixed Stall'} - {s.stateRegion === 'tamil_nadu' ? 'Tamil Nadu' : 'Maharashtra'})
                </option>
              ))}
            </select>
          </div>

          {/* Current Stall Preview */}
          {currentSpot && (
            <div className="p-3.5 rounded-2xl bg-[#1C1C1E] border border-[#2E2E32] flex items-center gap-3">
              <img
                src={currentSpot.thumbnail || currentSpot.image}
                alt=""
                className="w-14 h-14 rounded-xl object-cover border border-[#2E2E32]"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#E2FF3B]/20 text-[#E2FF3B] font-bold">
                    {currentSpot.category}
                  </span>
                  <span className="text-[10px] font-mono text-[#8E8E93]">
                    {currentSpot.cityArea}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-[#F0F0F0] truncate mt-0.5 font-display">
                  {currentSpot.name}
                </h4>
                <p className="text-[11px] text-[#E2FF3B] font-mono font-bold">
                  Top: {currentSpot.topDeal.item} (₹{currentSpot.topDeal.price})
                </p>
              </div>
            </div>
          )}

          {/* Moving Broadcast Toggle */}
          <div className="p-4 rounded-2xl bg-[#0A0A0A] border border-[#262626] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className={`w-4 h-4 ${isBroadcasting ? 'text-[#E2FF3B] animate-pulse' : 'text-[#8E8E93]'}`} />
                <div>
                  <span className="text-xs font-bold text-[#F0F0F0] block font-display">
                    {t.vendorBroadcast}
                  </span>
                  <span className="text-[10px] text-[#8E8E93] font-mono">
                    Sends real-time 100-150m alerts to nearby users as you cycle
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setIsBroadcasting(!isBroadcasting);
                }}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  isBroadcasting ? 'bg-[#E2FF3B]' : 'bg-[#2E2E32]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-[#0A0A0A] transition-transform ${
                    isBroadcasting ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Simulated Live Distance Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className="text-[#8E8E93]">Current Live Distance from Customers:</span>
                <span className="text-[#E2FF3B] font-black">{distanceSim} meters</span>
              </div>
              <input
                type="range"
                min={30}
                max={150}
                step={5}
                value={distanceSim}
                onChange={(e) => setDistanceSim(Number(e.target.value))}
                className="w-full accent-[#E2FF3B]"
              />
              <div className="flex justify-between text-[9px] font-mono text-[#71717A] mt-0.5">
                <span>30m (Very Close)</span>
                <span className="text-[#E2FF3B]">100m - 150m (Alert Range)</span>
                <span>150m</span>
              </div>
            </div>
          </div>

          {statusMsg && (
            <div className="p-3 rounded-xl bg-[#E2FF3B]/15 border border-[#E2FF3B]/40 text-[#E2FF3B] text-xs font-mono font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          {/* Quick Info & Tips */}
          <div className="p-3 rounded-xl bg-[#1C1C1E] border border-[#2E2E32] text-xs text-[#8E8E93] space-y-1 font-mono">
            <div className="flex items-center gap-1.5 text-[#F0F0F0] font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#E2FF3B]" />
              <span>How Moving Stall Alerts Work:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#D4D4D8]">
              When you enable live broadcast, any hungry customer in Maharashtra or Tamil Nadu within 100 to 150m receives a cycle-bell popup with your food menu and direct phone call link.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[#262626]">
          <button
            onClick={handleBroadcastCoordinates}
            disabled={isUpdating}
            className="w-full py-3 rounded-2xl bg-[#E2FF3B] hover:bg-[#d5f330] text-[#0A0A0A] font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#E2FF3B]/20 transition-all font-display tracking-tight"
          >
            {isUpdating ? (
              <span>Broadcasting Live...</span>
            ) : (
              <>
                <Radio className="w-4 h-4 animate-pulse" />
                <span>{t.updateLocation} ({distanceSim}m)</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
