"use client"

import React, { useEffect, useState } from 'react';
import { X, GraduationCap, Globe, Users } from 'lucide-react';
import type { Officer } from '@/hooks/useGoogleDriveCMS';

interface OfficerModalProps {
  officer: Officer | null;
  isOpen: boolean;
  onClose: () => void;
}

// Enhanced Smart Image component with Google Drive fallbacks
function ModalSmartImage({ src, alt, onLoad, onError }: { 
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
      `https://drive.google.com/thumbnail?id=${fileId}&sz=w500-h500`, // Thumbnail format (CORS-friendly)
      `https://lh3.googleusercontent.com/d/${fileId}=w500-h500`, // Google User Content format
      `https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h400`, // Smaller thumbnail
      `https://lh3.googleusercontent.com/d/${fileId}`, // Google User Content without size
      originalUrl, // Original URL as last resort
    ];
  };

  const handleImageError = () => {
    const isGoogleDriveUrl = src.includes('drive.google.com');
    
    if (isGoogleDriveUrl && attemptCount < 4) {
      // Try alternative URL formats
      const alternatives = getAlternativeUrls(src);
      const nextUrl = alternatives[attemptCount + 1];
      
      if (nextUrl) {
        console.log(`Modal: Trying alternative URL ${attemptCount + 1} for ${alt}: ${nextUrl}`);
        setAttemptCount(prev => prev + 1);
        setCurrentSrc(nextUrl);
        setImageLoading(true);
        return; // Don't set error yet, try the next URL
      }
    }

    console.error(`Modal: All attempts failed for image: ${src}`);
    setImageError(true);
    setImageLoading(false);
    if (onError) onError();
  };

  const handleImageLoad = () => {
    console.log(`Modal: Successfully loaded image: ${currentSrc}`);
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
      <div className="w-full h-full bg-muted/50 flex items-center justify-center">
        <Users className="h-12 w-12 text-primary/60" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={currentSrc}
        alt={alt}
        className="w-full h-full object-cover"
        onError={handleImageError}
        onLoad={handleImageLoad}
        crossOrigin="anonymous"
      />
      
      {imageLoading && (
        <div className="absolute inset-0 bg-muted/20 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}

export default function OfficerModal({ officer, isOpen, onClose }: OfficerModalProps) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      // Store current scroll position when modal opens
      setScrollY(window.scrollY);
      
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      // Prevent background scroll but maintain scroll position
      document.body.style.position = 'fixed';
      document.body.style.top = `-${window.scrollY}px`;
      document.body.style.width = '100%';
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
        // Restore scroll position when modal closes
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen, onClose, scrollY]);

  if (!isOpen || !officer) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
      onClick={onClose}
    >
      <div 
        className="bg-card rounded-2xl shadow-card-elevated max-w-md w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 mx-auto"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
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
                  <ModalSmartImage
                    src={officer.image}
                    alt={`${officer.name} - ${officer.role}`}
                  />
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