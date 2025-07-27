"use client"

import React, { useState, useEffect } from 'react';
import type { Officer } from '@/hooks/useGoogleDriveCMS';
import { Users } from 'lucide-react';

interface OfficerCardProps {
  officer: Officer;
  onClick: (officer: Officer) => void;
}

// Smart Image component that handles Google Drive URLs with fallbacks
function SmartImage({ src, alt, onLoad, onError }: { 
  src: string; 
  alt: string; 
  onLoad?: () => void; 
  onError?: () => void; 
}) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [attemptCount, setAttemptCount] = useState(0);

  // Extract file ID from Google Drive URL
  const getFileIdFromUrl = (url: string): string | null => {
    const match = url.match(/[?&]id=([^&]+)/);
    return match ? match[1] : null;
  };

  // Generate different URL formats for Google Drive
  const getAlternativeUrls = (originalUrl: string): string[] => {
    const fileId = getFileIdFromUrl(originalUrl);
    if (!fileId) return [originalUrl];

    return [
      originalUrl, // Original URL
      `https://drive.google.com/uc?export=download&id=${fileId}`, // Download format
      `https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h400`, // Thumbnail format
      `https://lh3.googleusercontent.com/d/${fileId}`, // Google User Content format
      `https://drive.google.com/uc?export=view&id=${fileId}`, // View format
    ];
  };

  const handleImageError = () => {
    const isGoogleDriveUrl = src.includes('drive.google.com');
    
    if (isGoogleDriveUrl && attemptCount < 4) {
      // Try alternative URL formats
      const alternatives = getAlternativeUrls(src);
      const nextUrl = alternatives[attemptCount + 1];
      
      if (nextUrl) {
        console.log(`Trying alternative URL ${attemptCount + 1} for ${alt}: ${nextUrl}`);
        setAttemptCount(prev => prev + 1);
        setCurrentSrc(nextUrl);
        setImageLoading(true);
        return; // Don't set error yet, try the next URL
      }
    }

    console.error(`All attempts failed for image: ${src}`);
    setImageError(true);
    setImageLoading(false);
    if (onError) onError();
  };

  const handleImageLoad = () => {
    console.log(`Successfully loaded image: ${currentSrc}`);
    setImageError(false);
    setImageLoading(false);
    if (onLoad) onLoad();
  };

  // Reset when src changes
  React.useEffect(() => {
    setImageError(false);
    setImageLoading(true);
    setCurrentSrc(src);
    setAttemptCount(0);
  }, [src]);

  if (imageError) {
    return (
      <div className="w-full h-full bg-white/10 flex items-center justify-center">
        <Users className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-white/60" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={currentSrc}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
        crossOrigin="anonymous"
      />
      
      {imageLoading && (
        <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}

export default function OfficerCard({ officer, onClick }: OfficerCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageError(false);
    setImageLoading(false);
  };

  const handleClick = () => {
    onClick(officer);
  };

  return (
    <div
      onClick={handleClick}
      className="group transition-all duration-300 hover:shadow-card-elevated border border-border bg-primary-gradient hover:-translate-y-2 cursor-pointer rounded-lg overflow-hidden w-full"
    >
      <div className="p-6 sm:p-8 text-center flex flex-col items-center justify-center h-full">
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 mx-auto mb-4 sm:mb-6 flex-shrink-0">
          <div className="rounded-full overflow-hidden w-full h-full relative transition-all duration-300 ring-2 ring-white/20 group-hover:ring-white/40">
            <SmartImage
              src={officer.image}
              alt={`${officer.name} - ${officer.role}`}
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center text-center space-y-1 sm:space-y-2">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2 leading-tight">
            {officer.name}
          </h3>
          <p className="text-white/90 font-medium text-sm sm:text-base mb-1">
            {officer.role}
          </p>
          <p className="text-white/70 text-xs sm:text-sm mb-3 sm:mb-4">
            {officer.year}
          </p>
        </div>
        
        <div className="mt-2 sm:mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="text-xs sm:text-sm text-white font-medium">
            Click to view bio →
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="absolute top-2 right-2 z-10">
            <div 
              className={`w-3 h-3 rounded-full ${
                imageError ? 'bg-red-500' : imageLoading ? 'bg-yellow-500' : 'bg-green-500'
              }`} 
              title={
                imageError ? 'Image failed to load' : imageLoading ? 'Image loading' : 'Image loaded successfully'
              } 
            />
          </div>
        )}
      </div>
    </div>
  );
}