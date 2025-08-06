"use client"

import React, { useEffect, useState } from 'react';
import { X, Users, GraduationCap, Globe } from 'lucide-react';
import type { OfficerProfile } from '@/data/history';

interface HistoryOfficerModalProps {
  officer: (OfficerProfile & { currentRole?: string }) | null;
  isOpen: boolean;
  onClose: () => void;
  boardId?: string | null; // Allow both undefined and null
}

// Smart Image component for history officers
function HistoryModalSmartImage({ src, alt, onLoad, onError }: { 
  src: string; 
  alt: string; 
  onLoad?: () => void; 
  onError?: () => void; 
}) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    console.error(`History Modal: Failed to load image: ${src}`);
    setImageError(true);
    setImageLoading(false);
    if (onError) onError();
  };

  const handleImageLoad = () => {
    console.log(`History Modal: Successfully loaded image: ${src}`);
    setImageError(false);
    setImageLoading(false);
    if (onLoad) onLoad();
  };

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
        src={src}
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

export default function HistoryOfficerModal({ officer, isOpen, onClose, boardId }: HistoryOfficerModalProps) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      
      // Browser history management
      const currentUrl = new URL(window.location.href);
      
      // Build search params
      const searchParams = new URLSearchParams(currentUrl.search);
      if (officer) {
        searchParams.set('officer', officer.name);
      }
      if (boardId) {
        searchParams.set('board', boardId);
      }
      
      const newUrl = `${currentUrl.pathname}#history?${searchParams.toString()}`;
      
      // Push new state for modal
      window.history.pushState({ 
        modal: 'history-officer', 
        officer: officer?.name,
        board: boardId 
      }, '', newUrl);
      
      // Handle browser back button
      const handlePopState = (event: PopStateEvent) => {
        if (!event.state?.modal || event.state?.modal !== 'history-officer') {
          onClose();
        }
      };
      
      window.addEventListener('popstate', handlePopState);
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isOpen, onClose, officer, boardId]);

  // Handle closing modal
  const handleClose = () => {
    // Don't use history.back() - just close the modal and update URL appropriately
    onClose();
    
    // Remove officer from URL but keep board if present
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.delete('officer');
    const newSearch = urlParams.toString();
    const newUrl = `${window.location.pathname}#history${newSearch ? '?' + newSearch : ''}`;
    window.history.replaceState(boardId ? { board: boardId } : {}, '', newUrl);
  };

  if (!isOpen || !officer) return null;

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
      {/* Scrollable container */}
      <div className="min-h-full flex items-start justify-center p-4 py-8">
        <div 
          className="bg-card rounded-2xl shadow-card-elevated max-w-3xl w-full transform transition-all duration-300 scale-100 relative my-8 modal-content border border-border"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm transition-colors duration-200"
            aria-label="Close modal"
          >
            <X className="h-5 w-5 text-white" />
          </button>
          
          {/* Large Banner Image Section */}
          <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden rounded-t-2xl">
            {officer.hasPhoto && officer.image ? (
              <HistoryModalSmartImage
                src={officer.image}
                alt={`${officer.name}`}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex flex-col items-center justify-center">
                <Users className="h-20 w-20 text-primary/60 mb-3" />
                <p className="text-sm text-primary/60 font-medium">Photo unavailable</p>
              </div>
            )}
            
            {/* Name and basic info overlay on image */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <div className="text-white">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 drop-shadow-lg">
                  {officer.name}
                </h2>
                <div className="flex flex-wrap gap-3 items-center">
                  <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                    <GraduationCap className="h-4 w-4 text-white" />
                    <span className="text-white text-sm font-medium">{officer.major}</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                    <Globe className="h-4 w-4 text-white" />
                    <span className="text-white text-sm font-medium">{officer.countryFlag} {officer.homeCountry}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content section */}
          <div className="p-6 sm:p-8 bg-card text-foreground">
            {/* Role progression timeline */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                <div className="w-1 h-6 bg-primary rounded-full mr-3"></div>
                ISAB Journey
              </h3>
              <div className="space-y-3">
                {officer.roles.map((roleInfo, idx) => (
                  <div key={idx} className="flex items-center space-x-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors duration-200">
                    <div className="w-3 h-3 bg-primary rounded-full flex-shrink-0"></div>
                    <div className="flex-grow">
                      <span className="font-semibold text-foreground text-lg">{roleInfo.role}</span>
                      <span className="text-muted-foreground text-sm ml-3">({roleInfo.period})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Overall contributions */}
            <div className="p-6 rounded-xl bg-primary/5 border-l-4 border-primary">
              <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <div className="w-1 h-5 bg-primary rounded-full mr-3"></div>
                Overall Contributions to ISAB
              </h4>
              <ul className="space-y-3">
                {officer.overallContributions.map((contribution, idx) => (
                  <li key={idx} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-muted-foreground leading-relaxed">{contribution}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}