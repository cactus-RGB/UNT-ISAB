import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';

interface VideoSplashScreenProps {
  isVisible: boolean;
  onComplete: () => void;
  videoSrc: string; // Path to your Canva MP4 file
  loadingProgress?: number; // 0-100 progress for fallback (kept for compatibility)
}

export default function VideoSplashScreen({
  isVisible,
  onComplete,
  videoSrc
}: VideoSplashScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [phase, setPhase] = useState<'loading' | 'playing' | 'ended'>('loading');
  const [showNextButton, setShowNextButton] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [buttonStable, setButtonStable] = useState(false); // Ensures button stays once shown

  // Timer to ensure button shows regardless of video state
  useEffect(() => {
    if (!isVisible) return;

    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible]);

  // Show button after minimum time has elapsed and make it stable
  useEffect(() => {
    if (timeElapsed >= 3 && !buttonStable) {
      setShowNextButton(true);
      setButtonStable(true); // Once shown, never hide again
    }
  }, [timeElapsed, buttonStable]);

  // Handle video loading
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVisible) return;

    const handleCanPlay = () => {
      console.log('[Splash]: Video loaded and ready to play');
      setVideoLoaded(true);
      setPhase('playing');
      
      // Start playing the video
      video.play().catch(error => {
        console.error('[Splash]: Error playing video:', error);
        setShowFallback(true);
        // Ensure button shows if video fails
        setTimeout(() => setShowNextButton(true), 1000);
      });
    };

    const handleEnded = () => {
      console.log('[Splash]: Video ended, ensuring Next button is visible');
      setPhase('ended');
      setShowNextButton(true);
      setButtonStable(true); // Ensure it stays visible
    };

    const handleError = (error: Event) => {
      console.error('[Splash]: Video load error:', error);
      setShowFallback(true);
      // Immediately show button if video fails
      setShowNextButton(true);
      setButtonStable(true);
    };

    const handleLoadStart = () => {
      console.log('[Splash]: Video loading started');
    };

    // Add event listeners
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('loadstart', handleLoadStart);

    // Fallback timer - show fallback if video takes too long to load
    const fallbackTimer = setTimeout(() => {
      if (!videoLoaded) {
        console.log('[Splash]: Video taking too long, showing fallback');
        setShowFallback(true);
        setShowNextButton(true);
      }
    }, 3000);

    // Emergency button timer - ensure button always appears and stays
    const emergencyButtonTimer = setTimeout(() => {
      console.log('[Splash]: Emergency button activation');
      setShowNextButton(true);
      setButtonStable(true);
    }, 5000);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadstart', handleLoadStart);
      clearTimeout(fallbackTimer);
      clearTimeout(emergencyButtonTimer);
    };
  }, [isVisible, videoLoaded]);

  // Handle next button click with smooth transition
  const handleNext = () => {
    if (isTransitioning) return; // Prevent double-clicks
    
    setIsTransitioning(true);
    
    // Start the transition animation
    setTimeout(() => {
      onComplete();
    }, 800); // Match this with CSS transition duration
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-50 bg-black transition-all duration-800 ease-in-out overflow-hidden ${
      isTransitioning ? 'opacity-0 scale-110' : 'opacity-100 scale-100'
    }`}>
      {/* Video Container - Proper mobile-responsive positioning */}
      <div className="flex flex-col h-full">
        {/* Video Player - Flexible height container */}
        {!showFallback && (
          <div className="flex-1 flex items-center justify-center min-h-0">
            <video
              ref={videoRef}
              className={`w-full h-auto max-w-full max-h-full object-contain transition-all duration-500 ${
                videoLoaded ? 'opacity-100' : 'opacity-0'
              } ${isTransitioning ? 'scale-110 blur-sm' : 'scale-100'}`}
              preload="auto"
              playsInline
              muted // Required for autoplay on most browsers
              disablePictureInPicture
              controlsList="nodownload nofullscreen noremoteplayback"
            >
              <source src={videoSrc} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {/* Loading State / Fallback - Takes full height when video not loaded */}
        {(!videoLoaded || showFallback) && (
          <div className={`absolute inset-0 bg-gradient-to-br from-green-50 via-gray-50 to-green-100 flex flex-col justify-center transition-all duration-500 ${
            showFallback || !videoLoaded ? 'opacity-100' : 'opacity-0'
          } ${isTransitioning ? 'scale-110 blur-sm' : 'scale-100'}`}>
            <div className="text-center max-w-md mx-auto px-4">
              {/* ISAB Logo Placeholder */}
              <div className={`w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-2xl transition-all duration-700 ${
                isTransitioning ? 'scale-150 rotate-12' : 'scale-100 rotate-0'
              }`}>
                <div className="text-white text-2xl font-bold">ISAB</div>
              </div>

              {/* Title */}
              <h1 className={`text-3xl font-bold text-gray-800 mb-2 transition-all duration-700 ${
                isTransitioning ? 'transform translate-y-4 opacity-0' : 'transform translate-y-0 opacity-100'
              }`}>
                International Student Advisory Board
              </h1>
              <p className={`text-gray-600 mb-4 transition-all duration-700 delay-100 ${
                isTransitioning ? 'transform translate-y-4 opacity-0' : 'transform translate-y-0 opacity-100'
              }`}>University of North Texas</p>
              <p className={`text-gray-500 mb-8 text-lg transition-all duration-700 delay-200 ${
                isTransitioning ? 'transform translate-y-4 opacity-0' : 'transform translate-y-0 opacity-100'
              }`}>
                Celebrating Our Legacy of Leadership
              </p>

              {/* Loading Animation - only show if button isn't visible yet */}
              {!showNextButton && (
                <div className={`flex items-center justify-center space-x-2 transition-all duration-700 delay-300 ${
                  isTransitioning ? 'transform translate-y-4 opacity-0' : 'transform translate-y-0 opacity-100'
                }`}>
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                  <span className="text-green-600 font-medium ml-4">
                    {showFallback ? 'Preparing history...' : `Loading... ${Math.min(timeElapsed * 20, 100)}%`}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Continue Button - FIXED: Now directly under content, no scrolling needed */}
        {(showNextButton || buttonStable) && (
          <div className="px-4 pb-8 flex flex-col items-center space-y-4 bg-black/20 backdrop-blur-sm">
            <div className={`text-center transition-all duration-700 ${
              isTransitioning ? 'transform scale-95 opacity-0' : 'transform scale-100 opacity-100'
            }`}>
              <div className="mb-4">
                <p className="text-white/90 text-sm font-medium">
                  {phase === 'ended' ? 'Explore our history and legacy' : 'Continue to our story'}
                </p>
              </div>
              <button
                onClick={handleNext}
                disabled={isTransitioning}
                className={`group bg-white/95 hover:bg-white text-gray-900 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-3 shadow-2xl backdrop-blur-sm border-2 border-white/50 ${
                  isTransitioning ? 'opacity-50 cursor-not-allowed' : 'opacity-100'
                }`}
              >
                <span>{isTransitioning ? 'Loading...' : 'Continue'}</span>
                <ChevronRight className={`h-6 w-6 transition-all duration-300 ${
                  isTransitioning ? 'translate-x-2' : 'translate-x-0 group-hover:translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Click to Continue (mobile-friendly) - only during video playback */}
      {videoLoaded && phase === 'playing' && timeElapsed >= 4 && !showNextButton && !isTransitioning && (
        <div 
          className="absolute inset-0 cursor-pointer z-10"
          onClick={handleNext}
        >
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm">
            Tap to continue
          </div>
        </div>
      )}

      {/* Transition Overlay */}
      {isTransitioning && (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-white animate-fade-in-fast pointer-events-none z-30" />
      )}
    </div>
  );
}