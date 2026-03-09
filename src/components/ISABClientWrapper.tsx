"use client"

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import HomePage from '@/components/pages/HomePage';
import HistoryPage from '@/components/pages/HistoryPage';
import GalleryPage from '@/components/pages/GalleryPage';
import EventsPage from '@/components/pages/EventsPage';
import type { CMSData } from '@/lib/google-drive/types';

interface ISABClientWrapperProps {
  cmsData: CMSData;
}

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

const pageTransition = {
  duration: 0.28,
  ease: 'easeOut' as const,
};

export default function ISABClientWrapper({ cmsData }: ISABClientWrapperProps) {
  const [currentPage, setCurrentPage] = useState('home');
  const [date, setDate] = useState<Date>(new Date());

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

  const handlePageChange = (page: string) => {
    if (page === currentPage) return;

    if (typeof window !== 'undefined') {
      const newUrl = page === 'home' ? '/' : `/#${page}`;
      window.history.pushState({ page }, '', newUrl);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    setCurrentPage(page);
  };

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) setDate(newDate);
  };

  return (
    <div className="min-h-screen bg-background w-full">
      <Navigation currentPage={currentPage} onPageChange={handlePageChange} />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
        >
          {currentPage === 'home' && (
            <HomePage
              officers={cmsData.officers}
              importantLinks={cmsData.importantLinks}
              siteContent={cmsData.siteContent}
              onPageChange={handlePageChange}
            />
          )}
          {currentPage === 'history' && (
            <HistoryPage siteContent={cmsData.siteContent} />
          )}
          {currentPage === 'gallery' && (
            <GalleryPage eventGalleries={cmsData.eventGalleries} />
          )}
          {currentPage === 'events' && (
            <EventsPage date={date} onDateSelect={handleDateSelect} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
