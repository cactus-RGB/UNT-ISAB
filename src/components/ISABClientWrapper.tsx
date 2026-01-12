"use client"

import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import HomePage from '@/components/pages/HomePage';
import HistoryPage from '@/components/pages/HistoryPage';
import GalleryPage from '@/components/pages/GalleryPage';
import EventsPage from '@/components/pages/EventsPage';
import type { CMSData } from '@/lib/google-drive/types';

interface ISABClientWrapperProps {
  cmsData: CMSData;
}

export default function ISABClientWrapper({ cmsData }: ISABClientWrapperProps) {
  // Navigation state
  const [currentPage, setCurrentPage] = useState('home');
  const [date, setDate] = useState<Date>(new Date());
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);

  // URL navigation logic
  useEffect(() => {
    const handleInitialLoad = () => {
      if (typeof window !== 'undefined') {
        const hash = window.location.hash.slice(1);
        if (hash && ['home', 'history', 'gallery', 'events'].includes(hash)) {
          setCurrentPage(hash);
        }
      }
    };

    handleInitialLoad();

    const handlePopState = (event: PopStateEvent) => {
      const page = event.state?.page || 'home';
      setCurrentPage(page);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, []);

  // Page change handler
  const handlePageChange = (page: string) => {
    if (page === currentPage) return;

    setIsPageTransitioning(true);

    if (typeof window !== 'undefined') {
      const newUrl = page === 'home' ? '/' : `/#${page}`;
      window.history.pushState({ page }, '', newUrl);
    }

    setTimeout(() => {
      setCurrentPage(page);
      setIsPageTransitioning(false);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 200);
  };

  // Date selection handler
  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
    }
  };

  return (
    <div className="min-h-screen bg-background w-full">
      {/* Navigation */}
      <Navigation currentPage={currentPage} onPageChange={handlePageChange} />

      {/* Page Content with Transitions */}
      <div className={`transition-all duration-200 ${
        isPageTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}>
        {currentPage === 'home' && (
          <HomePage
            officers={cmsData.officers}
            importantLinks={cmsData.importantLinks}
            siteContent={cmsData.siteContent}
            onPageChange={handlePageChange}
          />
        )}
        {currentPage === 'history' && (
          <HistoryPage
            siteContent={cmsData.siteContent}
          />
        )}
        {currentPage === 'gallery' && (
          <GalleryPage
            eventGalleries={cmsData.eventGalleries}
          />
        )}
        {currentPage === 'events' && (
          <EventsPage
            date={date}
            onDateSelect={handleDateSelect}
          />
        )}
      </div>
    </div>
  );
}
