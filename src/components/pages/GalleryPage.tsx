"use client"

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
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

export default function GalleryPage() {
  const { 
    eventGalleries: cmsGalleries, 
    loading, 
    error, 
    lastUpdated, 
    refresh 
  } = useGoogleDriveCMS();

  // Use CMS data if available, fallback to hardcoded data
  const eventGalleries = cmsGalleries.length > 0 ? cmsGalleries : fallbackEventGalleries;

  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const openEventGallery = (eventId: string) => {
    setSelectedEvent(eventId);
  };

  const closeEventGallery = () => {
    setSelectedEvent(null);
  };

  const openLightbox = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
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
    return () => document.removeEventListener('keydown', handleEscape);
  }, [selectedImage, selectedEvent]);

  const currentEvent = selectedEvent ? eventGalleries.find(event => event.id === selectedEvent) : null;

  // Main gallery view
  if (!selectedEvent) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 w-full">
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-foreground">Event Gallery</h1>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
              Click on any event folder to view photos from that event
            </p>
          </div>
          {lastUpdated && (
            <Button 
              variant="outline" 
              onClick={refresh}
              disabled={loading}
              className="h-8 px-3 py-1 text-xs"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Sync
            </Button>
          )}
        </div>

        {/* CMS Status */}
        {error && (
          <Card className="mb-8 border-destructive bg-destructive/5">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <h3 className="font-medium text-destructive mb-1">Gallery Content Error</h3>
                  <p className="text-sm text-muted-foreground mb-3">{error}</p>
                  <p className="text-sm text-muted-foreground mb-3">Using fallback data.</p>
                  <Button 
                    variant="outline" 
                    onClick={refresh}
                    className="h-8 px-3 py-1 text-xs"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Retry
                  </Button>
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
                <p className="text-primary">Loading galleries from Google Drive...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {eventGalleries.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="p-12">
              <ImageIcon className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-foreground mb-2">No Event Galleries Found</h3>
              <p className="text-muted-foreground mb-4">
                Create event folders in your &ldquo;Event Photos&rdquo; Google Drive folder to see galleries here.
              </p>
              <Button 
                variant="outline" 
                onClick={refresh}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Check for Updates
              </Button>
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
                  <Image
                    src={event.coverImage}
                    alt={event.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <ImageIcon className="h-5 w-5 text-white" />
                  </div>
                  
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
          <Button 
            variant="outline" 
            onClick={refresh}
            disabled={loading}
            className="h-8 px-3 py-1 text-xs ml-auto"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Sync
          </Button>
        </div>

        <Card className="mb-8 shadow-card-hover border-border bg-card">
          <CardContent className="p-6">
            <p className="text-muted-foreground leading-relaxed">{currentEvent.description}</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {currentEvent.images.map((image, index) => (
            <Card 
              key={index} 
              className="group transition-all duration-300 hover:shadow-card-elevated border-border bg-card overflow-hidden cursor-pointer hover:-translate-y-1"
              onClick={() => openLightbox(image.url)}
            >
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={image.url}
                  alt={image.caption}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  className="transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-3">
                    <ImageIcon className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </div>
              
              {image.caption && (
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{image.caption}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Lightbox */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200"
              >
                <X className="h-6 w-6 text-white" />
              </button>
              
              <div className="relative w-full h-full">
                <Image
                  src={selectedImage}
                  alt="Gallery image"
                  fill
                  style={{ objectFit: 'contain' }}
                  sizes="100vw"
                  className="cursor-pointer"
                  onClick={closeLightbox}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}