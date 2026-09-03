import React, { useState, useEffect } from 'react';
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
  Minus,
  RefreshCw,
  Clock,
  IndianRupee,
  Volume2,
  Users,
  Zap,
  Package,
  Compass
} from 'lucide-react';
import { FoodSpot, LanguageCode, UserProfile, UserSubscription } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { sound } from '../utils/audioFeedback';
import { api } from '../lib/api';
import { firebaseSync } from '../lib/firebaseSync';
import confetti from 'canvas-confetti';

interface MovingStallPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  currentLang: LanguageCode;
  spots: FoodSpot[];
  onUpdateSpotLocation: (spotId: string, newDistance: number, isMoving: boolean) => void;
  onOpenCommissionPass?: () => void;
}

export const MovingStallPortalModal: React.FC<MovingStallPortalModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentLang,
  spots,
  onUpdateSpotLocation,
  onOpenCommissionPass
}) => {
  const movingSpots = spots.filter((s) => s.stallType === 'moving_cycle');
  const [selectedSpotId, setSelectedSpotId] = useState<string>(
    currentUser?.stallId || movingSpots[0]?.id || 'spot-cycle-1'
  );
  const [isBroadcasting, setIsBroadcasting] = useState(true);
  const [distanceSim, setDistanceSim] = useState(65);
  const [speedSim, setSpeedSim] = useState(7);
  const [statusMsg, setStatusMsg] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [subscribers, setSubscribers] = useState<UserSubscription[]>([]);
  const [deliveredIds, setDeliveredIds] = useState<Set<string>>(new Set());

  // Stock Counters
  const [stock, setStock] = useState<{ [key: string]: number }>({
    'Steaming Thatte Idlis': 42,
    'Crispy Medu Vadas': 18,
    'Filter Coffee Flask': 15
  });

  const t = TRANSLATIONS[currentLang];

  useEffect(() => {
    if (isOpen && selectedSpotId) {
      api.vendor.getDashboard(selectedSpotId).then((res) => {
        if (res.activeSubscribers) setSubscribers(res.activeSubscribers);
        if (res.stall?.stockCount) setStock(res.stall.stockCount);
      }).catch(console.warn);
    }
  }, [isOpen, selectedSpotId]);

  if (!isOpen) return null;

  const currentSpot = spots.find((s) => s.id === selectedSpotId) || movingSpots[0] || spots[0];

  const handleBroadcastCoordinates = async () => {
    sound.playClick();
    setIsUpdating(true);

    try {
      await api.broadcast.broadcastLiveLocation(selectedSpotId, distanceSim, isBroadcasting, speedSim);
      firebaseSync.broadcastStallLocation(selectedSpotId, {
        distanceMeters: distanceSim,
        isMovingNow: isBroadcasting,
        speedKmh: speedSim,
        stockCount: stock
      });
    } catch (err) {
      console.warn('Live location fallback:', err);
    }

    onUpdateSpotLocation(selectedSpotId, distanceSim, isBroadcasting);

    setTimeout(() => {
      setIsUpdating(false);
      setStatusMsg(
        currentLang === 'ta'
          ? 'சைக்கிள் இருப்பிடம் நேரலையாக வாடிக்கையாளர்களுக்கு பகிரப்பட்டது!'
          : currentLang === 'hi'
          ? 'साइकिल लोकेशन लाइव ब्रॉडकास्ट हो गई!'
          : 'Cycle location broadcasted live to nearby customers within 150m!'
      );
      sound.playCycleBell();
      confetti({ particleCount: 30, spread: 40, origin: { y: 0.7 } });
      setTimeout(() => setStatusMsg(''), 4000);
    }, 400);
  };

  const handleRingProximityBell = async () => {
    sound.playCycleBell();
    try {
      await api.broadcast.triggerBell(selectedSpotId);
      if (currentSpot) {
        firebaseSync.triggerProximityBell({
          ...currentSpot,
          distanceMeters: distanceSim
        });
      }
    } catch (err) {
      console.warn('Bell broadcast fallback:', err);
    }

    setStatusMsg('🔔 Proximity horn bell broadcasted to all nearby customers within 150m!');
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    setTimeout(() => setStatusMsg(''), 4000);
  };

  const handleStockChange = async (itemName: string, delta: number) => {
    sound.playClick();
    const newCount = Math.max(0, (stock[itemName] || 0) + delta);
    const updated = { ...stock, [itemName]: newCount };
    setStock(updated);

    try {
      await api.spots.updateStock(selectedSpotId, updated);
    } catch (err) {
      console.warn('Stock update fallback:', err);
    }
  };

  const handleToggleDelivered = (subId: string) => {
    sound.playClick();
    setDeliveredIds((prev) => {
      const next = new Set(prev);
      if (next.has(subId)) next.delete(subId);
      else next.add(subId);
      return next;
    });
    sound.playSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg bg-[#121212] border border-[#262626] rounded-3xl p-6 shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col my-6"
      >
        {/* Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#E2FF3B]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#262626]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E2FF3B] text-[#0A0A0A] flex items-center justify-center font-black shadow-lg shadow-[#E2FF3B]/20">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F0F0F0] font-display">
                {t.cycleRadarHub}
              </h3>
              <p className="text-xs text-[#8E8E93] font-mono">
                {currentUser?.name ? `${currentUser.name} (+91 ${currentUser.phone})` : 'Live Cycle Cart Controller'}
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

        {/* Scrollable Content */}
        <div className="py-4 space-y-4 overflow-y-auto flex-1 pr-1">
          {/* Active Moving Stall Selector */}
          <div>
            <label className="block text-xs font-bold text-[#8E8E93] uppercase font-mono tracking-wider mb-1.5">
              Select Your Active Cycle Cart:
            </label>
            <select
              value={selectedSpotId}
              onChange={(e) => setSelectedSpotId(e.target.value)}
              className="w-full p-2.5 rounded-2xl bg-[#1C1C1E] border border-[#2E2E32] text-xs font-bold text-[#F0F0F0] focus:outline-none focus:border-[#E2FF3B]"
            >
              {spots.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.stallType === 'moving_cycle' ? '🚲 Moving Cycle' : '🏪 Fixed Stall'})
                </option>
              ))}
            </select>
          </div>

          {/* Platform Pass & Commission Banner */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#E2FF3B]/10 via-[#1C1C1E] to-[#1C1C1E] border border-[#E2FF3B]/30 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#E2FF3B]/20 text-[#E2FF3B] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Daily Stall Pass & Promotion</span>
                <span className="text-[10px] text-[#8E8E93] font-mono">UPI: iyyanarpriya@slc • ₹10/day or ₹250/mo</span>
              </div>
            </div>
            {onOpenCommissionPass && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onOpenCommissionPass();
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl bg-[#E2FF3B] hover:bg-[#d4f22e] text-black font-bold text-xs font-mono shadow-md transition-all shrink-0"
              >
                Pass / Pay
              </button>
            )}
          </div>

          {/* Current Stall Live Info Banner */}
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
                  <span className="text-[10px] text-[#8E8E93] font-mono">
                    ★ {currentSpot.rating} ({currentSpot.reviewCount} foodies)
                  </span>
                </div>
                <h4 className="text-xs font-bold text-[#F0F0F0] truncate mt-0.5">
                  {currentSpot.name}
                </h4>
                <p className="text-[11px] text-[#8E8E93] truncate font-mono">
                  📍 {currentSpot.cityArea}
                </p>
              </div>
            </div>
          )}

          {/* Bell Blast Action Banner */}
          <div className="p-4 rounded-2xl bg-[#E2FF3B]/10 border border-[#E2FF3B]/40 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#F0F0F0] flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-[#E2FF3B]" />
                Ring Proximity Bell
              </div>
              <div className="text-[10px] text-[#A0A0A0] font-mono mt-0.5">
                Rings bell chime on nearby customer apps (50-150m radius)
              </div>
            </div>
            <button
              onClick={handleRingProximityBell}
              className="px-3.5 py-2 rounded-xl bg-[#E2FF3B] text-[#0A0A0A] font-bold text-xs shadow-lg active:scale-95 flex items-center gap-1.5 hover:bg-[#d4f22e]"
            >
              <span>🔔 Ring Bell</span>
            </button>
          </div>

          {/* GPS Radar Broadcast Controls */}
          <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-[#2E2E32] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#F0F0F0] flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#E2FF3B] animate-pulse" />
                Live Moving Motion State
              </span>
              <button
                type="button"
                onClick={() => setIsBroadcasting(!isBroadcasting)}
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all ${
                  isBroadcasting
                    ? 'bg-[#E2FF3B] text-[#0A0A0A]'
                    : 'bg-[#2E2E32] text-[#8E8E93]'
                }`}
              >
                {isBroadcasting ? '● CYCLING LIVE' : '○ PARKED / STANDING'}
              </button>
            </div>

            {/* Simulated Live Distance Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-[#8E8E93] mb-1">
                <span>Simulated Customer Distance:</span>
                <span className="text-[#E2FF3B] font-bold">{distanceSim} meters away</span>
              </div>
              <input
                type="range"
                min="40"
                max="150"
                step="5"
                value={distanceSim}
                onChange={(e) => setDistanceSim(Number(e.target.value))}
                className="w-full accent-[#E2FF3B] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#5C5C60] mt-1">
                <span>40m (Arrived)</span>
                <span>90m (Entering Lane)</span>
                <span>150m (Proximity Alert Edge)</span>
              </div>
            </div>

            {/* Broadcast Coordinates Button */}
            <button
              onClick={handleBroadcastCoordinates}
              disabled={isUpdating}
              className="w-full py-3 rounded-2xl bg-[#E2FF3B] text-[#0A0A0A] font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#d4f22e] transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
            >
              {isUpdating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <MapPin className="w-4 h-4" />
                  <span>{t.updateLocation}</span>
                </>
              )}
            </button>
          </div>

          {/* Live Remaining Stock Counters */}
          <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-[#2E2E32] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#F0F0F0] flex items-center gap-1.5">
                <Package className="w-4 h-4 text-[#E2FF3B]" />
                {t.liveStockTracker}
              </span>
              <span className="text-[10px] font-mono text-[#8E8E93]">
                Auto-syncs with foodies
              </span>
            </div>

            <div className="space-y-2">
              {Object.entries(stock).map(([name, count]) => (
                <div
                  key={name}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#121212] border border-[#262626]"
                >
                  <span className="text-xs font-medium text-[#E0E0E0]">{name}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStockChange(name, -1)}
                      className="w-7 h-7 rounded-lg bg-[#2C2C2E] text-white flex items-center justify-center hover:bg-[#3C3C3E]"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-mono font-bold text-[#E2FF3B] w-8 text-center">
                      {count}
                    </span>
                    <button
                      onClick={() => handleStockChange(name, 1)}
                      className="w-7 h-7 rounded-lg bg-[#2C2C2E] text-white flex items-center justify-center hover:bg-[#3C3C3E]"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Morning Pass Subscriber Delivery Sheet */}
          <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-[#2E2E32] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#F0F0F0] flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#E2FF3B]" />
                Today's Morning Pass Subscribers ({subscribers.length || 3})
              </span>
              <span className="text-[10px] font-mono text-[#E2FF3B] font-bold">
                ₹{subscribers.length * 499 || 1497} Pass Revenue
              </span>
            </div>

            <div className="space-y-2">
              {(subscribers.length > 0 ? subscribers : [
                { id: 's1', userName: 'Ananya Sharma', userPhone: '9876543210', specialInstructions: 'Gate 3 - 4 Idlis', planTitle: 'Morning Cycle Idli Pass' },
                { id: 's2', userName: 'Ramesh K.', userPhone: '9840112233', specialInstructions: '2 Podi Idlis + Kaapi', planTitle: 'Filter Kaapi & Tiffin Pass' }
              ]).map((sub: any) => {
                const isDelivered = deliveredIds.has(sub.id);
                return (
                  <div
                    key={sub.id}
                    className="p-2.5 rounded-xl bg-[#121212] border border-[#262626] flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#F0F0F0]">
                        {sub.userName} (+91 {sub.userPhone?.slice(-10)})
                      </div>
                      <div className="text-[10px] text-[#8E8E93] font-mono">
                        {sub.specialInstructions || sub.planTitle}
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleDelivered(sub.id)}
                      className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border font-bold transition-all ${
                        isDelivered
                          ? 'bg-[#E2FF3B]/20 text-[#E2FF3B] border-[#E2FF3B]/30'
                          : 'bg-[#2C2C2E] text-[#8E8E93] border-[#3C3C3E]'
                      }`}
                    >
                      {isDelivered ? '✓ DELIVERED' : 'MARK SERVED'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {statusMsg && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-mono text-[#E2FF3B] bg-[#E2FF3B]/10 border border-[#E2FF3B]/20 rounded-xl p-3 text-center"
            >
              {statusMsg}
            </motion.p>
          )}
        </div>
      </motion.div>
    </div>
  );
};
