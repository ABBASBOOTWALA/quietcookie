'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

const LOADING_PHRASES = [
  'Consulting the recipe archives…',
  'Selecting the finest ingredients…',
  'Balancing flavors and textures…',
  'Writing step-by-step instructions…',
  'Estimating grocery costs…',
  "Adding chef's pro tips…",
  'Almost ready to plate…',
];

interface Props {
  streamText: string;
}

export default function LoadingState({ streamText }: Props) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex(i => (i + 1) % LOADING_PHRASES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (preRef.current) {
      preRef.current.scrollTop = preRef.current.scrollHeight;
    }
  }, [streamText]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="mx-auto w-full max-w-2xl"
    >
      {/* Status card */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6">
        {/* Animated rings */}
        <div className="mb-6 flex justify-center">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 animate-ping rounded-full bg-orange-500/15" />
            <div className="absolute inset-1 animate-spin rounded-full border-2 border-transparent border-t-orange-500/60" style={{ animationDuration: '1.4s' }} />
            <div className="absolute inset-3 animate-spin rounded-full border-2 border-transparent border-t-amber-400/80" style={{ animationDuration: '0.9s', animationDirection: 'reverse' }} />
            <div className="absolute inset-[22px] rounded-full bg-orange-500" />
          </div>
        </div>

        {/* Cycling phrase */}
        <div className="mb-6 h-6 overflow-hidden text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={phraseIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-sm font-medium text-white/60"
            >
              {LOADING_PHRASES[phraseIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Streaming JSON terminal */}
        {streamText && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-2 rounded-t-lg border border-b-0 border-white/[0.06] bg-white/[0.04] px-3 py-2">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
              </div>
              <span className="text-xs text-white/25">claude-sonnet-4-6 → streaming response</span>
            </div>
            <pre
              ref={preRef}
              className="max-h-48 overflow-y-auto rounded-b-lg border border-white/[0.06] bg-black/40 p-4 font-mono text-[11px] leading-relaxed text-green-400/70"
            >
              {streamText}
              <span className="animate-pulse text-green-400">▋</span>
            </pre>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
