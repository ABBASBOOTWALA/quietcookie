'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchChefs } from '@/lib/chefs-data';
import type { Chef, ChefCategory } from '@/lib/chefs-data';

const CATEGORIES: { key: ChefCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'michelin', label: '⭐ Michelin' },
  { key: 'tv', label: '📺 TV Chefs' },
  { key: 'creator', label: '📱 Creators' },
  { key: 'regional', label: '🗺️ Regional' },
];

interface Props {
  onSelectDish: (chef: Chef, dish: string) => void;
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('');
}

export default function ChefSection({ onSelectDish }: Props) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ChefCategory | 'all'>('all');

  const chefs = searchChefs(query, category === 'all' ? undefined : category);

  return (
    <section className="mt-20">
      {/* Header */}
      <div className="mb-7 text-center">
        <h2 className="text-2xl font-bold text-white/75">
          Cook with the{' '}
          <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
            World's Best Chefs
          </span>
        </h2>
        <p className="mt-1.5 text-sm text-white/25">
          Pick a chef — AI generates their recipe in their exact style
        </p>
      </div>

      {/* Controls */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex gap-2 overflow-x-auto pb-0.5 [&::-webkit-scrollbar]:hidden">
          {CATEGORIES.map(c => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={`flex-none rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                category === c.key
                  ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                  : 'border border-white/[0.06] bg-white/[0.02] text-white/35 hover:text-white/55'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search chefs, cuisine..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="flex-1 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-2 text-sm text-white/65 placeholder:text-white/20 outline-none focus:border-orange-500/35 transition-colors"
        />
      </div>

      {/* Grid */}
      <AnimatePresence mode="popLayout">
        {chefs.length > 0 ? (
          <motion.div
            key="grid"
            layout
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          >
            {chefs.map(chef => (
              <ChefCard key={chef.id} chef={chef} onSelectDish={onSelectDish} />
            ))}
          </motion.div>
        ) : (
          <motion.p
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-14 text-center text-sm text-white/20"
          >
            No chefs found for &ldquo;{query}&rdquo;
          </motion.p>
        )}
      </AnimatePresence>
    </section>
  );
}

function ChefCard({ chef, onSelectDish }: { chef: Chef; onSelectDish: (chef: Chef, dish: string) => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="flex flex-col rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 hover:border-white/[0.10] hover:bg-white/[0.035] transition-colors"
    >
      {/* Avatar */}
      <div className={`mx-auto mb-3 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${chef.gradient} text-base font-black text-white shadow-lg`}>
        {initials(chef.name)}
      </div>

      {/* Info */}
      <div className="mb-3 text-center">
        <p className="text-sm font-semibold leading-tight text-white/85">{chef.name}</p>
        <p className="mt-0.5 text-[10px] leading-snug text-white/35 line-clamp-2">{chef.title}</p>
        <p className="mt-1 text-[10px] text-white/25">{chef.nationality}</p>
        {chef.handle && (
          <p className="mt-0.5 text-[10px] text-orange-400/50">{chef.handle}</p>
        )}
        {chef.stars && (
          <p className="mt-1 text-[10px] text-amber-400/60">
            {'⭐'.repeat(Math.min(chef.stars, 5))}
            {chef.stars > 5 ? ` ×${chef.stars}` : ''}
          </p>
        )}
      </div>

      {/* Dish chips */}
      <div className="mt-auto flex flex-col gap-1.5">
        <p className="text-center text-[9px] font-semibold uppercase tracking-widest text-white/20 mb-0.5">Make this</p>
        {chef.signatureDishes.slice(0, 2).map(dish => (
          <button
            key={dish}
            onClick={() => onSelectDish(chef, dish)}
            className="w-full rounded-lg border border-white/[0.07] bg-white/[0.03] px-2 py-1.5 text-[10px] leading-tight text-white/55 hover:border-orange-500/25 hover:bg-orange-500/5 hover:text-orange-300 transition-all text-center"
          >
            {dish}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
