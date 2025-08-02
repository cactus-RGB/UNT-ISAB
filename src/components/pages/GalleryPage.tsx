"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Image as ImageIcon, X, RefreshCw, AlertCircle } from 'lucide-react';
import { useGoogleDriveCMS } from '@/hooks/useGoogleDriveCMS';
import type { EventGallery } from '@/hooks/useGoogleDriveCMS';

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

// Smart Image component for Google Drive images
function GalleryImage({ src, alt, onClick, className }: { 
  src: string; 
  alt: string; 
  onClick?: () => void;
  className?: string;
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
      `https://drive.google.com/thumbnail?id=${fileId}&sz=w800-h800`,
      `https://lh3.googleusercontent.com/d/${fileId}=w800-h800`,
      `https://drive.google.com/thumbnail?id=${fileId}&sz=w600-h600`,
      `https://lh3.googleusercontent.com/d/${fileId}=s800`,
      `https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h400`,
      originalUrl,
    ];
  };

  const handleImageError = () => {
    const isGoogleDriveUrl = src.includes('drive.google.com');
    
    if (isGoogleDriveUrl && attemptCount < 5) {
      const alternatives = getAlternativeUrls(src);
      const nextUrl = alternatives[attemptCount + 1];
      
      if (nextUrl) {
        setAttemptCount(prev => prev + 1);
        setCurrentSrc(nextUrl);
        setImageLoading(true);
        return;
      }
    }

    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageError(false);
    setImageLoading(false);
  };

  useEffect(() => {
    setImageError(false);
    setImageLoading(true);
    setCurrentSrc(src);
    setAttemptCount(0);
  }, [src]);

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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={currentSrc}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        onError={handleImageError}
        onLoad={handleImageLoad}
        crossOrigin="anonymous"
      />
      
      {imageLoading && (
        <div className="absolute inset-0 bg-muted/20 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}

export default function GalleryPage() {
  const { 
    eventGalleries: cmsGalleries, 
    loading, 
    error
  } = useGoogleDriveCMS();

  const eventGalleries = cmsGalleries.length > 0 ? cmsGalleries : fallbackEventGalleries;

  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [lightboxPosition, setLightboxPosition] = useState<{ x: number; y: number } | null>(null);

  const openEventGallery = (eventId: string) => {
    setSelectedEvent(eventId);
  };

  const closeEventGallery = () => {
    setSelectedEvent(null);
  };

  const openLightbox = (imageUrl: string, clickEvent: React.MouseEvent<HTMLDivElement>) => {
    const target = clickEvent.currentTarget;
    const rect = target.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    setLightboxPosition({
      x: rect.left + rect.width / 2,
      y: rect.top + scrollTop + rect.height / 2
    });
    
    setSelectedImage(imageUrl);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    setLightboxPosition(null);
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

        {error && (
          <Card className="mb-8 border-destructive bg-destructive/5">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <h3 className="font-medium text-destructive mb-1">Gallery Content Error</h3>
                  <p className="text-sm text-muted-foreground">{error}</p>
                  <p className="text-sm text-muted-foreground mt-1">Using fallback data.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {loading && (
          <Card className="mb-8 border-primary bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                <p className="text-primary">Loading galleries...</p>
              </div>
            </CardContent>
          </Card>
        )}

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
              onClick={(e) => openLightbox(image.url, e)}
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

        {/* Perfect Mobile Lightbox */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50"
            onClick={closeLightbox}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
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
            
            <div 
              className="absolute inset-0 flex items-center justify-center p-4"
              style={{
                ...(lightboxPosition && {
                  transform: `translate(${Math.max(-50, Math.min(50, (lightboxPosition.x - window.innerWidth / 2) / 10))}px, ${Math.max(-50, Math.min(50, (lightboxPosition.y - window.innerHeight / 2) / 10))}px)`
                })
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
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm sm:hidden">
              Tap to close
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}