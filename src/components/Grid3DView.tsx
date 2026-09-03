import React from 'react';
import { FoodSpot, LanguageCode } from '../types';
import { Card3DItem } from './Card3DItem';

interface Grid3DViewProps {
  spots: FoodSpot[];
  savedSpotIds: Set<string>;
  onNavigate: (spot: FoodSpot) => void;
  onOpenDetails: (spot: FoodSpot) => void;
  onToggleSave: (spot: FoodSpot) => void;
  currentLang?: LanguageCode;
}

export const Grid3DView: React.FC<Grid3DViewProps> = ({
  spots,
  savedSpotIds,
  onNavigate,
  onOpenDetails,
  onToggleSave,
  currentLang = 'en',
}) => {
  if (spots.length === 0) {
    return (
      <div className="py-16 text-center text-[#8E8E93] font-mono">
        <p className="text-sm font-semibold text-[#D4D4D8]">
          {currentLang === 'ta' ? 'தேர்ந்தெடுக்கப்பட்ட வடிகட்டிகளில் உணவுக் கடைகள் எதுவும் கிடைக்கவில்லை.' : currentLang === 'hi' ? 'चुने गए फिल्टर में कोई फूड स्टॉल नहीं मिला।' : 'No low-budget food spots found with the selected filters.'}
        </p>
        <p className="text-xs text-[#71717A] mt-1">
          {currentLang === 'ta' ? 'சுற்றளவை 150மீ என மாற்றி முயற்சிக்கவும்.' : currentLang === 'hi' ? 'दूरी 150m तक बढ़ाकर देखें।' : 'Try widening the radius to 150m or clearing price filters.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl mx-auto pb-12">
      {spots.map((spot, idx) => (
        <div key={spot.id} className="w-full flex justify-center">
          <Card3DItem
            spot={spot}
            onNavigate={onNavigate}
            onOpenDetails={onOpenDetails}
            onToggleSave={onToggleSave}
            isSaved={savedSpotIds.has(spot.id)}
            priority={idx < 4}
            interactiveTilt={true}
            currentLang={currentLang}
          />
        </div>
      ))}
    </div>
  );
};
