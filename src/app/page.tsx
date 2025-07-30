// Solution for browser navigation (back button) support
// This shows how to implement URL state management for the main page navigation

"use client"

import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import HomePage from '@/components/pages/HomePage';
import HistoryPage from '@/components/pages/HistoryPage';
import GalleryPage from '@/components/pages/GalleryPage';
import EventsPage from '@/components/pages/EventsPage';

export default function ISABWebsite() {
  const [currentPage, setCurrentPage] = useState('home');
  const [date, setDate] = useState<Date>(new Date());
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);

  // Initialize page from URL on mount
  useEffect(() => {
    const handleInitialLoad = () => {
      const hash = window.location.hash.slice(1); // Remove #
      if (hash && ['home', 'history', 'gallery', 'events'].includes(hash)) {
        setCurrentPage(hash);
      }
    };

    handleInitialLoad();

    // Listen for back/forward button clicks
    const handlePopState = (event: PopStateEvent) => {
      const page = event.state?.page || 'home';
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update URL when page changes
  const handlePageChange = (page: string) => {
    if (page === currentPage) return;
    
    setIsPageTransitioning(true);
    
    // Update URL without page reload
    const newUrl = page === 'home' ? '/' : `/#${page}`;
    window.history.pushState({ page }, '', newUrl);
    
    setTimeout(() => {
      setCurrentPage(page);
      setIsPageTransitioning(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 200);
  };

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
    }
  };

  return (
    <div className="min-h-screen bg-background w-full">
      <Navigation currentPage={currentPage} onPageChange={handlePageChange} />
      <div 
        className={`transition-all duration-200 ${
          isPageTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        {currentPage === 'home' && <HomePage onPageChange={handlePageChange} />}
        {currentPage === 'history' && <HistoryPage />}
        {currentPage === 'gallery' && <GalleryPage />}
        {currentPage === 'events' && <EventsPage date={date} onDateSelect={handleDateSelect} />}
      </div>
    </div>
  );
}

// Additional enhancement: For deeper navigation (like individual gallery events or history boards)
// You would extend this pattern to support nested routes like:
// /#gallery/event-name or /#history/spring-2024

/*
Enhanced version with nested routing:

const [currentView, setCurrentView] = useState({
  page: 'home',
  subPage: null, // For gallery events, history boards, etc.
  params: {} // Additional parameters
});

useEffect(() => {
  const parseUrl = () => {
    const hash = window.location.hash.slice(1);
    const parts = hash.split('/');
    
    return {
      page: parts[0] || 'home',
      subPage: parts[1] || null,
      params: parts.slice(2).reduce((acc, part, index, arr) => {
        if (index % 2 === 0 && arr[index + 1]) {
          acc[part] = arr[index + 1];
        }
        return acc;
      }, {})
    };
  };

  const view = parseUrl();
  setCurrentView(view);
}, []);

const updateUrl = (page: string, subPage?: string, params?: object) => {
  let url = `/#${page}`;
  if (subPage) url += `/${subPage}`;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url += `/${key}/${value}`;
    });
  }
  
  window.history.pushState({ page, subPage, params }, '', url);
  setCurrentView({ page, subPage, params });
};
*/