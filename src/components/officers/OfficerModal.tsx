"use client"

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { X, GraduationCap, Globe, Users } from 'lucide-react';
import type { Officer } from '@/hooks/useGoogleDriveCMS';

interface OfficerModalProps {
  officer: Officer | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function OfficerModal({ officer, isOpen, onClose }: OfficerModalProps) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, onClose]);

  // Reset image error state when officer changes
  useEffect(() => {
    setImageError(false);
  }, [officer]);

  const handleImageError = () => {
    if (officer) {
      console.error(`Failed to load modal image for ${officer.name}: ${officer.image}`);
    }
    setImageError(true);
  };

  const handleImageLoad = () => {
    if (officer) {
      console.log(`Successfully loaded modal image for ${officer.name}`);
    }
    setImageError(false);
  };

  if (!isOpen || !officer) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-card rounded-2xl shadow-card-elevated max-w-md w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 hover:bg-background transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Close modal"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
          
          <div className="p-6 sm:p-8 pb-4 text-center">
            <div className="flex justify-center items-center">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-4 sm:mb-6">
                <div className="rounded-full overflow-hidden w-full h-full relative ring-4 ring-primary/20">
                  {!imageError ? (
                    <Image
                      src={officer.image}
                      alt={`${officer.name} - ${officer.role}`}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 640px) 112px, 128px"
                      priority
                      onError={handleImageError}
                      onLoad={handleImageLoad}
                    />
                  ) : (
                    <div className="w-full h-full bg-muted/50 flex items-center justify-center">
                      <Users className="h-12 w-12 text-primary/60" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 sm:px-8 pb-6 sm:pb-8">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 leading-tight">
              {officer.name}
            </h2>
            <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-primary/10 text-primary rounded-full font-medium text-sm sm:text-base">
              {officer.role}
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4 mb-6">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors duration-200">
              <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">Major</p>
                <p className="font-medium text-foreground text-sm sm:text-base leading-tight">
                  {officer.major}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors duration-200">
              <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">Home Country</p>
                <p className="font-medium text-foreground text-sm sm:text-base leading-tight">
                  <span className="mr-2">{officer.countryFlag}</span>
                  {officer.homeCountry}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-primary/5 border-l-4 border-primary">
            <p className="text-muted-foreground text-xs sm:text-sm mb-2 font-medium">Personal Quote</p>
            <blockquote className="text-foreground font-medium italic text-sm sm:text-base leading-relaxed">
              &ldquo;{officer.quote}&rdquo;
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  );
}