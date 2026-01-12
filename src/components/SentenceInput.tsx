'use client';

import { useState, useCallback, FormEvent, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SentenceInputProps {
  onTranslate: (sentence: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function SentenceInput({
  onTranslate,
  isLoading = false,
  placeholder = 'Type your sentence in English...',
}: SentenceInputProps) {
  const [sentence, setSentence] = useState('');

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const trimmed = sentence.trim();
      if (trimmed && !isLoading) {
        onTranslate(trimmed);
      }
    },
    [sentence, isLoading, onTranslate]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const trimmed = sentence.trim();
        if (trimmed && !isLoading) {
          onTranslate(trimmed);
        }
      }
    },
    [sentence, isLoading, onTranslate]
  );

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Input
            type="text"
            value={sentence}
            onChange={(e) => setSentence(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            className="h-11 sm:h-12 pr-4 text-sm sm:text-base rounded-xl border-2 focus:border-primary transition-colors"
            aria-label="Enter English sentence to translate to BSL"
            aria-describedby="input-help"
          />
        </div>
        <Button
          type="submit"
          disabled={!sentence.trim() || isLoading}
          className="h-11 sm:h-12 px-4 sm:px-6 text-sm sm:text-base font-medium rounded-xl shadow-md hover:shadow-lg transition-all"
          aria-label="Translate sentence to BSL"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span className="hidden sm:inline">Translating...</span>
              <span className="sm:hidden">...</span>
            </span>
          ) : (
            <>
              <span className="hidden sm:inline">Translate to BSL</span>
              <span className="sm:hidden">Translate</span>
            </>
          )}
        </Button>
      </div>
      <p id="input-help" className="sr-only">
        Enter an English sentence and press Enter or click Translate to see it in British Sign Language gloss order with video demonstrations.
      </p>
    </form>
  );
}
