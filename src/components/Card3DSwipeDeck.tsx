import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence, PanInfo } from 'motion/react';
import { FoodSpot, LanguageCode } from '../types';
import { Card3DItem } from './Card3DItem';
import { RotateCcw, X, Heart, Navigation, Sparkles, RefreshCw, Compass } from 'lucide-react';
import { sound } from '../utils/audioFeedback';
import { TRANSLATIONS } from '../data/translations';

interface Card3DSwipeDeckProps {
  spots: FoodSpot[];
  savedSpotIds: Set<string>;
  onToggleSave: (spot: FoodSpot) => void;
  onNavigate: (spot: FoodSpot) => void;
  onOpenDetails: (spot: FoodSpot) => void;
  onOpenChat?: (spot: FoodSpot) => void;
  onResetDeck: () => void;
  currentLang?: LanguageCode;
}

export const Card3DSwipeDeck: React.FC<Card3DSwipeDeckProps> = ({
  spots,
  savedSpotIds,
  onToggleSave,
  onNavigate,
  onOpenDetails,
  onOpenChat,
  onResetDeck,
  currentLang = 'en',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | null>(null);
  const t = TRANSLATIONS[currentLang];

  const activeSpot = spots[currentIndex];
  const nextSpot = spots[currentIndex + 1];
  const thirdSpot = spots[currentIndex + 2];

  // Motion values for the top card drag
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // 3D Rotations tied to drag offset
  const rotateZ = useTransform(x, [-250, 250], [-18, 18]);
  const rotateY = useTransform(x, [-250, 250], [-15, 15]);
  const cardOpacity = useTransform(x, [-300, -150, 0, 150, 300], [0.3, 0.9, 1, 0.9, 0.3]);

  // Visual cues on swipe
  const likeBadgeOpacity = useTransform(x, [20, 120], [0, 1]);
  const skipBadgeOpacity = useTransform(x, [-20, -120], [0, 1]);
  const walkBadgeOpacity = useTransform(y, [-20, -100], [0, 1]);

  const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    const velocityThreshold = 400;

    if (info.offset.x > threshold || info.velocity.x > velocityThreshold) {
      // Swiped Right -> Save/Like
      sound.playSwipe();
      setSwipeDirection('right');
      if (activeSpot) onToggleSave(activeSpot);
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setSwipeDirection(null);
        x.set(0);
        y.set(0);
      }, 200);
    } else if (info.offset.x < -threshold || info.velocity.x < -velocityThreshold) {
      // Swiped Left -> Skip
      sound.playSwipe();
      setSwipeDirection('left');
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setSwipeDirection(null);
        x.set(0);
        y.set(0);
      }, 200);
    } else if (info.offset.y < -120 || info.velocity.y < -velocityThreshold) {
      // Swiped Up -> Direct Navigation
      sound.playSuccess();
      setSwipeDirection('up');
      if (activeSpot) onNavigate(activeSpot);
      setTimeout(() => {
        setSwipeDirection(null);
        x.set(0);
        y.set(0);
      }, 200);
    } else {
      // Bounce back to center
      x.set(0);
      y.set(0);
    }
  };

  const handleButtonAction = (direction: 'left' | 'right' | 'up') => {
    if (!activeSpot) return;
    if (direction === 'right') {
      sound.playSwipe();
      setSwipeDirection('right');
      onToggleSave(activeSpot);
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setSwipeDirection(null);
      }, 250);
    } else if (direction === 'left') {
      sound.playSwipe();
      setSwipeDirection('left');
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setSwipeDirection(null);
      }, 250);
    } else if (direction === 'up') {
      sound.playSuccess();
      onNavigate(activeSpot);
    }
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      sound.playClick();
      setCurrentIndex((prev) => prev - 1);
    }
  };

  if (currentIndex >= spots.length || spots.length === 0) {
    return (
      <div className="w-full max-w-sm mx-auto h-[520px] rounded-3xl bg-[#141414] border border-[#262626] p-6 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden">
        <div className="w-16 h-16 rounded-3xl bg-[#E2FF3B]/15 border border-[#E2FF3B]/30 flex items-center justify-center text-[#E2FF3B] mb-4 animate-bounce">
          <Sparkles className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-[#F0F0F0] mb-1 font-display">
          {currentLang === 'ta' ? 'அனைத்து உணவுக் கடைகளையும் பார்த்தீர்கள்!' : currentLang === 'hi' ? 'आपने सभी स्टॉल देख लिए!' : 'You Explored All Spots!'}
        </h3>
        <p className="text-xs text-[#8E8E93] max-w-xs mb-6">
          {currentLang === 'ta' ? 'இந்த சுற்றளவில் உள்ள அனைத்து உணவுக் கடைகளும் காட்டப்பட்டுவிட்டன.' : currentLang === 'hi' ? 'इस दूरी के सभी फूड स्टॉल देखे जा चुके हैं।' : 'You have seen every low-budget food gem within this proximity radius.'}
        </p>
        <button
          onClick={() => {
            sound.playClick();
            setCurrentIndex(0);
            onResetDeck();
          }}
          className="px-5 py-3 rounded-2xl bg-[#E2FF3B] hover:bg-[#d5f330] text-[#0A0A0A] font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-[#E2FF3B]/20 active:scale-95 transition-all font-display tracking-tight"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Restart Food Deck</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-sm mx-auto flex flex-col items-center">
      {/* 3D Stack Container */}
      <div className="relative w-full h-[535px] perspective-1200">
        {/* Layer 3: Backmost Card */}
        {thirdSpot && (
          <div
            className="absolute inset-0 w-full h-full pointer-events-none opacity-40 transition-all duration-300 transform scale-[0.88] translate-y-7 rounded-3xl overflow-hidden shadow-md"
            style={{ zIndex: 1 }}
          >
            <div className="w-full h-full bg-[#141414] border border-[#262626] rounded-3xl overflow-hidden">
              <img
                src={thirdSpot.thumbnail}
                alt=""
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover filter blur-[2px] opacity-40"
              />
            </div>
          </div>
        )}

        {/* Layer 2: Middle Card */}
        {nextSpot && (
          <div
            className="absolute inset-0 w-full h-full pointer-events-none opacity-75 transition-all duration-300 transform scale-[0.94] translate-y-3.5 rounded-3xl overflow-hidden shadow-lg"
            style={{ zIndex: 2 }}
          >
            <Card3DItem
              spot={nextSpot}
              onNavigate={() => {}}
              onOpenDetails={() => {}}
              onToggleSave={() => {}}
              isSaved={savedSpotIds.has(nextSpot.id)}
              priority={true}
              interactiveTilt={false}
              currentLang={currentLang}
            />
          </div>
        )}

        {/* Layer 1: Active Front Interactive Card with Drag Physics */}
        <AnimatePresence>
          {activeSpot && (
            <motion.div
              key={activeSpot.id}
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.8}
              onDragEnd={handleDragEnd}
              style={{
                x,
                y,
                rotateZ,
                rotateY,
                opacity: cardOpacity,
                zIndex: 10,
                cursor: 'grab',
              }}
              whileTap={{ cursor: 'grabbing' }}
              animate={
                swipeDirection === 'right'
                  ? { x: 500, opacity: 0, rotateZ: 25, transition: { duration: 0.25 } }
                  : swipeDirection === 'left'
                  ? { x: -500, opacity: 0, rotateZ: -25, transition: { duration: 0.25 } }
                  : swipeDirection === 'up'
                  ? { y: -500, opacity: 0, scale: 0.8, transition: { duration: 0.25 } }
                  : { x: 0, y: 0, opacity: 1 }
              }
              className="absolute inset-0 w-full h-full touch-none"
            >
              {/* Dynamic Swipe Overlays */}
              <motion.div
                style={{ opacity: likeBadgeOpacity }}
                className="pointer-events-none absolute top-8 right-6 z-50 px-4 py-2 rounded-2xl bg-[#E2FF3B] text-[#0A0A0A] font-black font-mono text-sm uppercase tracking-wider shadow-2xl border-2 border-black rotate-12 flex items-center gap-1.5"
              >
                <Heart className="w-4 h-4 fill-[#0A0A0A]" />
                <span>SAVE</span>
              </motion.div>

              <motion.div
                style={{ opacity: skipBadgeOpacity }}
                className="pointer-events-none absolute top-8 left-6 z-50 px-4 py-2 rounded-2xl bg-[#FF5238] text-white font-black font-mono text-sm uppercase tracking-wider shadow-2xl border-2 border-white -rotate-12 flex items-center gap-1.5"
              >
                <X className="w-4 h-4" />
                <span>PASS</span>
              </motion.div>

              <motion.div
                style={{ opacity: walkBadgeOpacity }}
                className="pointer-events-none absolute top-12 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-[#E2FF3B] text-[#0A0A0A] font-black font-mono text-sm uppercase tracking-wider shadow-2xl border-2 border-[#0A0A0A] flex items-center gap-1.5"
              >
                <Navigation className="w-4 h-4 fill-[#0A0A0A]" />
                <span>{t.walkNow}</span>
              </motion.div>

              {/* Render 3D Card with interactive hover tilt */}
              <Card3DItem
                spot={activeSpot}
                onNavigate={onNavigate}
                onOpenDetails={onOpenDetails}
                onToggleSave={onToggleSave}
                onOpenChat={onOpenChat}
                isSaved={savedSpotIds.has(activeSpot.id)}
                priority={true}
                interactiveTilt={true}
                currentLang={currentLang}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Tactical Swipe Controller Bar */}
      <div className="w-full flex items-center justify-center gap-4 mt-6 z-30">
        {/* Undo Button */}
        <button
          id="undo-btn"
          disabled={currentIndex === 0}
          onClick={handleUndo}
          aria-label="Undo last card"
          className="w-10 h-10 rounded-full bg-[#1C1C1E] border border-[#2E2E32] text-[#8E8E93] hover:text-[#F0F0F0] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-90"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Pass / Skip Button */}
        <button
          id="skip-btn"
          onClick={() => handleButtonAction('left')}
          aria-label="Skip to next spot"
          className="w-13 h-13 rounded-full bg-[#141414] border border-[#FF5238]/40 text-[#FF5238] hover:bg-[#FF5238]/15 flex items-center justify-center shadow-lg shadow-[#FF5238]/10 transition-all active:scale-90 hover:scale-105"
        >
          <X className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Walk Direction Quick Button */}
        <button
          id="walk-direct-btn"
          onClick={() => handleButtonAction('up')}
          aria-label="Walk to this spot"
          className="w-15 h-15 rounded-full bg-[#E2FF3B] text-[#0A0A0A] flex items-center justify-center shadow-xl shadow-[#E2FF3B]/30 transition-all active:scale-95 hover:scale-108 font-bold"
        >
          <Navigation className="w-7 h-7 fill-[#0A0A0A]" />
        </button>

        {/* Save / Like Button */}
        <button
          id="like-btn"
          onClick={() => handleButtonAction('right')}
          aria-label="Save this spot"
          className="w-13 h-13 rounded-full bg-[#141414] border border-[#E2FF3B]/40 text-[#E2FF3B] hover:bg-[#E2FF3B]/15 flex items-center justify-center shadow-lg shadow-[#E2FF3B]/10 transition-all active:scale-90 hover:scale-105"
        >
          <Heart className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Progress Counter */}
        <div className="w-10 h-10 rounded-full bg-[#1C1C1E] border border-[#2E2E32] text-[#D4D4D8] font-bold text-xs flex items-center justify-center font-mono">
          {currentIndex + 1}/{spots.length}
        </div>
      </div>
    </div>
  );
};
