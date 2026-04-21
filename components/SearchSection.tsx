'use client';

import { motion } from 'framer-motion';
import { Sparkles, ChevronRight } from 'lucide-react';
import { DietaryFilter } from '@/lib/types';

const FILTERS: { key: DietaryFilter; label: string; emoji: string }[] = [
  { key: 'vegetarian', label: 'Vegetarian', emoji: '🥦' },
  { key: 'vegan', label: 'Vegan', emoji: '🌱' },
  { key: 'gluten-free', label: 'Gluten-Free', emoji: '🌾' },
  { key: 'keto', label: 'Keto', emoji: '🥩' },
];

const SUGGESTIONS = ['Butter Chicken', 'Tiramisu', 'Pad Thai', 'Beef Tacos', 'Ramen', 'Shakshuka'];

interface Props {
  dish: string;
  onDishChange: (v: string) => void;
  servings: number;
  onServingsChange: (v: number) => void;
  activeFilters: Set<DietaryFilter>;
  onToggleFilter: (f: DietaryFilter) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export default function SearchSection({
  dish, onDishChange, servings, onServingsChange,
  activeFilters, onToggleFilter, onGenerate, isLoading,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' as const }}
      className="mx-auto w-full max-w-2xl"
    >
      {/* Main input */}
      <div className="relative">
        <input
          type="text"
          value={dish}
          onChange={e => onDishChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !isLoading && onGenerate()}
          placeholder="What would you like to cook?"
          disabled={isLoading}
          className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] px-6 py-4 pr-36 text-base text-white placeholder-white/25 outline-none transition-all duration-200 focus:border-orange-500/50 focus:bg-white/[0.06] focus:shadow-[0_0_0_1px_rgba(249,115,22,0.3),0_0_24px_rgba(249,115,22,0.1)] disabled:opacity-50"
        />
        <button
          onClick={onGenerate}
          disabled={isLoading || !dish.trim()}
          className="absolute right-2 top-2 flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all duration-200 hover:shadow-orange-500/40 hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          {isLoading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {isLoading ? 'Cooking…' : 'Generate'}
        </button>
      </div>

      {/* Suggestion chips */}
      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map(s => (
          <button
            key={s}
            onClick={() => onDishChange(s)}
            className="rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1 text-xs text-white/35 transition-colors hover:border-orange-500/30 hover:text-white/60"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Dietary filters */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-white/25">Dietary:</span>
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => onToggleFilter(f.key)}
            className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-150 ${
              activeFilters.has(f.key)
                ? 'border-orange-500/50 bg-orange-500/10 text-orange-400'
                : 'border-white/[0.07] bg-white/[0.03] text-white/40 hover:border-white/15 hover:text-white/60'
            }`}
          >
            <span>{f.emoji}</span>
            {f.label}
          </button>
        ))}
      </div>

      {/* Servings slider */}
      <div className="mt-5 flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
        <span className="min-w-max text-xs font-medium text-white/35">Servings</span>
        <input
          type="range"
          min={2}
          max={10}
          value={servings}
          onChange={e => onServingsChange(Number(e.target.value))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-orange-500 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-b [&::-webkit-slider-thumb]:from-orange-400 [&::-webkit-slider-thumb]:to-orange-600 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:shadow-orange-500/40"
        />
        <span className="min-w-max text-sm font-bold text-orange-400">{servings} <span className="font-normal text-white/30">people</span></span>
      </div>
    </motion.div>
  );
}
