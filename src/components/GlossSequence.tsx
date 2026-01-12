'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { SignVideo } from './SignVideo';
import { TranslationResult, getTranslationStats } from '@/lib/text-to-gloss';

interface GlossSequenceProps {
  result: TranslationResult;
  onReset?: () => void;
}

export function GlossSequence({ result, onReset }: GlossSequenceProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);
  const [isPlayingAll, setIsPlayingAll] = useState(true); // true = sequence mode, false = single video mode

  // Keyboard shortcuts for number keys 1-9
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = e.key;
      // Handle number keys 1-9 (play single video only)
      if (key >= '1' && key <= '9') {
        const index = parseInt(key) - 1;
        if (index < result.glossSequence.length) {
          setActiveIndex(index);
          setIsPlayingAll(false); // Single video mode - won't continue to next
        }
      }
      // Handle Escape to reset
      if (key === 'Escape' && onReset) {
        onReset();
      }
      // Handle Space to play all
      if (key === ' ') {
        e.preventDefault();
        setIsPlayingAll(true);
        setActiveIndex(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [result.glossSequence.length, onReset]);

  const stats = getTranslationStats(result);

  const handlePlayAll = useCallback(() => {
    if (result.glossSequence.length === 0) return;
    setIsPlayingAll(true);
    setActiveIndex(0);
  }, [result.glossSequence.length]);

  const handleVideoEnded = useCallback(() => {
    if (!isPlayingAll) {
      // Single video mode - just stop
      setActiveIndex(null);
      return;
    }
    // Sequence mode - continue to next
    setActiveIndex((prev) => {
      if (prev === null) return null;
      const next = prev + 1;
      if (next >= result.glossSequence.length) {
        setIsPlayingAll(false);
        return null;
      }
      return next;
    });
  }, [result.glossSequence.length, isPlayingAll]);

  const handleStop = useCallback(() => {
    setIsPlayingAll(false);
    setActiveIndex(null);
  }, []);

  if (result.glossSequence.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">
          No translatable words found. Try a different sentence.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Original and Gloss display */}
      <div className="space-y-3 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 p-4 sm:p-6 border">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Original</p>
            <p className="text-base sm:text-lg">&ldquo;{result.originalSentence}&rdquo;</p>
          </div>
          {result.isQuestion && (
            <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {result.questionType === 'wh' ? 'WH Question' : 'Yes/No Question'}
            </span>
          )}
        </div>
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">BSL Gloss</p>
          <div className="flex flex-wrap gap-2">
            {result.glossSequence.map((item, index) => (
              <span
                key={`${item.gloss}-${index}`}
                className={`font-mono text-base sm:text-lg font-semibold uppercase tracking-wider px-2 py-1 rounded transition-all duration-200 ${
                  activeIndex === index
                    ? 'bg-primary text-primary-foreground scale-110'
                    : 'text-primary/70 hover:text-primary'
                }`}
              >
                {item.gloss}
              </span>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground italic pt-1">
          {result.explanation}
        </p>
      </div>

      {/* Playback controls */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <Button
          onClick={activeIndex !== null ? handleStop : handlePlayAll}
          variant={activeIndex !== null ? 'destructive' : 'default'}
          className="gap-2"
          aria-label={activeIndex !== null ? 'Stop playback' : 'Play all signs in sequence'}
        >
          {activeIndex !== null ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <rect x="6" y="6" width="12" height="12" />
              </svg>
              Stop
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
              Play All
            </>
          )}
        </Button>

        {onReset && (
          <Button
            onClick={onReset}
            variant="outline"
            className="gap-2"
            aria-label="Clear and start new translation"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Clear
          </Button>
        )}

        {/* Stats */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground ml-auto">
          <span>{stats.totalGlosses} signs</span>
          {stats.unknownGlosses > 0 && (
            <span className="text-amber-600 dark:text-amber-400">
              {stats.unknownGlosses} not found
            </span>
          )}
        </div>
      </div>

      {/* Video grid */}
      <div
        className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4"
        role="list"
        aria-label="BSL sign sequence"
      >
        {result.glossSequence.map((glossResult, index) => (
          <div key={`${glossResult.gloss}-${index}`} role="listitem">
            <SignVideo
              glossResult={glossResult}
              index={index}
              isActive={activeIndex === index}
              onEnded={handleVideoEnded}
            />
          </div>
        ))}
      </div>

      {/* Keyboard shortcuts help */}
      <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 bg-muted rounded border text-[10px] font-mono">1-9</kbd>
          <span>play sign</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 bg-muted rounded border text-[10px] font-mono">Space</kbd>
          <span>play all</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 bg-muted rounded border text-[10px] font-mono">Esc</kbd>
          <span>clear</span>
        </span>
      </div>
    </div>
  );
}
