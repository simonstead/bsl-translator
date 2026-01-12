'use client';

import { useState, useCallback } from 'react';
import { SentenceInput } from '@/components/SentenceInput';
import { GlossSequence } from '@/components/GlossSequence';
import { RandomWordChips } from '@/components/RandomWordChips';
import { GlossaryDrawer } from '@/components/GlossaryDrawer';
import { translateToBSL, TranslationResult } from '@/lib/text-to-gloss';

const EXAMPLE_SENTENCES = [
  'Do you want a cup of coffee?',
  'What is your name?',
  'I am learning sign language',
  'Where do you live?',
  'Yesterday I went to the shop',
  'My friend is deaf',
];

export default function Home() {
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTranslate = useCallback((sentence: string) => {
    setIsLoading(true);
    // Small delay for UX feedback
    setTimeout(() => {
      const translation = translateToBSL(sentence);
      setResult(translation);
      setIsLoading(false);
    }, 100);
  }, []);

  const handleExampleClick = useCallback(
    (sentence: string) => {
      handleTranslate(sentence);
    },
    [handleTranslate]
  );

  const handleReset = useCallback(() => {
    setResult(null);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handleReset}
              className="group text-left transition-all hover:scale-[1.02] cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-xl"
              aria-label="Reset and return to home"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 sm:h-6 sm:w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight sm:text-2xl group-hover:text-primary transition-colors">
                    BSL Translator
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    English to British Sign Language
                  </p>
                </div>
              </div>
            </button>
            <div className="flex items-center gap-2">
              <GlossaryDrawer onSelectWord={handleTranslate} />
              <a
                href="https://www.signbsl.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>Videos from</span>
                <span className="font-medium text-foreground">SignBSL.com</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3"
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
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main id="main-content" className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
        <div className="space-y-6 sm:space-y-8">
          {/* Input section */}
          <section aria-label="Translation input">
            <SentenceInput
              onTranslate={handleTranslate}
              isLoading={isLoading}
              placeholder="Type an English sentence..."
            />
          </section>

          {/* Example sentences */}
          {!result && (
            <section aria-label="Example sentences">
              <h2 className="mb-3 text-xs sm:text-sm font-medium text-muted-foreground">
                Try an example:
              </h2>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_SENTENCES.map((sentence) => (
                  <button
                    key={sentence}
                    onClick={() => handleExampleClick(sentence)}
                    className="rounded-full border bg-card px-3 py-1.5 text-xs sm:text-sm transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer"
                  >
                    {sentence}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Random word chips */}
          {!result && (
            <section aria-label="Random signs to try">
              <RandomWordChips onSelectWord={handleTranslate} />
            </section>
          )}

          {/* Results section */}
          {result && (
            <section aria-label="Translation results" aria-live="polite">
              <GlossSequence result={result} onReset={handleReset} />
            </section>
          )}

          {/* Info section */}
          {!result && (
            <section className="rounded-xl border bg-gradient-to-br from-card to-muted/20 p-4 sm:p-6" aria-label="About BSL word order">
              <h2 className="mb-3 text-base sm:text-lg font-semibold">About BSL Word Order</h2>
              <div className="space-y-3 text-xs sm:text-sm text-muted-foreground">
                <p>
                  British Sign Language (BSL) has its own grammar, different from English.
                  This tool helps you understand how sentences are structured in BSL.
                </p>
                <div className="space-y-2">
                  <h3 className="font-medium text-foreground text-sm">Key differences:</h3>
                  <ul className="space-y-2">
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">→</span>
                      <span><strong>Topic-Comment:</strong> Topic comes first. &ldquo;I want coffee&rdquo; → <span className="font-mono text-primary">COFFEE I WANT</span></span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">→</span>
                      <span><strong>Time First:</strong> Time at start. &ldquo;I went yesterday&rdquo; → <span className="font-mono text-primary">YESTERDAY I GO</span></span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">→</span>
                      <span><strong>Questions:</strong> WH-word at end. &ldquo;What is your name?&rdquo; → <span className="font-mono text-primary">NAME YOU WHAT</span></span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">→</span>
                      <span><strong>No Articles:</strong> Words like &ldquo;a&rdquo;, &ldquo;the&rdquo; are not signed.</span>
                    </li>
                  </ul>
                </div>
                <p className="pt-2 text-[11px] sm:text-xs opacity-70">
                  Note: This is a simplified educational tool. Real BSL includes facial expressions,
                  body language, and spatial grammar.
                </p>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-auto">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:py-6">
          <div className="flex flex-col items-center justify-between gap-3 text-xs sm:text-sm text-muted-foreground sm:flex-row">
            <p className="text-center sm:text-left">
              Video content from{' '}
              <a
                href="https://www.signbsl.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground hover:text-primary transition-colors"
              >
                SignBSL.com
              </a>
            </p>
            <p className="text-center sm:text-right text-[11px] sm:text-xs">
              Educational tool only. Consult native BSL users for accuracy.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
