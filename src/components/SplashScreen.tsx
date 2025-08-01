import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';

interface VideoSplashScreenProps {
  isVisible: boolean;
  onComplete: () => void;
  videoSrc: string; // Path to your Canva MP4 file
  loadingProgress?: number; // 0-100 progress for fallback
}

export default function VideoSplashScreen({
  isVisible,
  onComplete,
  videoSrc,
  loadingProgress = 0
}: VideoSplashScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [phase, setPhase] = useState<'loading' | 'playing' | 'ended'>('loading');
  const [showNextButton, setShowNextButton] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

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
      });
    };

    const handleEnded = () => {
      console.log('[Splash]: Video ended, showing Next button');
      setPhase('ended');
      setShowNextButton(true);
    };

    const handleError = (error: Event) => {
      console.error('[Splash]: Video load error:', error);
      setShowFallback(true);
    };

    const handleLoadStart = () => {
      console.log('[Splash]: Video loading started');
    };

    // Add event listeners
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('loadstart', handleLoadStart);

    // Fallback timeout - show fallback if video takes too long to load
    const fallbackTimer = setTimeout(() => {
      if (!videoLoaded) {
        console.log('[Splash]: Video taking too long, showing fallback');
        setShowFallback(true);
        // Show next button after a delay for fallback
        setTimeout(() => setShowNextButton(true), 3000);
      }
    }, 2000);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadstart', handleLoadStart);
      clearTimeout(fallbackTimer);
    };
  }, [isVisible, videoLoaded]);

  // Handle next button click with smooth transition
  const handleNext = () => {
    setIsTransitioning(true);
    
    // Start the transition animation
    setTimeout(() => {
      onComplete();
    }, 800); // Match this with CSS transition duration
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-50 bg-black flex items-center justify-center transition-all duration-800 ease-in-out ${
      isTransitioning ? 'opacity-0 scale-110' : 'opacity-100 scale-100'
    }`}>
      {/* Video Player */}
      {!showFallback && (
        <video
          ref={videoRef}
          className={`max-w-full max-h-full object-contain transition-all duration-500 ${
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
      )}

      {/* Loading State / Fallback */}
      {(!videoLoaded || showFallback) && (
        <div className={`absolute inset-0 bg-gradient-to-br from-green-50 via-gray-50 to-green-100 flex items-center justify-center transition-all duration-500 ${
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

            {/* Loading Animation */}
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
                  {showFallback ? 'Preparing history...' : `Loading video... ${Math.round(loadingProgress)}%`}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Skip Button (appears during video playback) */}
      {videoLoaded && phase === 'playing' && !isTransitioning && (
        <button
          onClick={handleNext}
          className="absolute top-6 right-6 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 opacity-0 animate-fade-in"
          style={{ animationDelay: '3s', animationFillMode: 'forwards' }}
        >
          Skip →
        </button>
      )}

      {/* Next Button (appears when video ends or fallback is ready) */}
      {showNextButton && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`text-center transition-all duration-700 ${
            isTransitioning ? 'transform scale-95 opacity-0' : 'transform scale-100 opacity-100'
          }`}>
            <div className="bg-black/70 backdrop-blur-sm rounded-2xl p-8 max-w-sm mx-4 border border-white/10">
              <h3 className="text-white text-xl font-bold mb-4">
                Ready to explore our history?
              </h3>
              <p className="text-white/80 mb-6 text-sm">
                Discover the journey of ISAB and the leaders who shaped our community.
              </p>
              <button
                onClick={handleNext}
                disabled={isTransitioning}
                className={`bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2 w-full ${
                  isTransitioning ? 'opacity-50 cursor-not-allowed' : 'opacity-100'
                }`}
              >
                <span>{isTransitioning ? 'Loading History...' : 'Continue to History'}</span>
                <ChevronRight className={`h-5 w-5 transition-transform duration-300 ${
                  isTransitioning ? 'translate-x-2' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click to Skip (mobile-friendly) - only during video playback */}
      {videoLoaded && phase === 'playing' && !isTransitioning && (
        <div 
          className="absolute inset-0 cursor-pointer opacity-0 animate-fade-in"
          onClick={handleNext}
          style={{ animationDelay: '4s', animationFillMode: 'forwards' }}
        >
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-lg text-sm">
            Tap to skip
          </div>
        </div>
      )}

      {/* Transition Overlay */}
      {isTransitioning && (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-white animate-fade-in-fast pointer-events-none" />
      )}
    </div>
  );
}