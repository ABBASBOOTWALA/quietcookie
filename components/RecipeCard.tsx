'use client';

import { motion } from 'framer-motion';
import { Clock, Flame, ChefHat, DollarSign } from 'lucide-react';
import { Recipe, ChefAttribution } from '@/lib/types';

const difficultyColor = {
  Easy: 'text-green-400 bg-green-400/10 border-green-400/20',
  Medium: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  Hard: 'text-red-400 bg-red-400/10 border-red-400/20',
};

interface Props {
  recipe: Recipe;
  adjustedServings: number;
  chef?: ChefAttribution;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { ease: 'easeOut' as const } },
};

export default function RecipeCard({ recipe, adjustedServings, chef }: Props) {
  const costPerServing = (recipe.total_estimated_cost_usd / recipe.servings).toFixed(2);
  const scaledCostPerServing = (
    (recipe.total_estimated_cost_usd / recipe.servings) * (adjustedServings / recipe.servings) * recipe.servings / adjustedServings
  ).toFixed(2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' as const }}
      className="flex flex-col gap-6 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 lg:p-8"
    >
      {/* Chef attribution */}
      {chef && (
        <div className={`-mx-6 -mt-6 lg:-mx-8 lg:-mt-8 mb-0 px-6 py-3 lg:px-8 rounded-t-2xl bg-gradient-to-r ${chef.gradient} bg-opacity-10`}
          style={{ background: 'rgba(255,255,255,0.025)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2.5">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${chef.gradient} text-xs font-black text-white`}>
              {chef.name.split(' ').slice(0, 2).map(w => w[0]).join('')}
            </div>
            <div>
              <p className="text-xs font-semibold text-white/75">{chef.name}</p>
              <p className="text-[10px] text-white/35">{chef.title} · {chef.nationality}</p>
            </div>
            <span className="ml-auto text-[10px] text-white/20 italic">in their style</span>
          </div>
        </div>
      )}

      {/* Dish name */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/25">Recipe</p>
        <h2 className="bg-gradient-to-br from-white via-white/90 to-white/60 bg-clip-text text-3xl font-black leading-tight tracking-tight text-transparent lg:text-4xl">
          {recipe.dish_name}
        </h2>
      </div>

      {/* Meta badges */}
      <div className="flex flex-wrap gap-2">
        <span className="flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/60">
          <Clock className="h-3.5 w-3.5 text-orange-400" />
          {recipe.prep_time} prep
        </span>
        <span className="flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/60">
          <Flame className="h-3.5 w-3.5 text-orange-400" />
          {recipe.cook_time} cook
        </span>
        <span className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium ${difficultyColor[recipe.difficulty]}`}>
          <ChefHat className="h-3.5 w-3.5" />
          {recipe.difficulty}
        </span>
        <span className="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
          <DollarSign className="h-3.5 w-3.5" />
          ${scaledCostPerServing} / serving
        </span>
      </div>

      {/* Description */}
      <p className="text-sm leading-relaxed text-white/45 italic">
        {recipe.description}
      </p>

      {/* Steps */}
      <div>
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/25">Method</p>
        <motion.ol
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-4"
        >
          {recipe.steps.map((step, i) => (
            <motion.li key={i} variants={item} className="flex gap-4">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-[11px] font-bold text-white shadow-sm shadow-orange-500/30">
                {i + 1}
              </span>
              <p className="text-sm leading-relaxed text-white/70">{step}</p>
            </motion.li>
          ))}
        </motion.ol>
      </div>

      {/* Tips */}
      {recipe.tips.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/25">Chef's Tips</p>
          <div className="flex flex-col gap-2.5">
            {recipe.tips.map((tip, i) => (
              <div key={i} className="flex gap-3 rounded-xl border border-amber-500/10 bg-amber-500/5 px-4 py-3">
                <span className="mt-0.5 shrink-0 text-amber-400">★</span>
                <p className="text-sm leading-relaxed text-white/55">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
