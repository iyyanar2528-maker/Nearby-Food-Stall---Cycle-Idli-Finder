import React, { useState } from 'react';

interface FastImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export const FastImage: React.FC<FastImageProps> = ({
  src,
  alt,
  className = '',
  priority = false,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-[#141414] ${className}`}>
      {/* Shimmer skeleton before loaded */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-[#141414] animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#262626] border-t-[#E2FF3B] animate-spin opacity-60" />
        </div>
      )}

      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {hasError && (
        <div className="absolute inset-0 bg-[#141414] flex flex-col items-center justify-center text-[#8E8E93] text-xs p-4 text-center font-mono">
          <span className="text-[#D4D4D8] font-bold mb-1">Image Preview</span>
          <span>{alt}</span>
        </div>
      )}
    </div>
  );
};
