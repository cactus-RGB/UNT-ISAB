"use client"

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Image as ImageIcon, X } from 'lucide-react';
import type { EventGallery } from '@/lib/google-drive/types';

// Fallback data for when Google Drive isn't set up
const fallbackEventGalleries: EventGallery[] = [
  {
    id: 'sample-event',
    title: 'Sample ISAB Event',
    date: 'Recent',
    description: 'Sample event gallery - please set up Google Drive to see actual events',
    coverImage: '/assets/gallery/gallery2.jpeg',
    totalImages: 1,
    images: [
      { url: '/assets/gallery/gallery2.jpeg', caption: 'Sample event photo' }
    ]
  }
];

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

export default function GalleryPage({ eventGalleries: cmsGalleries }: GalleryPageProps) {
  const eventGalleries = cmsGalleries.length > 0 ? cmsGalleries : fallbackEventGalleries;

  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentScrollPosition, setCurrentScrollPosition] = useState(0);

  const openEventGallery = (eventId: string) => {
    setSelectedEvent(eventId);
  };

  const closeEventGallery = () => {
    setSelectedEvent(null);
  };

  const openLightbox = (imageUrl: string) => {
    // Save the current scroll position when opening lightbox
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    setCurrentScrollPosition(scrollTop);
    
    setSelectedImage(imageUrl);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    setCurrentScrollPosition(0);
    document.body.style.overflow = 'unset';
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (selectedImage) {
          closeLightbox();
        } else if (selectedEvent) {
          closeEventGallery();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [selectedImage, selectedEvent]);

  const currentEvent = selectedEvent ? eventGalleries.find(event => event.id === selectedEvent) : null;

  // Main gallery view
  if (!selectedEvent) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 w-full">
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-foreground">Event Gallery</h1>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
            Click on any event folder to view photos from that event
          </p>
        </div>

        {eventGalleries.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="p-12">
              <ImageIcon className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-foreground mb-2">No Event Galleries Found</h3>
              <p className="text-muted-foreground">
                Create event folders in your Google Drive to see galleries here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {eventGalleries.map((event, index) => (
              <Card 
                key={index} 
                className="group transition-all duration-300 hover:shadow-card-elevated border-border bg-card overflow-hidden cursor-pointer hover:-translate-y-2"
                onClick={() => openEventGallery(event.id)}
              >
                <div className="relative h-64 overflow-hidden">
                  <GalleryImage
                    src={event.coverImage}
                    alt={event.title}
                    className="w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                    {event.totalImages} photos
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors duration-300">
                    {event.title}
                  </h3>
                  <p className="text-primary font-medium text-sm mb-2">{event.date}</p>
                  <p className="text-muted-foreground leading-relaxed">{event.description}</p>
                  
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-sm text-primary font-medium">Click to view gallery →</p>
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
        <div className="flex flex-col sm:flex-row sm:items-center mb-6 sm:mb-8">
          <Button 
            variant="ghost" 
            onClick={closeEventGallery}
            className="mb-4 sm:mb-0 sm:mr-4 hover:bg-primary/10 self-start"
          >
            <ChevronRight className="h-4 sm:h-5 w-4 sm:w-5 mr-2 rotate-180" />
            Back to Gallery
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">{currentEvent.title}</h1>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg mt-2">{currentEvent.date} • {currentEvent.totalImages} photos</p>
          </div>
        </div>

        <Card className="mb-8 shadow-card-hover border-border bg-card">
          <CardContent className="p-6">
            <p className="text-muted-foreground leading-relaxed">{currentEvent.description}</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {currentEvent.images.map((image, index) => (
            <div
              key={index} 
              className="group transition-all duration-300 hover:shadow-card-elevated border border-border bg-card overflow-hidden cursor-pointer hover:-translate-y-1 rounded-lg"
              onClick={() => openLightbox(image.url)}
            >
              <div className="relative aspect-square overflow-hidden">
                <GalleryImage
                  src={image.url}
                  alt={`Gallery image ${index + 1}`}
                  className="w-full h-full"
                />
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Perfect Mobile Lightbox with Background Blur - Positioned at Current Scroll Level */}
        {selectedImage && (
          <>
            {/* Background blur overlay */}
            <div 
              className="fixed inset-0 z-40"
              style={{
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
              }}
            />
            
            {/* Lightbox content */}
            <div 
              className="fixed inset-0 z-50"
              onClick={closeLightbox}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 50,
                width: '100vw',
                height: '100vh',
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeLightbox();
                }}
                className="absolute top-4 right-4 z-20 p-3 rounded-full bg-black/60 hover:bg-black/80 transition-colors duration-200 text-white"
                style={{ position: 'fixed' }}
              >
                <X className="h-6 w-6" />
              </button>
              
              {/* Image positioned at user's current scroll position */}
              <div 
                className="absolute w-full h-screen flex items-center justify-center p-4"
                style={{
                  top: `${currentScrollPosition}px`,
                  left: 0,
                  right: 0,
                }}
              >
                <div className="relative max-w-[90vw] max-h-[90vh] w-full h-full flex items-center justify-center">
                  <GalleryImage
                    src={selectedImage}
                    alt="Gallery image"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
              
              {/* Mobile instruction positioned relative to scroll */}
              <div 
                className="absolute left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm sm:hidden"
                style={{
                  top: `${currentScrollPosition + window.innerHeight - 80}px`,
                }}
              >
                Tap to close
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return null;
}