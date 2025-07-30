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
      `https://drive.google.com/thumbnail?id=${fileId}&sz=w800-h600`, // Banner size format
      `https://lh3.googleusercontent.com/d/${fileId}=w800-h600`, // Google User Content format
      `https://drive.google.com/thumbnail?id=${fileId}&sz=w600-h450`, // Medium banner
      `https://lh3.googleusercontent.com/d/${fileId}=s800`, // Alternative format
      `https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h300`, // Smaller banner fallback
      originalUrl, // Original URL as last resort
    ];
  };

  const handleImageError = () => {
    const isGoogleDriveUrl = src.includes('drive.google.com');
    
    if (isGoogleDriveUrl && attemptCount < 5) {
      // Try alternative URL formats
      const alternatives = getAlternativeUrls(src);
      const nextUrl = alternatives[attemptCount + 1];
      
      if (nextUrl) {
        console.log(`Card: Trying alternative URL ${attemptCount + 1} for ${alt}: ${nextUrl}`);
        setAttemptCount(prev => prev + 1);
        setCurrentSrc(nextUrl);
        setImageLoading(true);
        return; // Don't set error yet, try the next URL
      }
    }

    console.error(`Card: All attempts failed for image: ${src}`);
    setImageError(true);
    setImageLoading(false);
    if (onError) onError();
  };

  const handleImageLoad = () => {
    console.log(`Card: Successfully loaded image: ${currentSrc}`);
    setImageError(false);
    setImageLoading(false);
    if (onLoad) onLoad();
  };

  // Reset when src changes
  useEffect(() => {
    setImageError(false);
    setImageLoading(true);
    setCurrentSrc(src);
    setAttemptCount(0);
  }, [src]);

  if (imageError) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex flex-col items-center justify-center">
        <Users className="h-16 w-16 text-primary/60 mb-2" />
        <p className="text-xs text-primary/60 font-medium">Photo unavailable</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={currentSrc}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
        crossOrigin="anonymous"
      />
      
      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300"></div>
      
      {imageLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}

export default function OfficerCard({ officer, onClick }: OfficerCardProps) {
  const handleClick = () => {
    onClick(officer);
  };

  return (
    <div
      onClick={handleClick}
      className="group transition-all duration-300 hover:shadow-card-elevated border border-border bg-card hover:-translate-y-2 cursor-pointer rounded-xl overflow-hidden w-full"
    >
      {/* Banner Image Section */}
      <div className="relative h-64 sm:h-72 md:h-80 overflow-hidden">
        <SmartImage
          src={officer.image}
          alt={`${officer.name} - ${officer.role}`}
        />
        
        {/* Hover overlay with click hint */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <p className="text-sm font-medium text-gray-800">Click to view bio</p>
          </div>
        </div>

        {/* Text overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="text-white">
            {/* Name */}
            <h3 className="text-xl sm:text-2xl font-bold mb-2 drop-shadow-lg">
              {officer.name}
            </h3>
            
            {/* Role */}
            <div className="inline-flex items-center bg-primary/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium mb-2">
              {officer.role}
            </div>
            
            {/* Year */}
            <p className="text-white/90 font-medium text-sm drop-shadow">
              {officer.year}
            </p>
          </div>
        </div>
      </div>

      {/* Development indicator */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 z-10">
          <div 
            className="w-3 h-3 rounded-full bg-blue-500"
            title="Google Drive image"
          />
        </div>
      )}
    </div>
  );
}