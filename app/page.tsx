'use client';

import { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Header from '@/components/Header';
import SearchSection from '@/components/SearchSection';
import LoadingState from '@/components/LoadingState';
import RecipeCard from '@/components/RecipeCard';
import GroceryPanel from '@/components/GroceryPanel';
import ChefSection from '@/components/ChefSection';
import { Recipe, AppState, DietaryFilter, ChefAttribution } from '@/lib/types';
import type { Chef } from '@/lib/chefs-data';

export default function Home() {
  const [dish, setDish] = useState('');
  const [servings, setServings] = useState(4);
  const [filters, setFilters] = useState<Set<DietaryFilter>>(new Set());
  const [appState, setAppState] = useState<AppState>('idle');
  const [streamText, setStreamText] = useState('');
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState('');
  const [adjustedServings, setAdjustedServings] = useState(4);
  const [activeChef, setActiveChef] = useState<ChefAttribution | null>(null);
  const sseAccum = useRef('');

  function toggleFilter(f: DietaryFilter) {
    setFilters(prev => {
      const next = new Set(prev);
      next.has(f) ? next.delete(f) : next.add(f);
      return next;
    });
  }

  function processChunk(chunk: string) {
    sseAccum.current += chunk;
    const blocks = sseAccum.current.split('\n\n');
    sseAccum.current = blocks.pop() ?? '';

    for (const block of blocks) {
      if (!block.trim()) continue;
      let eventType = 'message';
      let dataStr = '';

      for (const line of block.split('\n')) {
        if (line.startsWith('event:')) eventType = line.slice(6).trim();
        else if (line.startsWith('data:')) dataStr += line.slice(5).trim();
      }

      if (!dataStr) continue;

      let payload: { text?: string; recipe?: Recipe; message?: string };
      try { payload = JSON.parse(dataStr); } catch { continue; }

      if (eventType === 'delta' && payload.text) {
        setStreamText(prev => prev + payload.text);
      } else if (eventType === 'done' && payload.recipe) {
        setRecipe(payload.recipe);
        setAdjustedServings(payload.recipe.servings);
        setAppState('done');
      } else if (eventType === 'error') {
        setError(payload.message ?? 'Something went wrong. Please try again.');
        setAppState('error');
      }
    }
  }

  async function streamFrom(url: string, body: object) {
    setAppState('generating');
    setStreamText('');
    setRecipe(null);
    setError('');
    sseAccum.current = '';

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        processChunk(decoder.decode(value, { stream: true }));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Connection error. Please try again.');
      setAppState('error');
    }
  }

  function generate() {
    if (!dish.trim() || appState === 'generating') return;
    setActiveChef(null);
    streamFrom('/api/recipe', { dish: dish.trim(), servings, dietary_filters: Array.from(filters) });
  }

  function generateChefRecipe(chef: Chef, dishName: string) {
    if (appState === 'generating') return;
    setDish(dishName);
    setActiveChef({
      id: chef.id,
      name: chef.name,
      title: chef.title,
      nationality: chef.nationality,
      gradient: chef.gradient,
      handle: chef.handle,
    });
    streamFrom('/api/chef-recipe', { dish: dishName, chefId: chef.id, servings, dietary_filters: [] });
  }

  return (
    <div className="relative min-h-screen">
      {/* Sticky header */}
      <Header />

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <h1 className="mb-3 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            What are you{' '}
            <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-400 bg-clip-text text-transparent">
              cooking tonight?
            </span>
          </h1>
          <p className="text-base text-white/35">
            Type any dish — get a complete recipe, step-by-step method, and a scaled grocery list.
          </p>
        </motion.div>

        {/* Search */}
        <div className="mb-12">
          <SearchSection
            dish={dish}
            onDishChange={setDish}
            servings={servings}
            onServingsChange={setServings}
            activeFilters={filters}
            onToggleFilter={toggleFilter}
            onGenerate={generate}
            isLoading={appState === 'generating'}
          />
        </div>

        {/* State panels */}
        <AnimatePresence mode="wait">
          {appState === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Feature pills */}
              <div className="mb-6 flex flex-wrap justify-center gap-2">
                {['Full recipe', 'Grocery list', 'Cost estimate', 'Dietary filters', 'Servings adjuster'].map(f => (
                  <span key={f} className="rounded-full border border-white/[0.05] bg-white/[0.03] px-3 py-1 text-xs text-white/25">
                    {f}
                  </span>
                ))}
              </div>
              <ChefSection onSelectDish={generateChefRecipe} />
            </motion.div>
          )}

          {appState === 'generating' && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LoadingState streamText={streamText} />
            </motion.div>
          )}

          {appState === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mx-auto max-w-2xl rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center"
            >
              <p className="text-2xl mb-2">⚠️</p>
              <p className="font-semibold text-red-400">Something went wrong</p>
              <p className="mt-1 text-sm text-white/40">{error}</p>
              <button
                onClick={() => setAppState('idle')}
                className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-2 text-sm text-white/50 hover:text-white/70 transition-colors"
              >
                Try again
              </button>
            </motion.div>
          )}

          {appState === 'done' && recipe && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-4"
            >
              {/* Sticky results bar */}
              <div className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-green-400 shadow-sm shadow-green-400/50" />
                  <span className="text-sm font-medium text-white/60">
                    Recipe ready — <span className="text-white/90">{recipe.dish_name}</span>
                  </span>
                </div>
                <button
                  onClick={() => { setAppState('idle'); setRecipe(null); setActiveChef(null); }}
                  className="text-xs text-white/25 hover:text-white/50 transition-colors"
                >
                  New recipe →
                </button>
              </div>

              {/* Two-column results */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <RecipeCard recipe={recipe} adjustedServings={adjustedServings} chef={activeChef ?? undefined} />
                <GroceryPanel
                  recipe={recipe}
                  adjustedServings={adjustedServings}
                  onServingsChange={setAdjustedServings}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-24 border-t border-white/[0.04] py-8 text-center">
        <p className="text-xs text-white/20">
          Built with Claude Sonnet · QuietCookie © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
