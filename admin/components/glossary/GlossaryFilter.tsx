'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Suggestion = {
  id: string;
  term_en: string;
  term_tr: string | null;
  category: string;
  abbreviation: string | null;
};

export function GlossaryFilter({
  categories,
  initial,
}: {
  categories: Record<string, string>;
  initial: { q?: string; category?: string; verified?: string };
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Controlled q
  const [q, setQ] = useState(initial.q ?? '');

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSugg, setShowSugg] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const [loading, setLoading] = useState(false);

  // initial.q dış kaynak değişimde sync
  useEffect(() => {
    setQ(initial.q ?? '');
  }, [initial.q]);

  // 1) Suggestion fetch (120ms debounce, term_en + abbreviation + term_tr ilike)
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setSuggestions([]);
      setShowSugg(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const supabase = createClient();
        const like = `%${term}%`;
        const { data } = await (supabase as any)
          .from('aviation_glossary')
          .select('id, term_en, term_tr, category, abbreviation')
          .or(`term_en.ilike.${like},abbreviation.ilike.${like},term_tr.ilike.${like}`)
          .limit(8);
        setSuggestions((data ?? []) as Suggestion[]);
        setShowSugg(true);
        setHighlightIdx(-1);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 120);
    return () => clearTimeout(t);
  }, [q]);

  // 2) URL sync (250ms debounce — table refresh)
  useEffect(() => {
    const t = setTimeout(() => {
      const sp = new URLSearchParams(params.toString());
      const trimmed = q.trim();
      const current = sp.get('q') ?? '';
      if (trimmed === current) return;
      if (trimmed) sp.set('q', trimmed);
      else sp.delete('q');
      const qs = sp.toString();
      startTransition(() => {
        router.replace(qs ? `/glossary?${qs}` : '/glossary');
      });
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  // 3) Outside click → suggestions kapat
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSugg(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function applySuggestion(s: Suggestion) {
    setQ(s.term_en);
    setShowSugg(false);
    inputRef.current?.blur();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showSugg || suggestions.length === 0) {
      if (e.key === 'Escape') setShowSugg(false);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIdx((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIdx((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Enter') {
      if (highlightIdx >= 0 && highlightIdx < suggestions.length) {
        e.preventDefault();
        applySuggestion(suggestions[highlightIdx]!);
      } else {
        setShowSugg(false);
      }
    } else if (e.key === 'Escape') {
      setShowSugg(false);
    }
  }

  function updateOther(k: string, v: string) {
    const sp = new URLSearchParams(params.toString());
    if (v) sp.set(k, v);
    else sp.delete(k);
    startTransition(() => {
      router.replace(`/glossary${sp.toString() ? `?${sp.toString()}` : ''}`);
    });
  }

  // ─── Substring highlight ─────────────────────────────────────────────
  function highlight(text: string | null, query: string) {
    if (!text) return null;
    const trimmed = query.trim();
    if (!trimmed) return text;
    const idx = text.toLowerCase().indexOf(trimmed.toLowerCase());
    if (idx < 0) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-amber-200 text-foreground rounded px-0.5">
          {text.slice(idx, idx + trimmed.length)}
        </mark>
        {text.slice(idx + trimmed.length)}
      </>
    );
  }

  return (
    <div className="flex gap-2 flex-wrap items-center">
      <div className="relative flex-1 min-w-[240px]" ref={containerRef}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="search"
          placeholder="Term ara… (term, kısaltma, TR)"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setShowSugg(true);
          }}
          onFocus={() => {
            if (suggestions.length > 0) setShowSugg(true);
          }}
          onKeyDown={onKeyDown}
          autoComplete="off"
          className="w-full pl-9 pr-9 py-2 border border-border rounded-lg text-sm bg-white"
        />
        {q && (
          <button
            onClick={() => {
              setQ('');
              setSuggestions([]);
              setShowSugg(false);
              inputRef.current?.focus();
            }}
            type="button"
            aria-label="Aramayı temizle"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {(loading || isPending) && (
          <Loader2 className="absolute right-9 top-1/2 -translate-y-1/2 w-3 h-3 animate-spin text-muted-foreground" />
        )}

        {/* Suggestions dropdown */}
        {showSugg && suggestions.length > 0 && (
          <ul
            role="listbox"
            className="absolute z-20 left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg max-h-80 overflow-y-auto"
          >
            {suggestions.map((s, i) => (
              <li
                key={s.id}
                role="option"
                aria-selected={i === highlightIdx}
                onMouseEnter={() => setHighlightIdx(i)}
                onMouseDown={(e) => {
                  e.preventDefault(); // input blur'u önle
                  applySuggestion(s);
                }}
                className={`px-3 py-2 cursor-pointer flex items-center gap-2 text-sm border-b border-border last:border-b-0 ${
                  i === highlightIdx ? 'bg-airspeak-navy/5' : 'hover:bg-secondary/30'
                }`}
              >
                <span className="font-semibold flex-shrink-0">
                  {highlight(s.term_en, q)}
                </span>
                {s.abbreviation && (
                  <span className="font-mono text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">
                    {highlight(s.abbreviation, q)}
                  </span>
                )}
                {s.term_tr && (
                  <span className="text-xs text-muted-foreground truncate">
                    · {highlight(s.term_tr, q)}
                  </span>
                )}
                <span className="ml-auto text-[10px] text-muted-foreground bg-airspeak-navy/10 px-1.5 py-0.5 rounded shrink-0">
                  {s.category}
                </span>
              </li>
            ))}
          </ul>
        )}
        {showSugg && q.trim().length >= 2 && !loading && suggestions.length === 0 && (
          <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg p-3 text-xs text-muted-foreground">
            Eşleşen terim yok
          </div>
        )}
      </div>

      <select
        value={initial.category ?? ''}
        onChange={(e) => updateOther('category', e.target.value)}
        className="border border-border rounded-lg px-3 py-2 text-sm bg-white"
      >
        <option value="">Tüm kategoriler</option>
        {Object.entries(categories).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>
      <select
        value={initial.verified ?? ''}
        onChange={(e) => updateOther('verified', e.target.value)}
        className="border border-border rounded-lg px-3 py-2 text-sm bg-white"
      >
        <option value="">Tümü</option>
        <option value="true">Doğrulanmış</option>
        <option value="false">Doğrulanmamış</option>
      </select>
    </div>
  );
}
