'use client';

import { useState, useCallback, useEffect } from 'react';
import { getRandomGlosses } from '@/lib/gloss-dictionary';

interface RandomWordChipsProps {
  onSelectWord: (word: string) => void;
  count?: number;
}

export function RandomWordChips({ onSelectWord, count = 6 }: RandomWordChipsProps) {
  const [words, setWords] = useState<string[]>([]);

  const refreshWords = useCallback(() => {
    setWords(getRandomGlosses(count));
  }, [count]);

  // Initialize on mount
  useEffect(() => {
    refreshWords();
  }, [refreshWords]);

  if (words.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h2 className="text-xs sm:text-sm font-medium text-muted-foreground">
          Try a sign:
        </h2>
        <button
          onClick={refreshWords}
          className="p-2 min-h-11 min-w-11 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Get new random signs"
          title="Refresh"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {words.map((word) => (
          <button
            key={word}
            onClick={() => onSelectWord(word.toLowerCase())}
            className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs sm:text-sm font-mono font-medium text-primary transition-all hover:bg-primary hover:text-primary-foreground hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer"
          >
            {word}
          </button>
        ))}
      </div>
    </div>
  );
}
