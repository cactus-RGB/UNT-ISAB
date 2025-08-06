"use client"

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Users, RefreshCw, AlertCircle } from 'lucide-react';
import { useGoogleDriveCMS } from '@/hooks/useGoogleDriveCMS';
import { semesterBoards, masterOfficerProfiles } from '@/data/history';
import type { OfficerProfile } from '@/data/history';
import HistoryOfficerModal from '@/components/history/HistoryOfficerModal';
import HistoryOfficerCard from '@/components/history/HistoryOfficerCard';
// Splash screen import commented out for deployment
// import VideoSplashScreen from '@/components/SplashScreen';

// SPLASH SCREEN DISABLED - Key kept for potential future use
// const HISTORY_SPLASH_VIEWED_KEY = 'isab-history-splash-viewed';

export default function HistoryPage() {
  const { 
    loading, 
    error
  } = useGoogleDriveCMS();

  // Use hardcoded data for now since CMS history integration is not complete
  const currentSemesterBoards = semesterBoards;
  const currentMasterOfficerProfiles = masterOfficerProfiles;

  const [selectedBoard, setSelectedBoard] = useState<string | null>(null);
  const [selectedOfficer, setSelectedOfficer] = useState<(OfficerProfile & { currentRole?: string }) | null>(null);
  const [isOfficerModalOpen, setIsOfficerModalOpen] = useState(false);
  
  // Splash screen state - DISABLED for deployment
  const [showSplash] = useState(false); // Always false
  const [isEntering] = useState(false); // Used in JSX classes
  
  // Cycling header images
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const headerImages = currentSemesterBoards.map(board => board.coverImage);

  // Parse URL parameters on mount and handle browser navigation
  useEffect(() => {
    const parseUrlAndSetState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const boardParam = urlParams.get('board');
      const officerParam = urlParams.get('officer');
      
      if (boardParam) {
        setSelectedBoard(boardParam);
      }
      
      if (officerParam) {
        // Find officer in current board or search all boards
        let foundOfficer = null;
        let foundRole = '';
        
        if (boardParam) {
          const board = currentSemesterBoards.find(b => b.id === boardParam);
          if (board) {
            const officerInBoard = board.officers.find(o => {
              const profile = currentMasterOfficerProfiles[o.id];
              return profile && profile.name === officerParam;
            });
            if (officerInBoard) {
              foundOfficer = currentMasterOfficerProfiles[officerInBoard.id];
              foundRole = officerInBoard.role;
            }
          }
        }
        
        if (foundOfficer) {
          setSelectedOfficer({ ...foundOfficer, currentRole: foundRole });
          setIsOfficerModalOpen(true);
        }
      }
    };

    // Parse URL on component mount
    parseUrlAndSetState();

    // Handle browser back/forward navigation
    const handlePopState = (event: PopStateEvent) => {
      if (event.state) {
        if (event.state.modal === 'history-officer') {
          // Modal state handled by modal component
          return;
        }
        if (event.state.board) {
          setSelectedBoard(event.state.board);
        } else {
          setSelectedBoard(null);
        }
      } else {
        // No state means we're back to the main history view
        setSelectedBoard(null);
        setSelectedOfficer(null);
        setIsOfficerModalOpen(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentSemesterBoards, currentMasterOfficerProfiles]);

  // SPLASH SCREEN DISABLED - No check for splash on mount
  // useEffect(() => {
  //   const hasViewedSplash = localStorage.getItem(HISTORY_SPLASH_VIEWED_KEY);
  //   if (!hasViewedSplash) {
  //     setShowSplash(true);
  //   }
  // }, []);

  // SPLASH SCREEN DISABLED - No progress simulation
  // useEffect(() => {
  //   if (!showSplash) return;
  //   // ... progress timer code
  // }, [showSplash]);

  // SPLASH SCREEN DISABLED - Handle splash completion (kept for potential future use)
  // const handleSplashComplete = () => {
  //   setIsEntering(true);
  //   localStorage.setItem(HISTORY_SPLASH_VIEWED_KEY, 'true');
  //   setTimeout(() => {
  //     setIsEntering(false);
  //   }, 1000);
  // };

  // Cycle through header images every 3 seconds
  useEffect(() => {
    if (headerImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => 
          (prevIndex + 1) % headerImages.length
        );
      }, 3000); // Change every 3 seconds

      return () => clearInterval(interval);
    }
  }, [headerImages.length]);

  const openBoardView = (boardId: string) => {
    setSelectedBoard(boardId);
    
    // Update browser history
    const newUrl = `${window.location.pathname}#history?board=${encodeURIComponent(boardId)}`;
    window.history.pushState({ board: boardId }, '', newUrl);
    
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const closeBoardView = () => {
    setSelectedBoard(null);
    
    // Update browser history - go back to main history view
    const newUrl = `${window.location.pathname}#history`;
    window.history.pushState({}, '', newUrl);
  };

  const openOfficerModal = (officerId: string, role: string) => {
    console.log('Opening modal for:', officerId, role);
    const profile = currentMasterOfficerProfiles[officerId];
    if (profile) {
      console.log('Found profile:', profile);
      setSelectedOfficer({ ...profile, currentRole: role });
      setIsOfficerModalOpen(true);
      
      // Browser history is handled by the modal component
    } else {
      console.log('No profile found for:', officerId);
    }
  };

  const closeOfficerModal = useCallback(() => {
    setIsOfficerModalOpen(false);
    setSelectedOfficer(null);
    
    // Remove officer from URL but keep board if present
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.delete('officer');
    const newSearch = urlParams.toString();
    const newUrl = `${window.location.pathname}#history${newSearch ? '?' + newSearch : ''}`;
    window.history.replaceState(selectedBoard ? { board: selectedBoard } : {}, '', newUrl);
  }, [selectedBoard]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isOfficerModalOpen) {
          closeOfficerModal();
        } else if (selectedBoard) {
          closeBoardView();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOfficerModalOpen, selectedBoard, closeOfficerModal]);

  const currentBoard = selectedBoard ? currentSemesterBoards.find(board => board.id === selectedBoard) : null;

  return (
    <>
      {/* SPLASH SCREEN DISABLED FOR DEPLOYMENT */}
      {/* {showSplash && (
        <VideoSplashScreen
          isVisible={showSplash}
          onComplete={handleSplashComplete}
          videoSrc="/assets/splash/isab-intro.mp4"
          loadingProgress={splashProgress}
        />
      )} */}

      {/* Main History Content */}
      <div className={`w-full transition-all duration-1000 ease-out ${
        showSplash ? 'opacity-0' : isEntering ? 'opacity-100 animate-slide-up' : 'opacity-100'
      }`}>
        {/* Main history view */}
        {!selectedBoard && (
          <div className="w-full">
            {/* Cycling Header Images - DOTS REMOVED */}
            <div className={`relative h-64 sm:h-72 md:h-80 lg:h-96 xl:h-[40rem] 2xl:h-[48rem] overflow-hidden ${
              isEntering ? 'animate-scale-in' : ''
            }`}>
              {headerImages.map((image, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`ISAB History - ${currentSemesterBoards[index]?.title || 'Board'}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="100vw"
                    className="w-full h-full"
                    priority={index === 0}
                  />
                </div>
              ))}
              <div className="absolute inset-0 bg-black/40"></div>
              <div className={`absolute inset-0 flex items-center justify-center ${
                isEntering ? 'animate-fade-in-delayed' : ''
              }`}>
                <div className="text-center text-white">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">Our Legacy</h1>
                  <p className="text-lg sm:text-xl md:text-2xl opacity-90">Celebrating ISAB&apos;s Journey of Growth and Impact</p>
                  
                  {/* DOTS REMOVED - No image cycling indicators */}
                </div>
              </div>
            </div>

            <div className={`container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 w-full ${
              isEntering ? 'animate-slide-up-delayed' : ''
            }`}>
              {/* SPLASH SCREEN REPLAY BUTTON DISABLED FOR DEPLOYMENT */}
              {/* <div className="max-w-4xl mx-auto mb-8">
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setShowSplash(true);
                      setSplashProgress(0);
                      setIsEntering(false);
                    }}
                    className="bg-primary/90 hover:bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 shadow-lg backdrop-blur-sm flex items-center space-x-2"
                    title="Replay introduction video"
                  >
                    <span className="text-lg">🎬</span>
                    <span>Replay Intro</span>
                  </button>
                </div>
              </div> */}

              <div className="max-w-4xl mx-auto">
                {/* CMS Status */}
                {error && (
                  <Card className="mb-8 border-destructive bg-destructive/5">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                        <div>
                          <h3 className="font-medium text-destructive mb-1">History Content Error</h3>
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
                        <p className="text-primary">Loading history content...</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="shadow-card-hover border-border bg-card mb-16">
                  <CardContent className="p-8 sm:p-12">
                    <div className="prose prose-lg max-w-none">
                      <h2 className="text-3xl font-bold mb-6 text-foreground flex items-center">
                        <div className="w-2 h-8 bg-primary rounded-full mr-4"></div>
                        Foundation
                      </h2>
                      <p className="text-muted-foreground mb-0 leading-relaxed">
                        The International Student Advisory Board (ISAB) at UNT was founded to amplify the voices 
                        of international students, ensuring their concerns and needs are heard and addressed by 
                        the university administration. Officially inaugurated on January 30, 2024, ISAB started as a small 
                        initiative but quickly grew into a recognized student organization. The board was created 
                        to foster a welcoming environment for international students, advocating for their interests 
                        and enhancing their experience at UNT.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="mb-16">
                  <h2 className="text-4xl font-bold mb-4 flex items-center text-foreground">
                    <div className="w-2 h-10 bg-primary rounded-full mr-4"></div>
                    Legacy of Leadership
                  </h2>
                  <p className="text-muted-foreground mb-12 text-lg">
                    Click on any semester board to view the officers who served during that period
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                    {currentSemesterBoards.map((board, index) => (
                      <Card 
                        key={index} 
                        className="group transition-all duration-300 hover:shadow-card-elevated border-border bg-card overflow-hidden cursor-pointer hover:-translate-y-2"
                        onClick={() => openBoardView(board.id)}
                      >
                        <div className="relative h-48 overflow-hidden">
                          <Image
                            src={board.coverImage}
                            alt={board.title}
                            fill
                            style={{ objectFit: 'cover' }}
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          
                          <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                            {board.totalOfficers} officers
                          </div>

                          <div className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <Users className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        
                        <CardContent className="p-6">
                          <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors duration-300">
                            {board.title}
                          </h3>
                          <p className="text-muted-foreground leading-relaxed text-sm">{board.description}</p>
                          
                          <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <p className="text-sm text-primary font-medium">Click to view officers →</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Individual semester board view */}
        {currentBoard && (
          <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 w-full">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center mb-6 sm:mb-8">
                <Button 
                  variant="ghost" 
                  onClick={closeBoardView}
                  className="mb-4 sm:mb-0 sm:mr-4 hover:bg-primary/10 self-start"
                >
                  <ChevronRight className="h-4 sm:h-5 w-4 sm:w-5 mr-2 rotate-180" />
                  Back to History
                </Button>
                <div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">{currentBoard.title}</h1>
                  <p className="text-muted-foreground text-sm sm:text-base md:text-lg mt-2">{currentBoard.totalOfficers} officers</p>
                </div>
              </div>

              {/* Colorful Description Box - Green Theme */}
              <div className="mb-8 p-8 rounded-2xl bg-gradient-to-br from-green-50 via-white to-green-100 dark:from-green-950/20 dark:via-gray-900 dark:to-green-900/30 border-2 border-green-200/50 dark:border-green-800/30 shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-green-600 rounded-full mr-4"></div>
                  <h3 className="text-xl font-bold text-foreground">About This Board</h3>
                </div>
                <p className="text-foreground/80 leading-relaxed text-lg">{currentBoard.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentBoard.officers.map((officer, index) => {
                  const profile = currentMasterOfficerProfiles[officer.id];
                  if (!profile) {
                    console.log('Missing profile for:', officer.id);
                    return null;
                  }
                  
                  return (
                    <HistoryOfficerCard
                      key={index}
                      officer={officer}
                      profile={profile}
                      onClick={openOfficerModal}
                    />
                  );
                })}
              </div>

              {/* History Officer Modal - Fixed conditional rendering */}
              {selectedOfficer && isOfficerModalOpen && (
                <HistoryOfficerModal
                  officer={selectedOfficer}
                  isOpen={isOfficerModalOpen}
                  onClose={closeOfficerModal}
                  boardId={selectedBoard || undefined}
                />
              )}
            </div>
          </div>
        )}

        {/* DEVELOPMENT TOOLS DISABLED FOR DEPLOYMENT */}
        {/* {typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 right-4 z-40">
            <button
              onClick={() => {
                localStorage.removeItem(HISTORY_SPLASH_VIEWED_KEY);
                setShowSplash(true);
                setSplashProgress(0);
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors shadow-lg"
            >
              🎬 Reset History Splash
            </button>
          </div>
        )} */}
      </div>
    </>
  );
}