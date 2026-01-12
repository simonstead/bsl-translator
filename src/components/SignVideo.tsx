'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { GlossResult } from '@/lib/text-to-gloss';

interface SignVideoProps {
  glossResult: GlossResult;
  index: number;
  isActive?: boolean;
  onPlay?: () => void;
  onEnded?: () => void;
}

export function SignVideo({
  glossResult,
  index,
  isActive = false,
  onPlay,
  onEnded,
}: SignVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { gloss, signEntry, isUnknown, searchUrl } = glossResult;

  // Construct media URLs from SignBSL
  const videoUrl = signEntry?.videoUrl;

  // Handle external play trigger (for "Play All")
  useEffect(() => {
    if (isActive && videoRef.current && !isPlaying) {
      videoRef.current.play().catch(() => {
        // Autoplay failed, user interaction required
        setHasError(true);
      });
    }
  }, [isActive, isPlaying]);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    onPlay?.();
  }, [onPlay]);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    onEnded?.();
  }, [onEnded]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  const handleVideoClick = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => setHasError(true));
      } else {
        videoRef.current.pause();
      }
    }
  }, []);

  const handleOpenExternal = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const url = signEntry?.signbslUrl || searchUrl;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [signEntry, searchUrl]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (videoUrl && !hasError) {
        handleVideoClick();
      } else {
        window.open(signEntry?.signbslUrl || searchUrl, '_blank', 'noopener,noreferrer');
      }
    }
  };

  return (
    <Card
      className={`relative transition-all hover:shadow-md focus-within:ring-2 focus-within:ring-primary rounded-xl overflow-hidden ${
        isActive ? 'ring-2 ring-primary shadow-lg scale-[1.02]' : ''
      } ${isUnknown ? 'border-dashed border-muted-foreground/50' : ''}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`BSL sign for ${gloss}${isUnknown ? ' (not in dictionary)' : ''}`}
    >
      <CardContent className="p-2 sm:p-3">
        {/* Video container */}
        <div className="relative mb-1.5 sm:mb-2 aspect-video w-full overflow-hidden rounded-lg bg-muted">
          {isUnknown || !videoUrl || hasError ? (
            // Unknown word or error - show fallback
            <button
              onClick={handleOpenExternal}
              className="flex h-full w-full items-center justify-center hover:bg-muted/80 transition-colors"
              aria-label={`${isUnknown ? 'Search for' : 'View'} ${gloss} on SignBSL`}
            >
              <div className="text-center">
                {isUnknown ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mx-auto h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mx-auto h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                )}
                <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">
                  {isUnknown ? 'Search' : 'Open SignBSL'}
                </p>
              </div>
            </button>
          ) : (
            // Video player
            <div className="relative h-full w-full cursor-pointer" onClick={handleVideoClick}>
              {/* Play button overlay */}
              {!isPlaying && (
                <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                  <svg viewBox="0 0 200 200" className="h-10 w-10 sm:h-14 sm:w-14 drop-shadow-lg" aria-hidden="true">
                    <circle cx="100" cy="100" r="90" fill="none" strokeWidth="15" stroke="white" opacity="0.9" />
                    <polygon points="70, 55 70, 145 145, 100" fill="white" opacity="0.9" />
                  </svg>
                </div>
              )}

              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                preload="metadata"
                playsInline
                onPlay={handlePlay}
                onEnded={handleEnded}
                onPause={handlePause}
                onError={handleError}
                aria-label={`Video showing BSL sign for ${gloss}`}
              >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support HTML5 video.
              </video>
            </div>
          )}

          {/* Index badge */}
          <div className="absolute left-1.5 top-1.5 sm:left-2 sm:top-2 z-20 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-background/95 text-[10px] sm:text-xs font-bold shadow-md">
            {index + 1}
          </div>

          {/* Active indicator */}
          {isActive && (
            <div className="absolute right-1.5 top-1.5 sm:right-2 sm:top-2 z-20">
              <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-primary"></span>
              </span>
            </div>
          )}
        </div>

        {/* Gloss label and external link */}
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs sm:text-sm font-semibold uppercase tracking-wide truncate">
            {gloss}
          </p>
          <button
            onClick={handleOpenExternal}
            className="p-0.5 sm:p-1 text-muted-foreground hover:text-foreground transition-colors shrink-0"
            aria-label={`Open ${gloss} on SignBSL.com`}
            title="Open on SignBSL.com"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5 sm:h-4 sm:w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </button>
        </div>
        {isUnknown && (
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Not in dictionary
          </p>
        )}
      </CardContent>
    </Card>
  );
}
