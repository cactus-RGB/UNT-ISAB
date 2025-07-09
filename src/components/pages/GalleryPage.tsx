"use client"

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Image as ImageIcon, X } from 'lucide-react';
import { eventGalleries } from '@/data/gallery';

export default function GalleryPage() {
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
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-foreground">Event Gallery</h1>
        <p className="text-muted-foreground mb-8 sm:mb-12 text-sm sm:text-base md:text-lg">
          Click on any event folder to view photos from that event
        </p>
        
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
          <div>
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