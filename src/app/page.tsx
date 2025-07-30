// app/page.tsx
"use client"

import React, { useState, useEffect } from 'react';
import VideoSplashScreen from '@/components/SplashScreen';
import Navigation from '@/components/Navigation';
import HomePage from '@/components/pages/HomePage';
import HistoryPage from '@/components/pages/HistoryPage';
import GalleryPage from '@/components/pages/GalleryPage';
import EventsPage from '@/components/pages/EventsPage';
import { useGoogleDriveCMS } from '@/hooks/useGoogleDriveCMS';

export default function ISABWebsite() {
  // Navigation state
  const [currentPage, setCurrentPage] = useState('home');
  const [date, setDate] = useState<Date>(new Date());
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  
  // Video splash screen state
  const [showSplash, setShowSplash] = useState(true);
  const [splashProgress, setSplashProgress] = useState(0);
  
  // Enhanced CMS hook with caching
  const {
    officers,
    importantLinks,
    eventGalleries,
    siteContent,
    documents,
    loading,
    // Handle cases where these might not exist in the hook yet
    initialLoading = loading,
    backgroundRefreshing = false,
    error,
    lastUpdated,
    isFromCache = false,
    changeDetected = [],
    cacheStatus = 'loading',
    refresh,
    clearCache,
    getDocument
  } = useGoogleDriveCMS();

  // Simulate loading progress for fallback display
  useEffect(() => {
    if (!showSplash) return;

    const progressTimer = setInterval(() => {
      setSplashProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        
        // Smart progress based on loading state
        let increment;
        if (isFromCache) {
          increment = 25; // Fast if cached
        } else if (initialLoading) {
          increment = 8;  // Slower if loading fresh
        } else {
          increment = 30; // Quick completion
        }
        
        return Math.min(prev + increment, 100);
      });
    }, 150);

    return () => clearInterval(progressTimer);
  }, [showSplash, initialLoading, isFromCache]);

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

  // Handle splash completion
  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <>
      {/* Video Splash Screen with your Canva MP4 */}
      <VideoSplashScreen
        isVisible={showSplash}
        onComplete={handleSplashComplete}
        videoSrc="/assets/splash/isab-intro.mp4"
        minDisplayTime={3000}
        loadingProgress={splashProgress}
      />

      {/* Main App - Hidden while splash is showing */}
      <div className={`min-h-screen bg-background w-full transition-opacity duration-700 ${
        showSplash ? 'opacity-0' : 'opacity-100'
      }`}>
        
        {/* Background refresh indicator */}
        {backgroundRefreshing && !initialLoading && (
          <div className="fixed top-20 right-4 z-40 bg-primary/90 text-white px-3 py-2 rounded-lg text-sm shadow-lg animate-pulse">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Syncing latest content...</span>
            </div>
          </div>
        )}

        {/* Change detection indicator */}
        {Array.isArray(changeDetected) && changeDetected.length > 0 && !backgroundRefreshing && (
          <div className="fixed top-20 right-4 z-40 bg-green-600 text-white px-3 py-2 rounded-lg text-sm shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
              <span>Content updated</span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <Navigation currentPage={currentPage} onPageChange={handlePageChange} />
        
        {/* Page Content with Transitions */}
        <div className={`transition-all duration-200 ${
          isPageTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}>
          {currentPage === 'home' && <HomePage onPageChange={handlePageChange} />}
          {currentPage === 'history' && <HistoryPage />}
          {currentPage === 'gallery' && <GalleryPage />}
          {currentPage === 'events' && <EventsPage date={date} onDateSelect={handleDateSelect} />}
        </div>

        {/* Development Tools */}
        {typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 right-4 z-50 bg-black/90 text-white p-3 rounded-lg text-xs space-y-2 border border-gray-600">
            <div className="font-bold text-green-400 border-b border-gray-600 pb-1 mb-2">
              🚀 ISAB Dev Tools
            </div>
            
            <div className="space-y-1">
              <div>Cache Status: <span className={`font-bold ${
                cacheStatus === 'cache-hit' ? 'text-blue-400' :
                cacheStatus === 'fresh' ? 'text-green-400' :
                cacheStatus === 'loading' ? 'text-yellow-400' :
                'text-red-400'
              }`}>{cacheStatus}</span></div>
              
              <div>Data Source: <span className={`font-bold ${
                isFromCache ? 'text-blue-400' : 'text-yellow-400'
              }`}>
                {isFromCache ? 'Cache Hit ⚡' : 'Fresh Load'}
              </span></div>
              
              {lastUpdated && (
                <div>Updated: <span className="text-gray-300">
                  {lastUpdated.toLocaleTimeString()}
                </span></div>
              )}
              
              {backgroundRefreshing && (
                <div className="text-orange-400 animate-pulse">⟳ Refreshing...</div>
              )}
            </div>
            
            <div className="flex space-x-1 pt-2 border-t border-gray-600">
              <button 
                onClick={() => {
                  if (refresh) refresh();
                }} 
                className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs transition-colors"
                disabled={backgroundRefreshing}
              >
                🔄 Refresh
              </button>
              <button 
                onClick={() => {
                  if (clearCache) clearCache();
                }} 
                className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs transition-colors"
              >
                🗑️ Clear
              </button>
              <button 
                onClick={() => setShowSplash(true)} 
                className="bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded text-xs transition-colors"
              >
                🎬 Replay Video
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}