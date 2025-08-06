"use client"

import React, { useEffect, useState } from 'react';
import { X, GraduationCap, Globe, Users, Briefcase } from 'lucide-react';
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
      `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200-h600`, // Large banner format
      `https://lh3.googleusercontent.com/d/${fileId}=w1200-h600`, // Google User Content format
      `https://drive.google.com/thumbnail?id=${fileId}&sz=w800-h400`, // Medium banner
      `https://lh3.googleusercontent.com/d/${fileId}=s1200`, // Alternative format
      `https://drive.google.com/thumbnail?id=${fileId}&sz=w600-h300`, // Smaller banner fallback
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
      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex flex-col items-center justify-center">
        <Users className="h-20 w-20 text-primary/60 mb-3" />
        <p className="text-sm text-primary/60 font-medium">Photo unavailable</p>
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
      
      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
      
      {imageLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}

export default function OfficerModal({ officer, isOpen, onClose }: OfficerModalProps) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      
      // Browser history management
      const currentUrl = window.location.href;
      const officerParam = officer ? `officer=${encodeURIComponent(officer.name)}` : '';
      const newUrl = `${currentUrl}${currentUrl.includes('?') ? '&' : '?'}${officerParam}`;
      
      // Push new state for modal
      window.history.pushState({ modal: 'officer', officer: officer?.name }, '', newUrl);
      
      // Handle browser back button
      const handlePopState = (event: PopStateEvent) => {
        if (!event.state?.modal) {
          onClose();
        }
      };
      
      window.addEventListener('popstate', handlePopState);
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isOpen, onClose, officer]);

  // Handle closing modal
  const handleClose = () => {
    // Go back in history to remove modal state
    window.history.back();
    onClose();
  };

  if (!isOpen || !officer) {
    return null;
  }

  // Check if this is Yunju (the advisor)
  const isAdvisor = officer.name.toLowerCase().includes('yunju') || officer.role.toLowerCase().includes('advisor');

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto modal-backdrop"
      onClick={handleClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 9999
      }}
    >
      {/* Scrollable container - positions modal near current scroll position */}
      <div className="min-h-full flex items-center justify-center p-4 py-8">
        <div 
          className="bg-card rounded-2xl shadow-card-elevated max-w-2xl w-full transform transition-all duration-300 scale-100 relative my-8 modal-content border border-border"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close modal"
          >
            <X className="h-5 w-5 text-white" />
          </button>
          
          {/* Large Banner Image Section */}
          <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden rounded-t-2xl">
            <ModalSmartImage
              src={officer.image}
              alt={`${officer.name} - ${officer.role}`}
            />
            
            {/* Name and role overlay on image */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <div className="text-white">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 drop-shadow-lg">
                  {officer.name}
                </h2>
                <div className="inline-flex items-center bg-primary/90 backdrop-blur-sm text-white px-4 py-2 rounded-full font-medium text-sm sm:text-base mb-2">
                  {officer.role}
                </div>
                <p className="text-white/90 font-medium drop-shadow">
                  {officer.year}
                </p>
              </div>
            </div>
          </div>

          {/* Content section */}
          <div className="p-6 sm:p-8 bg-card text-foreground">
            <div className="space-y-6">
              {/* Academic/Professional and Personal Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors duration-200">
                  <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                    {isAdvisor ? (
                      <Briefcase className="h-5 w-5 text-primary" />
                    ) : (
                      <GraduationCap className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground font-medium">
                      {isAdvisor ? 'Role' : 'Major'}
                    </p>
                    <p className="font-medium text-foreground text-sm leading-tight">
                      {isAdvisor ? 'Asst. Director International Programs and Communications' : officer.major}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors duration-200">
                  <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground font-medium">Home Country</p>
                    <p className="font-medium text-foreground text-sm leading-tight">
                      <span className="mr-2">{officer.countryFlag}</span>
                      {officer.homeCountry}
                    </p>
                  </div>
                </div>
              </div>

              {/* Personal Quote */}
              <div className="p-6 rounded-xl bg-primary/5 border-l-4 border-primary">
                <p className="text-muted-foreground text-sm mb-3 font-medium">Personal Quote</p>
                <blockquote className="text-foreground font-medium italic text-base sm:text-lg leading-relaxed">
                  &ldquo;{officer.quote}&rdquo;
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}