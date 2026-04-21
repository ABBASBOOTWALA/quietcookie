'use client';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#08080C]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-400 text-sm shadow-lg shadow-orange-500/20">
            🍪
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            Quiet<span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">Cookie</span>
          </span>
        </div>
        <p className="hidden text-sm text-white/30 md:block">
          Your personal Michelin-star chef
        </p>
      </div>
    </header>
  );
}
