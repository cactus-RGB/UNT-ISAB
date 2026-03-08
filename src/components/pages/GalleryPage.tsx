"use client"

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Image as ImageIcon, X, Calendar, ImagePlus } from 'lucide-react';
import type { EventGallery } from '@/lib/google-drive/types';

// Next.js Image component with fallback for gallery images
function GalleryImage({ src, alt, onClick, className }: {
  src: string;
  alt: string;
  onClick?: () => void;
  className?: string;
}) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div className={`bg-muted/50 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Image unavailable</p>
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
        quality={95}
        className="object-cover transition-transform duration-500 group-hover:scale-110"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        onError={() => setImageError(true)}
        priority={false}
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

  const openEventGallery = (eventId: string) => {
    setSelectedEvent(eventId);
    setSelectedImageIndex(null); // Reset image selection when opening gallery
  };

  const closeEventGallery = () => {
    setSelectedEvent(null);
    setSelectedImageIndex(null);
  };

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImageIndex(null);
    document.body.style.overflow = 'unset';
  };

  const goToPreviousImage = () => {
    if (selectedImageIndex !== null && currentEvent) {
      setSelectedImageIndex((selectedImageIndex - 1 + currentEvent.images.length) % currentEvent.images.length);
    }
  };

  const goToNextImage = () => {
    if (selectedImageIndex !== null && currentEvent) {
      setSelectedImageIndex((selectedImageIndex + 1) % currentEvent.images.length);
    }
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (selectedImageIndex !== null) {
          closeLightbox();
        } else if (selectedEvent) {
          closeEventGallery();
        }
      } else if (selectedImageIndex !== null) {
        if (event.key === 'ArrowLeft') {
          goToPreviousImage();
        } else if (event.key === 'ArrowRight') {
          goToNextImage();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [selectedImageIndex, selectedEvent, goToPreviousImage, goToNextImage]);

  const currentEvent = selectedEvent ? eventGalleries.find(event => event.id === selectedEvent) : null;
  const currentImage = currentEvent && selectedImageIndex !== null ? currentEvent.images[selectedImageIndex] : null;

  // Main gallery view
  if (!selectedEvent) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 w-full">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Event Gallery
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-2xl">
            Explore our vibrant community through photos from our events and gatherings
          </p>
        </div>

        {eventGalleries.length === 0 ? (
          <Card className="text-center py-16 border-2 border-dashed border-border">
            <CardContent className="p-12">
              <ImageIcon className="h-20 w-20 text-muted-foreground/50 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-foreground mb-3">No Event Galleries Found</h3>
              <p className="text-muted-foreground text-lg">
                Create event folders in your Google Drive to see galleries here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {eventGalleries.map((event, index) => (
              <Card
                key={index}
                className="group relative transition-all duration-300 hover:shadow-2xl border-border bg-card overflow-hidden cursor-pointer hover:-translate-y-3 hover:scale-[1.02]"
                onClick={() => openEventGallery(event.id)}
              >
                {/* Cover Image */}
                <div className="relative h-72 overflow-hidden">
                  <GalleryImage
                    src={event.coverImage}
                    alt={event.title}
                    className="w-full h-full"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>

                  {/* Photo Count Badge */}
                  <div className="absolute top-4 right-4 flex items-center gap-2 bg-primary/90 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    <ImagePlus className="h-4 w-4" />
                    {event.totalImages}
                  </div>

                  {/* Title Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-2 text-white/90 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">{event.date}</span>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <CardContent className="p-6 bg-gradient-to-br from-card to-muted/20">
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-semibold text-sm uppercase tracking-wide">View Gallery</span>
                    <ChevronRight className="h-5 w-5 text-primary transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Individual event gallery view
  if (currentEvent) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 w-full">
        {/* Header with Back Button */}
        <div className="mb-8 sm:mb-12">
          <Button
            variant="ghost"
            onClick={(e) => {
              e.preventDefault();
              closeEventGallery();
            }}
            className="mb-6 hover:bg-primary/10 group"
          >
            <ChevronLeft className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" />
            <span className="font-semibold">Back to All Galleries</span>
          </Button>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-foreground">
            {currentEvent.title}
          </h1>

          <div className="flex items-center gap-4 text-muted-foreground text-lg">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>{currentEvent.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <ImagePlus className="h-5 w-5 text-primary" />
              <span>{currentEvent.totalImages} photos</span>
            </div>
          </div>
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {currentEvent.images.map((image, index) => (
            <div
              key={index}
              className="group relative transition-all duration-300 hover:shadow-2xl border border-border bg-card overflow-hidden cursor-pointer hover:-translate-y-2 hover:scale-105 rounded-xl"
              onClick={() => openLightbox(index)}
            >
              <div className="relative aspect-square overflow-hidden">
                <GalleryImage
                  src={image.url}
                  alt={image.caption || `Photo ${index + 1}`}
                  className="w-full h-full"
                />
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-3">
                    <ImageIcon className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox */}
        {selectedImageIndex !== null && currentImage && (
          <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg">
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 text-white backdrop-blur-sm"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Image Counter */}
            <div className="absolute top-4 left-4 z-20 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white font-semibold">
              {selectedImageIndex + 1} / {currentEvent.images.length}
            </div>

            {/* Navigation Buttons */}
            {currentEvent.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPreviousImage();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 text-white backdrop-blur-sm"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNextImage();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 text-white backdrop-blur-sm"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </>
            )}

            {/* Image Container */}
            <div
              className="w-full h-full flex items-center justify-center p-4 sm:p-8"
              onClick={closeLightbox}
            >
              <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center">
                <div className="relative w-full h-full">
                  <Image
                    src={currentImage.url}
                    alt={currentImage.caption || `Photo ${selectedImageIndex + 1}`}
                    fill
                    quality={95}
                    className="object-contain"
                    sizes="100vw"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Caption */}
            {currentImage.caption && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 max-w-2xl px-6 py-3 bg-white/10 backdrop-blur-md rounded-lg text-white text-center">
                {currentImage.caption}
              </div>
            )}

            {/* Mobile Instruction */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm sm:hidden">
              Tap to close
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
