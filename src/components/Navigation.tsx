"use client"

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Home, BookOpen, Image as ImageIcon, CalendarIcon } from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export default function Navigation({ currentPage, onPageChange }: NavigationProps) {
  return (
    <nav className="bg-card/80 backdrop-blur-md shadow-card sticky top-0 z-50 border-b border-border w-full">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-6">
            <div 
              className="flex items-center space-x-2 sm:space-x-3 cursor-pointer"
              onClick={() => onPageChange('home')}
            >
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20">
                <Image
                  src="/assets/logo/ISAB Logo (Cropped).PNG"
                  alt="ISAB Logo"
                  fill
                  style={{ objectFit: 'contain' }}
                  sizes="(max-width: 640px) 48px, (max-width: 768px) 64px, 80px"
                  className="rounded-xl transition-transform duration-300 hover:scale-110 shadow-sm"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-foreground">ISAB</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">University of North Texas</p>
              </div>
            </div>
            
            <div className="flex space-x-1 sm:space-x-2">
              <Button 
                variant={currentPage === 'home' ? "default" : "ghost"}
                onClick={() => onPageChange('home')}
                className="flex items-center space-x-1 sm:space-x-2 text-sm md:text-base px-4 py-3 sm:px-3 sm:py-2 h-12 sm:h-10"
              >
                <Home className="h-5 w-5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                <span className="hidden sm:inline">Home</span>
              </Button>
              <Button 
                variant={currentPage === 'history' ? "default" : "ghost"}
                onClick={() => onPageChange('history')}
                className="flex items-center space-x-1 sm:space-x-2 text-sm md:text-base px-4 py-3 sm:px-3 sm:py-2 h-12 sm:h-10"
              >
                <BookOpen className="h-5 w-5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                <span className="hidden sm:inline">History</span>
              </Button>
              <Button 
                variant={currentPage === 'gallery' ? "default" : "ghost"}
                onClick={() => onPageChange('gallery')}
                className="flex items-center space-x-1 sm:space-x-2 text-sm md:text-base px-4 py-3 sm:px-3 sm:py-2 h-12 sm:h-10"
              >
                <ImageIcon className="h-5 w-5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                <span className="hidden sm:inline">Gallery</span>
              </Button>
              <Button 
                variant={currentPage === 'events' ? "default" : "ghost"}
                onClick={() => onPageChange('events')}
                className="flex items-center space-x-1 sm:space-x-2 text-sm md:text-base px-4 py-3 sm:px-3 sm:py-2 h-12 sm:h-10"
              >
                <CalendarIcon className="h-5 w-5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                <span className="hidden sm:inline">Events</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
