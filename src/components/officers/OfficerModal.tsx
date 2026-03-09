"use client"

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GraduationCap, Globe, Users, Briefcase } from 'lucide-react';
import type { Officer } from '@/lib/google-drive/types';

interface OfficerModalProps {
  officer: Officer | null;
  isOpen: boolean;
  onClose: () => void;
}

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

  const getFileIdFromUrl = (url: string) => url.match(/[?&]id=([^&]+)/)?.[1] ?? null;

  const getAlternativeUrls = (originalUrl: string): string[] => {
    const fileId = getFileIdFromUrl(originalUrl);
    if (!fileId) return [originalUrl];
    return [
      `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200-h600`,
      `https://lh3.googleusercontent.com/d/${fileId}=w1200-h600`,
      `https://drive.google.com/thumbnail?id=${fileId}&sz=w800-h400`,
      `https://lh3.googleusercontent.com/d/${fileId}=s1200`,
      `https://drive.google.com/thumbnail?id=${fileId}&sz=w600-h300`,
      originalUrl,
    ];
  };

  const handleImageError = () => {
    if (src.includes('drive.google.com') && attemptCount < 5) {
      const next = getAlternativeUrls(src)[attemptCount + 1];
      if (next) { setAttemptCount(p => p + 1); setCurrentSrc(next); setImageLoading(true); return; }
    }
    setImageError(true);
    setImageLoading(false);
    onError?.();
  };

  const handleImageLoad = () => { setImageError(false); setImageLoading(false); onLoad?.(); };

  useEffect(() => {
    setImageError(false); setImageLoading(true); setCurrentSrc(src); setAttemptCount(0);
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      {imageLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors duration-200 border border-border/50">
      <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground font-medium mb-0.5">{label}</p>
        <p className="font-semibold text-foreground text-sm leading-tight">{value}</p>
      </div>
    </div>
  );
}

export default function OfficerModal({ officer, isOpen, onClose }: OfficerModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      const currentUrl = window.location.href;
      const officerParam = officer ? `officer=${encodeURIComponent(officer.name)}` : '';
      const newUrl = `${currentUrl}${currentUrl.includes('?') ? '&' : '?'}${officerParam}`;
      window.history.pushState({ modal: 'officer', officer: officer?.name }, '', newUrl);

      const handlePopState = (e: PopStateEvent) => { if (!e.state?.modal) onClose(); };
      window.addEventListener('popstate', handlePopState);
      return () => {
        document.removeEventListener('keydown', handleEscape);
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isOpen, onClose, officer]);

  const handleClose = () => { window.history.back(); onClose(); };

  const isAdvisor = officer
    ? officer.name.toLowerCase().includes('yunju') || officer.role.toLowerCase().includes('advisor')
    : false;

  return (
    <AnimatePresence>
      {isOpen && officer && (
        <motion.div
          className="fixed inset-0 z-[9999] overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleClose}
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)' }}
        >
          <div className="min-h-full flex items-center justify-center p-4 py-8">
            <motion.div
              className="relative bg-card rounded-2xl shadow-card-elevated max-w-2xl w-full border border-border overflow-hidden my-8"
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent z-10" />

              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm border border-white/10 transition-colors duration-200"
                aria-label="Close modal"
              >
                <X className="h-4 w-4 text-white" />
              </button>

              {/* Banner image */}
              <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden">
                <ModalSmartImage src={officer.image} alt={`${officer.name} - ${officer.role}`} />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                    {officer.name}
                  </h2>
                  <div className="inline-flex items-center bg-primary/90 backdrop-blur-sm text-white px-4 py-1.5 rounded-full font-semibold text-sm mb-2">
                    {officer.role}
                  </div>
                  <p className="text-white/80 text-sm drop-shadow">{officer.year}</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 sm:p-8 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InfoRow
                    icon={isAdvisor ? Briefcase : GraduationCap}
                    label={isAdvisor ? 'Role' : 'Major'}
                    value={isAdvisor ? 'Asst. Director International Programs and Communications' : officer.major}
                  />
                  <InfoRow
                    icon={Globe}
                    label="Home Country"
                    value={<><span className="mr-1.5">{officer.countryFlag}</span>{officer.homeCountry}</>}
                  />
                </div>

                {/* Quote */}
                <div className="relative p-6 rounded-xl bg-primary/5 border border-primary/15 overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent rounded-full" />
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest mb-3 ml-3">Personal Quote</p>
                  <blockquote className="text-foreground font-medium italic text-base sm:text-lg leading-relaxed ml-3">
                    &ldquo;{officer.quote}&rdquo;
                  </blockquote>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
