'use client';

import { useState, useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getGlossesByCategory, getGlossCount, GLOSS_CATEGORIES } from '@/lib/gloss-dictionary';

interface GlossaryDrawerProps {
  onSelectWord: (word: string) => void;
}

export function GlossaryDrawer({ onSelectWord }: GlossaryDrawerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const glossesByCategory = useMemo(() => getGlossesByCategory(), []);
  const totalCount = useMemo(() => getGlossCount(), []);

  // Filter glosses based on search
  const filteredCategories = useMemo(() => {
    if (!search.trim()) return glossesByCategory;

    const searchLower = search.toLowerCase();
    const result: Record<string, string[]> = {};

    for (const [category, glosses] of Object.entries(glossesByCategory)) {
      const filtered = glosses.filter((gloss) =>
        gloss.toLowerCase().includes(searchLower)
      );
      if (filtered.length > 0) {
        result[category] = filtered;
      }
    }
    return result;
  }, [glossesByCategory, search]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const handleSelectWord = (word: string) => {
    onSelectWord(word.toLowerCase());
    setOpen(false);
    setSearch('');
  };

  const matchCount = useMemo(() => {
    return Object.values(filteredCategories).reduce((acc, glosses) => acc + glosses.length, 0);
  }, [filteredCategories]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <span className="hidden sm:inline">Glossary</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-hidden flex flex-col">
        <SheetHeader className="pb-2">
          <SheetTitle className="text-lg">BSL Sign Glossary</SheetTitle>
          <SheetDescription>
            {totalCount} signs available. Click any sign to see the video.
          </SheetDescription>
        </SheetHeader>

        {/* Search */}
        <div className="px-4 pb-2">
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <Input
              placeholder="Search signs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              aria-label="Search signs"
            />
          </div>
          {search && (
            <p className="mt-2 text-xs text-muted-foreground">
              {matchCount} {matchCount === 1 ? 'match' : 'matches'} found
            </p>
          )}
        </div>

        {/* Categories */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="space-y-2">
            {Object.entries(filteredCategories).map(([category, glosses]) => (
              <div key={category} className="rounded-lg border bg-card">
                <button
                  onClick={() => toggleCategory(category)}
                  className="flex w-full items-center justify-between p-3 text-left hover:bg-muted/50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary min-h-11"
                >
                  <span className="font-medium text-sm">{category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {glosses.length}
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-4 w-4 text-muted-foreground transition-transform ${
                        expandedCategories.has(category) ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                {expandedCategories.has(category) && (
                  <div className="px-3 pb-3">
                    <div className="flex flex-wrap gap-1.5">
                      {glosses.map((gloss) => (
                        <button
                          key={gloss}
                          onClick={() => handleSelectWord(gloss)}
                          className="rounded-md border border-primary/20 bg-primary/5 px-2 py-1 text-xs font-mono font-medium text-primary hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                        >
                          {gloss}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {Object.keys(filteredCategories).length === 0 && search && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No signs found for &ldquo;{search}&rdquo;</p>
              <p className="text-xs mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
