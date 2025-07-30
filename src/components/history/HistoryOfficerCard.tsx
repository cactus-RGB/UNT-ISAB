"use client"

import React, { useState } from 'react';
import Image from 'next/image';
import { Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { OfficerProfile } from '@/data/history';

interface HistoryOfficerCardProps {
  officer: {
    id: string;
    role: string;
  };
  profile: OfficerProfile;
  onClick: (officerId: string, role: string) => void;
}

// Smart Image component for history officer cards
function HistoryCardImage({ src, alt, hasPhoto }: { 
  src?: string; 
  alt: string; 
  hasPhoto: boolean;
}) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    console.error(`History Card: Failed to load image: ${src}`);
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    console.log(`History Card: Successfully loaded image: ${src}`);
    setImageError(false);
    setImageLoading(false);
  };

  if (!hasPhoto || !src || imageError) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex flex-col items-center justify-center">
        <Users className="h-16 w-16 text-primary/60 mb-2" />
        <p className="text-xs text-primary/60 font-medium">Photo unavailable</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <Image
        src={src}
        alt={alt}
        fill
        style={{ objectFit: 'cover' }}
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
        className="transition-transform duration-500 group-hover:scale-105"
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
      
      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300"></div>
      
      {imageLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}

export default function HistoryOfficerCard({ officer, profile, onClick }: HistoryOfficerCardProps) {
  const handleClick = () => {
    onClick(officer.id, officer.role);
  };

  return (
    <Card 
      className="group transition-all duration-300 hover:shadow-card-elevated border-border bg-card cursor-pointer hover:-translate-y-1 overflow-hidden"
      onClick={handleClick}
    >
      {/* Full Card Image - No content section */}
      <div className="relative h-64 sm:h-72 md:h-80 overflow-hidden">
        <HistoryCardImage
          src={profile.image}
          alt={`${profile.name} - ${officer.role}`}
          hasPhoto={profile.hasPhoto}
        />
        
        {/* Hover overlay with click hint */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <p className="text-xs font-medium text-gray-800">Click for full bio</p>
          </div>
        </div>

        {/* Text overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="text-white">
            {/* Name */}
            <h3 className="text-lg sm:text-xl font-bold mb-2 drop-shadow-lg">
              {profile.name}
            </h3>
            
            {/* Role */}
            <div className="inline-flex items-center bg-primary/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium mb-1">
              {officer.role}
            </div>
            
            {/* Quick info badges */}
            <div className="flex flex-wrap gap-1 mt-2">
              <span className="text-xs bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded-full">
                {profile.countryFlag} {profile.homeCountry}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}