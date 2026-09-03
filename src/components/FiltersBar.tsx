import React from 'react';
import { RadiusFilter, PriceFilter, ViewMode, LanguageCode, StateRegion, SortOrder } from '../types';
import {
  Layers,
  Grid,
  Compass,
  Volume2,
  VolumeX,
  Flame,
  Search,
  IndianRupee,
  MapPin,
  ArrowUpDown,
  Bike
} from 'lucide-react';
import { sound } from '../utils/audioFeedback';
import { TRANSLATIONS } from '../data/translations';

interface FiltersBarProps {
  radius: RadiusFilter;
  setRadius: (r: RadiusFilter) => void;
  priceFilter: PriceFilter;
  setPriceFilter: (p: PriceFilter) => void;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  totalCount: number;
  currentLang: LanguageCode;
  selectedState: StateRegion;
  setSelectedState: (s: StateRegion) => void;
  sortOrder: SortOrder;
  setSortOrder: (s: SortOrder) => void;
  onlyMovingStalls: boolean;
  setOnlyMovingStalls: (m: boolean) => void;
}

const CATEGORIES = [
  'All',
  'Moving Cycle Stall',
  'Street Cart',
  'Fixed Stall',
  'Small Shop'
];

export const FiltersBar: React.FC<FiltersBarProps> = ({
  radius,
  setRadius,
  priceFilter,
  setPriceFilter,
  viewMode,
  setViewMode,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  soundEnabled,
  setSoundEnabled,
  totalCount,
  currentLang,
  selectedState,
  setSelectedState,
  sortOrder,
  setSortOrder,
  onlyMovingStalls,
  setOnlyMovingStalls,
}) => {
  const t = TRANSLATIONS[currentLang];

  const handleRadiusChange = (newRadius: RadiusFilter) => {
    sound.playClick();
    setRadius(newRadius);
  };

  const handlePriceChange = (newPrice: PriceFilter) => {
    sound.playClick();
    setPriceFilter(newPrice);
  };

  const handleViewChange = (newView: ViewMode) => {
    sound.playClick();
    setViewMode(newView);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    sound.soundEnabled = next;
    setSoundEnabled(next);
    if (next) sound.playClick();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3.5 mb-6">
      {/* Top Bar: Radius Pill Selector & View Modes & Sound Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Radius Segmented Control (50m - 150m) */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#141414] border border-[#262626] shadow-inner">
          <span className="text-[10px] font-mono font-bold text-[#8E8E93] uppercase tracking-wider pl-2 pr-1">
            {t.radiusLabel}:
          </span>
          {([50, 75, 100, 150] as RadiusFilter[]).map((r) => (
            <button
              key={r}
              id={`radius-filter-${r}`}
              onClick={() => handleRadiusChange(r)}
              className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
                radius === r
                  ? 'bg-[#E2FF3B] text-[#0A0A0A] shadow-md shadow-[#E2FF3B]/20'
                  : 'text-[#8E8E93] hover:text-[#F0F0F0] hover:bg-[#1F1F1F]'
              }`}
            >
              {r}m
            </button>
          ))}
        </div>

        {/* Region Selector: Maharashtra / Tamil Nadu / All */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#141414] border border-[#262626] shadow-inner">
          {[
            { key: 'all', label: currentLang === 'ta' ? 'அனைத்தும்' : currentLang === 'hi' ? 'सभी' : 'All' },
            { key: 'maharashtra', label: 'Maharashtra' },
            { key: 'tamil_nadu', label: 'Tamil Nadu' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => {
                sound.playClick();
                setSelectedState(item.key as StateRegion);
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                selectedState === item.key
                  ? 'bg-[#E2FF3B] text-[#0A0A0A] shadow-md'
                  : 'text-[#8E8E93] hover:text-[#F0F0F0]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* View Mode Switcher: 3D Swipe Deck vs 3D Grid vs Radar */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#141414] border border-[#262626] shadow-inner">
          <button
            id="view-deck-btn"
            onClick={() => handleViewChange('deck')}
            aria-label="3D Swipe Deck View"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'deck'
                ? 'bg-[#222222] text-[#E2FF3B] border border-[#E2FF3B]/30 shadow'
                : 'text-[#8E8E93] hover:text-[#F0F0F0]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.viewDeck}</span>
          </button>

          <button
            id="view-grid-btn"
            onClick={() => handleViewChange('grid')}
            aria-label="3D Tilt Grid View"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'grid'
                ? 'bg-[#222222] text-[#E2FF3B] border border-[#E2FF3B]/30 shadow'
                : 'text-[#8E8E93] hover:text-[#F0F0F0]'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.viewGrid}</span>
          </button>

          <button
            id="view-radar-btn"
            onClick={() => handleViewChange('radar')}
            aria-label="Proximity Radar View"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'radar'
                ? 'bg-[#222222] text-[#E2FF3B] border border-[#E2FF3B]/30 shadow'
                : 'text-[#8E8E93] hover:text-[#F0F0F0]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.viewRadar}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            aria-label={soundEnabled ? 'Mute haptics' : 'Enable haptics'}
            className="p-1.5 rounded-xl text-[#8E8E93] hover:text-[#E2FF3B] hover:bg-[#1F1F1F] transition-colors ml-1"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 opacity-40" />}
          </button>
        </div>
      </div>

      {/* Second Row: Price Threshold Chips & Price Low-to-High Sorting & Search Input */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Price filters in INR (₹) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar shrink-0">
          {[
            { key: 'all', label: t.allDeals },
            { key: 'under20', label: t.dealsUnder20 },
            { key: 'under40', label: t.dealsUnder40 },
            { key: 'under70', label: t.dealsUnder70 },
            { key: 'under100', label: t.dealsUnder100 },
          ].map((item) => (
            <button
              key={item.key}
              id={`price-filter-${item.key}`}
              onClick={() => handlePriceChange(item.key as PriceFilter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap border transition-all ${
                priceFilter === item.key
                  ? 'bg-[#E2FF3B]/15 border-[#E2FF3B] text-[#E2FF3B] shadow-sm'
                  : 'bg-[#141414] border-[#262626] text-[#8E8E93] hover:text-[#D4D4D8] hover:border-[#333333]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Sort selector: Low to High / High to Low / Nearest */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-[#141414] border border-[#262626] text-xs font-mono">
            <ArrowUpDown className="w-3 h-3 text-[#E2FF3B]" />
            <select
              value={sortOrder}
              onChange={(e) => {
                sound.playClick();
                setSortOrder(e.target.value as SortOrder);
              }}
              className="bg-transparent text-[#F0F0F0] text-xs font-bold focus:outline-none"
            >
              <option value="low_to_high" className="bg-[#121212]">{t.sortLowHigh}</option>
              <option value="high_to_low" className="bg-[#121212]">{t.sortHighLow}</option>
              <option value="nearest" className="bg-[#121212]">{t.sortNearest}</option>
            </select>
          </div>

          {/* Moving Cycle Only Filter toggle */}
          <button
            onClick={() => {
              sound.playClick();
              setOnlyMovingStalls(!onlyMovingStalls);
            }}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 border transition-all ${
              onlyMovingStalls
                ? 'bg-[#E2FF3B] text-[#0A0A0A] border-[#E2FF3B] shadow-md'
                : 'bg-[#141414] border-[#262626] text-[#8E8E93] hover:text-[#F0F0F0]'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Moving Cycle Only</span>
          </button>
        </div>
      </div>

      {/* Third Row: Search Input & Category Pills */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8E8E93] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-[#141414] border border-[#262626] text-xs text-[#F0F0F0] placeholder-[#555555] focus:outline-none focus:border-[#E2FF3B]/60 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8E8E93] hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar shrink-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                sound.playClick();
                setSelectedCategory(cat);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#222222] text-[#E2FF3B] border border-[#E2FF3B]/40'
                  : 'bg-[#141414] text-[#8E8E93] hover:text-[#D4D4D8] border border-[#262626]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
