"use client"

import React, { useState } from 'react';
import Image from 'next/image';
import type { Officer } from '@/lib/google-drive/types';
import { Users } from 'lucide-react';

interface OfficerCardProps {
  officer: Officer;
  onClick: (officer: Officer) => void;
}

// Next.js Image component with fallback for officer photos
function OfficerImage({ src, alt }: { src: string; alt: string }) {
  const [imageError, setImageError] = useState(false);

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
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        onError={() => setImageError(true)}
        priority={false}
      />

      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300"></div>
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
        <OfficerImage
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