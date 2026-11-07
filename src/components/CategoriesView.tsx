import { ChevronLeft, Filter, Layers, Music, Search, Tag } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Category, VideoItem } from '../types';

interface CategoriesViewProps {
  categories: Category[];
  videos: VideoItem[];
  onSelectCategory: (categoryName: string) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({ categories, videos, onSelectCategory }) => {
  const [search, setSearch] = useState('');

  const categoriesWithCounts = useMemo(() => {
    return categories.map(cat => {
      const count = videos.filter(v => v.categories.includes(cat.name)).length;
      return { ...cat, count };
    });
  }, [categories, videos]);

  const filtered = categoriesWithCounts.filter(
    c => c.name.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-200/60 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Cairo'] flex items-center gap-3">
            <Layers className="w-7 h-7 text-[#13B8A6]" />
            <span>تصنيفات ومقامات ديوان السعادة (19 تصنيفاً)</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            تصنيفات خاصة مبنية بدقة على هوية القناة والتراث اليمني والخليجي وجلسات العود والشرح اللحجي
          </p>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="ابحث في التصنيفات..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((cat, index) => (
          <div
            key={cat.id}
            onClick={() => onSelectCategory(cat.name)}
            className="group p-5 rounded-3xl bg-white border border-amber-100 hover:border-teal-400 cursor-pointer transition-all hover:-translate-y-1 shadow-sm hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs px-2.5 py-1 rounded-xl bg-teal-50 text-teal-800 font-mono font-bold border border-teal-200">
                  #{index + 1}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-xl bg-amber-50 text-amber-900 font-bold border border-amber-200">
                  {cat.count} تسجيلات موثقة
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors font-['Cairo']">
                {cat.name}
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed line-clamp-2">
                {cat.description}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-teal-700 font-bold group-hover:text-teal-900 transition-colors">
              <span>تصفح الجلسات والأغاني</span>
              <ChevronLeft className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
