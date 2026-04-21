'use client';

import { motion } from 'framer-motion';
import { ShoppingCart, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Recipe, Ingredient } from '@/lib/types';

interface Props {
  recipe: Recipe;
  adjustedServings: number;
  onServingsChange: (v: number) => void;
}

function formatQty(n: number): string {
  if (n < 10) return parseFloat(n.toFixed(2)).toString();
  if (n < 100) return parseFloat(n.toFixed(1)).toString();
  return Math.round(n).toString();
}

const CATEGORY_ORDER = ['Protein', 'Dairy', 'Produce', 'Grains', 'Fats', 'Pantry', 'Spices', 'Other'];

const categoryIcon: Record<string, string> = {
  Protein: '🥩', Dairy: '🧀', Produce: '🥬', Grains: '🌾',
  Fats: '🫒', Pantry: '🫙', Spices: '🌶️', Other: '📦',
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const row = {
  hidden: { opacity: 0, x: 12 },
  show: { opacity: 1, x: 0, transition: { ease: 'easeOut' as const } },
};

export default function GroceryPanel({ recipe, adjustedServings, onServingsChange }: Props) {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState(false);

  const ratio = adjustedServings / recipe.servings;

  const grouped = CATEGORY_ORDER.reduce<Record<string, Ingredient[]>>((acc, cat) => {
    const items = recipe.ingredients.filter(i => i.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});

  // Add uncategorized
  recipe.ingredients.forEach((ing, idx) => {
    if (!CATEGORY_ORDER.includes(ing.category) && !Object.values(grouped).flat().includes(ing)) {
      if (!grouped['Other']) grouped['Other'] = [];
      grouped['Other'].push(ing);
    }
  });

  const totalCost = recipe.total_estimated_cost_usd * ratio;
  const totalChecked = recipe.ingredients.filter((_, i) => checked.has(i)).length;

  function toggleCheck(idx: number) {
    setChecked(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  }

  async function copyList() {
    const lines = [`Grocery List — ${recipe.dish_name} (${adjustedServings} servings)`, '='.repeat(50), ''];
    Object.entries(grouped).forEach(([cat, ings]) => {
      lines.push(cat.toUpperCase());
      ings.forEach(ing => {
        const qty = formatQty(ing.quantity * ratio);
        lines.push(`  • ${ing.name}: ${qty} ${ing.unit}`);
      });
      lines.push('');
    });
    lines.push(`Estimated total: $${totalCost.toFixed(2)}  ($${(totalCost / adjustedServings).toFixed(2)}/serving)`);
    await navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' as const }}
      className="flex flex-col gap-5 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 lg:p-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/25">Grocery List</p>
          <p className="mt-1 text-sm text-white/40">
            {totalChecked}/{recipe.ingredients.length} items
          </p>
        </div>
        <ShoppingCart className="h-5 w-5 text-white/20" />
      </div>

      {/* Servings adjuster */}
      <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
        <span className="text-xs text-white/30">Adjust for</span>
        <input
          type="range"
          min={2}
          max={10}
          value={adjustedServings}
          onChange={e => onServingsChange(Number(e.target.value))}
          className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-white/10 accent-orange-500"
        />
        <span className="min-w-max text-sm font-bold text-orange-400">{adjustedServings} <span className="font-normal text-white/25">people</span></span>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
          initial={{ width: 0 }}
          animate={{ width: `${(totalChecked / recipe.ingredients.length) * 100}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>

      {/* Ingredient groups */}
      <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-5">
        {Object.entries(grouped).map(([cat, ings]) => (
          <div key={cat}>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm">{categoryIcon[cat] ?? '📦'}</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-white/30">{cat}</span>
            </div>
            {ings.map((ing, localIdx) => {
              const globalIdx = recipe.ingredients.indexOf(ing);
              const isChecked = checked.has(globalIdx);
              const scaledQty = formatQty(ing.quantity * ratio);
              const scaledCost = (ing.estimated_cost_usd * ratio).toFixed(2);

              return (
                <motion.div
                  key={globalIdx}
                  variants={row}
                  onClick={() => toggleCheck(globalIdx)}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/[0.03] ${isChecked ? 'opacity-40' : ''}`}
                >
                  {/* Checkbox */}
                  <div className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border transition-colors ${isChecked ? 'border-orange-500 bg-orange-500' : 'border-white/[0.15]'}`}>
                    {isChecked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                  </div>

                  {/* Name */}
                  <span className={`flex-1 text-sm text-white/75 transition-all ${isChecked ? 'line-through text-white/30' : ''}`}>
                    {ing.name}
                  </span>

                  {/* Qty */}
                  <span className="text-xs text-white/35">
                    {scaledQty} {ing.unit}
                  </span>

                  {/* Cost */}
                  <span className="min-w-[44px] text-right text-xs text-white/25">
                    ${scaledCost}
                  </span>
                </motion.div>
              );
            })}
          </div>
        ))}
      </motion.div>

      {/* Totals */}
      <div className="rounded-xl border border-white/[0.06] bg-black/20 px-4 py-3">
        <div className="flex items-center justify-between text-xs text-white/35">
          <span>Per serving</span>
          <span className="font-semibold text-white/50">${(totalCost / adjustedServings).toFixed(2)}</span>
        </div>
        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-sm font-semibold text-white/50">Total estimated</span>
          <span className="text-lg font-black text-orange-400">${totalCost.toFixed(2)}</span>
        </div>
      </div>

      {/* Copy button */}
      <button
        onClick={copyList}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 text-sm font-medium text-white/50 transition-all hover:border-orange-500/30 hover:bg-orange-500/5 hover:text-orange-400"
      >
        {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
        {copied ? 'Copied to clipboard!' : 'Copy Grocery List'}
      </button>
    </motion.div>
  );
}
