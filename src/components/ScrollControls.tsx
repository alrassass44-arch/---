import { ChevronDown, ChevronUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export const ScrollControls: React.FC = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;

      setShowScrollTop(scrollY > 150);
      setShowScrollBottom(scrollY + clientHeight < scrollHeight - 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    });
  };

  return (
    <div
      className="fixed left-5 bottom-6 z-40 flex flex-col items-center gap-2.5 print:hidden select-none"
      aria-label="أزرار التنقل السريع"
    >
      {/* Scroll to Top - Golden Triangle */}
      <button
        onClick={scrollToTop}
        className={`group relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 cursor-pointer shadow-lg active:scale-95 border ${
          showScrollTop
            ? 'opacity-100 translate-y-0 pointer-events-auto bg-gradient-to-b from-[#FDE68A] via-[#E8B957] to-[#D97706] text-slate-950 border-amber-300 shadow-amber-500/30 hover:shadow-amber-500/50 hover:brightness-105'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        title="التمرير إلى أعلى الصفحة"
        aria-label="أعلى الصفحة"
      >
        <ChevronUp className="w-6 h-6 stroke-[3] transition-transform duration-200 group-hover:-translate-y-0.5" />

        {/* Hover Tooltip */}
        <span className="absolute right-full mr-2.5 px-2.5 py-1 rounded-lg bg-slate-900/90 text-amber-300 text-[11px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
          أعلى الصفحة
        </span>
      </button>

      {/* Scroll to Bottom - Inverted Golden Triangle */}
      <button
        onClick={scrollToBottom}
        className={`group relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 cursor-pointer shadow-lg active:scale-95 border ${
          showScrollBottom
            ? 'opacity-100 translate-y-0 pointer-events-auto bg-gradient-to-b from-[#FDE68A] via-[#E8B957] to-[#D97706] text-slate-950 border-amber-300 shadow-amber-500/30 hover:shadow-amber-500/50 hover:brightness-105'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        title="التمرير إلى أسفل الصفحة"
        aria-label="أسفل الصفحة"
      >
        <ChevronDown className="w-6 h-6 stroke-[3] transition-transform duration-200 group-hover:translate-y-0.5" />

        {/* Hover Tooltip */}
        <span className="absolute right-full mr-2.5 px-2.5 py-1 rounded-lg bg-slate-900/90 text-amber-300 text-[11px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
          أسفل الصفحة
        </span>
      </button>
    </div>
  );
};
