"use client"

import React, { useEffect } from 'react';
import Image from 'next/image';
import { X, Users, GraduationCap, Globe } from 'lucide-react';
import type { OfficerProfile } from '@/data/history';

interface HistoryOfficerModalProps {
  officer: (OfficerProfile & { currentRole?: string }) | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function HistoryOfficerModal({ officer, isOpen, onClose }: HistoryOfficerModalProps) {
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

  if (!isOpen || !officer) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-card rounded-2xl shadow-card-elevated max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with close button */}
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 hover:bg-background transition-colors duration-200"
            aria-label="Close modal"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
          
          {/* Profile image */}
          <div className="p-8 pb-4 text-center">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="rounded-full overflow-hidden w-32 h-32 relative ring-4 ring-primary/20">
                {officer.hasPhoto && officer.image ? (
                  <Image
                    src={officer.image}
                    alt={`${officer.name}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="128px"
                    priority
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

        {/* Content */}
        <div className="px-8 pb-8">
          {/* Name and basic info */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">{officer.name}</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-3">
                <GraduationCap className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">{officer.major}</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <Globe className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">{officer.countryFlag} {officer.homeCountry}</span>
              </div>
            </div>
          </div>

          {/* Role progression timeline */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-3">ISAB Journey</h3>
            <div className="space-y-2">
              {officer.roles.map((roleInfo, idx) => (
                <div key={idx} className="flex items-center space-x-3 p-2 rounded-lg bg-muted/30">
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                  <div className="flex-grow">
                    <span className="font-medium text-foreground">{roleInfo.role}</span>
                    <span className="text-muted-foreground text-sm ml-2">({roleInfo.period})</span>
                  </div>
                  {roleInfo.role === officer.currentRole && (
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">Current View</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Overall contributions */}
          <div className="p-4 rounded-lg bg-primary/5 border-l-4 border-primary">
            <h4 className="font-semibold text-foreground mb-3">Overall Contributions to ISAB</h4>
            <ul className="space-y-2">
              {officer.overallContributions.map((contribution, idx) => (
                <li key={idx} className="flex items-start">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-muted-foreground leading-relaxed text-sm">{contribution}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}