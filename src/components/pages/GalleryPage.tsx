"use client"

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Image as ImageIcon, X, Calendar, ImagePlus } from 'lucide-react';
import type { EventGallery } from '@/lib/google-drive/types';
import { fadeUp, staggerContainer, cardEntrance, smoothTransition, cardTransition, viewportOnce } from '@/lib/motion';

function GalleryImage({ src, alt, onClick, className }: {
  src: string; alt: string; onClick?: () => void; className?: string;
}) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div className={`bg-muted/50 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <ImageIcon className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} onClick={onClick}>
      <Image
        src={src}
        alt={alt}
        fill
        quality={100}
        className="object-cover transition-transform duration-500 group-hover:scale-110"
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        onError={() => setImageError(true)}
        priority={false}
        unoptimized
      />
    </div>
  );
}

interface GalleryPageProps {
  eventGalleries: EventGallery[];
}

export default function GalleryPage({ eventGalleries }: GalleryPageProps) {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const openEventGallery = (eventId: string) => { setSelectedEvent(eventId); setSelectedImageIndex(null); };
  const closeEventGallery = () => { setSelectedEvent(null); setSelectedImageIndex(null); };

  const currentEvent = selectedEvent ? eventGalleries.find(e => e.id === selectedEvent) : null;
  const currentImage = currentEvent && selectedImageIndex !== null ? currentEvent.images[selectedImageIndex] : null;

  const openLightbox = (index: number) => { setSelectedImageIndex(index); document.body.style.overflow = 'hidden'; };
  const closeLightbox = useCallback(() => { setSelectedImageIndex(null); document.body.style.overflow = 'unset'; }, []);
  const goToPrev = useCallback(() => {
    if (selectedImageIndex !== null && currentEvent)
      setSelectedImageIndex((selectedImageIndex - 1 + currentEvent.images.length) % currentEvent.images.length);
  }, [selectedImageIndex, currentEvent]);
  const goToNext = useCallback(() => {
    if (selectedImageIndex !== null && currentEvent)
      setSelectedImageIndex((selectedImageIndex + 1) % currentEvent.images.length);
  }, [selectedImageIndex, currentEvent]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { if (selectedImageIndex !== null) closeLightbox(); else if (selectedEvent) closeEventGallery(); }
      else if (selectedImageIndex !== null) {
        if (e.key === 'ArrowLeft') goToPrev();
        else if (e.key === 'ArrowRight') goToNext();
      }
    };
    document.addEventListener('keydown', handler);
    return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = 'unset'; };
  }, [selectedImageIndex, selectedEvent, closeLightbox, goToPrev, goToNext]);

  /* ── Event grid ───────────────────────────────────────────────── */
  if (!selectedEvent) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 w-full">
        <motion.div
          className="mb-10 sm:mb-14"
          initial="hidden" whileInView="visible" viewport={viewportOnce}
          variants={fadeUp} transition={smoothTransition}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-3 tracking-tight text-gradient pb-[0.15em]">
            Event Gallery
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl">
            Explore our vibrant community through photos from our events and gatherings
          </p>
        </motion.div>

        {eventGalleries.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border-2 border-dashed border-border">
            <ImageIcon className="h-16 w-16 text-muted-foreground/30 mx-auto mb-5" />
            <h3 className="text-xl font-bold text-foreground mb-2">No Event Galleries</h3>
            <p className="text-muted-foreground">Create event folders in Google Drive to see galleries here.</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            initial="hidden" whileInView="visible" viewport={viewportOnce}
            variants={staggerContainer}
          >
            {eventGalleries.map((event, index) => (
              <motion.div
                key={index}
                variants={cardEntrance}
                transition={cardTransition}
                className="group relative rounded-2xl border border-border bg-card overflow-hidden cursor-pointer card-hover-glow"
                whileHover={{ y: -6 }}
                onClick={() => openEventGallery(event.id)}
              >
                {/* Cover image */}
                <div className="relative h-64 overflow-hidden">
                  <GalleryImage src={event.coverImage} alt={event.title} className="w-full h-full" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-70 group-hover:opacity-85 transition-opacity duration-300" />

                  {/* Photo count */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-primary/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                    <ImagePlus className="h-3.5 w-3.5" />
                    {event.totalImages}
                  </div>

                  {/* Title overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">{event.title}</h3>
                    <div className="flex items-center gap-1.5 text-white/80 text-xs">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{event.date}</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-4 flex items-center justify-between">
                  <span className="text-primary font-semibold text-sm">View Gallery</span>
                  <ChevronRight className="h-4 w-4 text-primary transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    );
  }

  /* ── Individual event gallery ─────────────────────────────────── */
  if (currentEvent) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 w-full">
        <motion.div
          className="mb-10 sm:mb-14"
          initial="hidden" animate="visible"
          variants={fadeUp} transition={smoothTransition}
        >
          <Button
            variant="ghost"
            onClick={e => { e.preventDefault(); closeEventGallery(); }}
            className="mb-6 hover:bg-primary/10 group"
          >
            <ChevronLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
            <span className="font-semibold">All Galleries</span>
          </Button>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 text-foreground tracking-tight">
            {currentEvent.title}
          </h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1.5 text-sm"><Calendar className="h-4 w-4 text-primary" />{currentEvent.date}</span>
            <span className="flex items-center gap-1.5 text-sm"><ImagePlus className="h-4 w-4 text-primary" />{currentEvent.totalImages} photos</span>
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4"
          initial="hidden" animate="visible"
          variants={staggerContainer}
        >
          {currentEvent.images.map((image, index) => (
            <motion.div
              key={index}
              variants={cardEntrance}
              transition={{ ...cardTransition, delay: Math.min(index * 0.03, 0.3) }}
              className="group relative rounded-xl border border-border bg-card overflow-hidden cursor-pointer"
              whileHover={{ scale: 1.04, y: -3 }}
              onClick={() => openLightbox(index)}
            >
              <div className="relative aspect-square overflow-hidden">
                <GalleryImage src={image.url} alt={image.caption || `Photo ${index + 1}`} className="w-full h-full" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-2.5">
                    <ImageIcon className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Lightbox ──────────────────────────────────────────── */}
        <AnimatePresence>
          {selectedImageIndex !== null && currentImage && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(16px)' }}
            >
              {/* Close */}
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white border border-white/10"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Counter */}
              <div className="absolute top-4 left-4 z-20 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-semibold border border-white/10">
                {selectedImageIndex + 1} / {currentEvent.images.length}
              </div>

              {/* Nav */}
              {currentEvent.images.length > 1 && (
                <>
                  <button
                    onClick={e => { e.stopPropagation(); goToPrev(); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white border border-white/10"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); goToNext(); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white border border-white/10"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              {/* Image with crossfade on navigation */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedImageIndex}
                  className="w-full h-full flex items-center justify-center p-4 sm:p-16"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                  onClick={closeLightbox}
                >
                  <div className="relative max-w-7xl max-h-full w-full h-full">
                    <Image
                      src={currentImage.url}
                      alt={currentImage.caption || `Photo ${selectedImageIndex + 1}`}
                      fill
                      quality={100}
                      className="object-contain"
                      sizes="100vw"
                      unoptimized
                      priority
                    />
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Caption */}
              {currentImage.caption && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 max-w-2xl px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-lg text-white text-center text-sm border border-white/10">
                  {currentImage.caption}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return null;
}
