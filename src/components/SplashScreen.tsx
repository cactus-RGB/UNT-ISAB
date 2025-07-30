import React, { useState, useEffect, useRef } from 'react';

interface VideoSplashScreenProps {
  isVisible: boolean;
  onComplete: () => void;
  videoSrc: string; // Path to your Canva MP4 file
  minDisplayTime?: number; // Minimum time to show splash (ms)
  loadingProgress?: number; // 0-100 progress for fallback
}

export default function VideoSplashScreen({
  isVisible,
  onComplete,
  videoSrc,
  minDisplayTime = 3000,
  loadingProgress = 0
}: VideoSplashScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [phase, setPhase] = useState<'loading' | 'playing' | 'ending'>('loading');

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
      console.log('[Splash]: Video ended');
      setVideoEnded(true);
      setPhase('ending');
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

  // Handle completion timing
  useEffect(() => {
    if (!isVisible) return;

    let completionTimer: NodeJS.Timeout;

    if (videoEnded) {
      // Video ended naturally - wait a moment then complete
      completionTimer = setTimeout(() => {
        onComplete();
      }, 500);
    } else {
      // Ensure minimum display time even if video is shorter
      completionTimer = setTimeout(() => {
        onComplete();
      }, minDisplayTime);
    }

    return () => clearTimeout(completionTimer);
  }, [videoEnded, isVisible, onComplete, minDisplayTime]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* Video Player */}
      {!showFallback && (
        <video
          ref={videoRef}
          className={`max-w-full max-h-full object-contain transition-opacity duration-500 ${
            videoLoaded ? 'opacity-100' : 'opacity-0'
          }`}
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
        <div className={`absolute inset-0 bg-gradient-to-br from-green-50 via-gray-50 to-green-100 flex items-center justify-center transition-opacity duration-500 ${
          showFallback || !videoLoaded ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="text-center">
            {/* ISAB Logo Placeholder */}
            <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-2xl">
              <div className="text-white text-2xl font-bold">ISAB</div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              International Student Advisory Board
            </h1>
            <p className="text-gray-600 mb-8">University of North Texas</p>

            {/* Loading Animation */}
            <div className="flex items-center justify-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
              <span className="text-green-600 font-medium ml-4">
                {showFallback ? 'Loading...' : `Loading video... ${Math.round(loadingProgress)}%`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Skip Button (appears after a few seconds) */}
      {videoLoaded && phase === 'playing' && (
        <button
          onClick={onComplete}
          className="absolute top-6 right-6 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 opacity-0 animate-fade-in"
          style={{ animationDelay: '3s', animationFillMode: 'forwards' }}
        >
          Skip →
        </button>
      )}

      {/* Click to Skip (mobile-friendly) */}
      {videoLoaded && phase === 'playing' && (
        <div 
          className="absolute inset-0 cursor-pointer opacity-0 animate-fade-in"
          onClick={onComplete}
          style={{ animationDelay: '4s', animationFillMode: 'forwards' }}
        >
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-lg text-sm">
            Tap to skip
          </div>
        </div>
      )}

      {/* Custom CSS for fade-in animation */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}