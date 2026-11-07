import { ArrowUpDown, CheckCircle2, Clock, Filter, Grid, RefreshCw, Search, SlidersHorizontal, Tag, Video, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { DataService } from '../services/dataService';
import { Category, VideoItem } from '../types';
import { VideoCard } from './VideoCard';

interface VideosViewProps {
  videos: VideoItem[];
  categories: Category[];
  favorites: string[];
  onSelectVideo: (video: VideoItem) => void;
  onConvertMp3: (video: VideoItem) => void;
  onDownloadVideo: (video: VideoItem) => void;
  onToggleFavorite: (videoId: string) => void;
  initialCategory?: string;
  initialArtist?: string;
  onCategoryClick?: (categoryName: string) => void;
  onArtistClick?: (artistName: string) => void;
  onShare?: (video: VideoItem) => void;
  onSyncComplete?: (newVideos: VideoItem[]) => void;
}

export const VideosView: React.FC<VideosViewProps> = ({
  videos,
  categories,
  favorites,
  onSelectVideo,
  onConvertMp3,
  onDownloadVideo,
  onToggleFavorite,
  initialCategory,
  initialArtist,
  onCategoryClick,
  onArtistClick,
  onShare,
  onSyncComplete,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedArtist, setSelectedArtist] = useState<string>(initialArtist || 'all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alpha' | 'views' | 'downloads'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => DataService.getSettings().lastSyncTime || 'الآن');

  const handleSyncVideos = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const result = await DataService.syncWithYouTube();
      setSyncMessage(result.message);
      setLastSyncTime(result.lastSyncTime);
      if (result.added && result.added.length > 0 && onSyncComplete) {
        onSyncComplete(result.added);
      }
    } catch (err: any) {
      setSyncMessage('تعذر إكمال التحديث الفوري، يرجى المحاولة لاحقاً.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(null), 6000);
    }
  };

  const artistsList = useMemo(() => {
    const set = new Set<string>();
    videos.forEach(v => {
      if (v.artist) set.add(v.artist);
    });
    return Array.from(set).sort();
  }, [videos]);

  const filteredVideos = useMemo(() => {
    let result = [...videos];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        v =>
          v.title.toLowerCase().includes(q) ||
          v.artist.toLowerCase().includes(q) ||
          v.album.toLowerCase().includes(q) ||
          v.categories.some(c => c.toLowerCase().includes(q)) ||
          (v.lyrics && v.lyrics.toLowerCase().includes(q))
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter(v => v.categories.includes(selectedCategory));
    }

    if (selectedArtist !== 'all') {
      result = result.filter(v => v.artist === selectedArtist);
    }

    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
        break;
      case 'oldest':
        result.sort((a, b) => a.publishedAt.localeCompare(b.publishedAt));
        break;
      case 'alpha':
        result.sort((a, b) => a.title.localeCompare(b.title, 'ar'));
        break;
      case 'views':
        result.sort((a, b) => b.views - a.views);
        break;
      case 'downloads':
        result.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
        break;
    }

    return result;
  }, [videos, search, selectedCategory, selectedArtist, sortBy]);

  const totalPages = Math.ceil(filteredVideos.length / itemsPerPage) || 1;
  const paginatedVideos = filteredVideos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedArtist('all');
    setSortBy('newest');
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header with Explicit Refresh Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-200/60 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Cairo'] flex items-center gap-3">
            <Video className="w-7 h-7 text-[#13B8A6]" />
            <span>مكتبة فيديوهات ديوان السعادة</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            استعرض جميع جلسات الطرب والتسجيلات التراثية الموثقة بجودة صوت وصورة استثنائية ({filteredVideos.length} جلسة)
          </p>
        </div>

        {/* Live Refresh Button & Last Sync Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-1 font-mono">
            <Clock className="w-3.5 h-3.5 text-teal-600" />
            <span>آخر تحديث: {lastSyncTime}</span>
          </div>

          <button
            onClick={handleSyncVideos}
            disabled={isSyncing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#13B8A6] hover:bg-[#0F766E] text-white text-xs font-bold shadow-md shadow-teal-500/20 transition-all disabled:opacity-50 transform hover:-translate-y-0.5"
            title="جلب أحدث فيديوهات القناة تلقائياً وتحديث الموقع والتطبيق فوراً"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'جاري الفحص والتحديث...' : 'تحديث آلي من قناة اليوتيوب'}</span>
          </button>
        </div>
      </div>

      {/* Sync Message Alert Banner */}
      {syncMessage && (
        <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0" />
            <span>{syncMessage}</span>
          </div>
          <button onClick={() => setSyncMessage(null)} className="text-teal-700 hover:text-teal-950 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white border border-amber-100 p-4 rounded-2xl shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث بالعنوان أو الكلمات أو الفنان..."
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#FFFDF7] border border-slate-200 rounded-xl pr-9 pl-3 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          </div>

          {/* Category Dropdown (19 categories) */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={e => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#FFFDF7] border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-teal-500 appearance-none font-medium"
            >
              <option value="all">جميع التصنيفات (19 تصنيف)</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
          </div>

          {/* Artist Filter Dropdown */}
          <div className="relative">
            <select
              value={selectedArtist}
              onChange={e => {
                setSelectedArtist(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#FFFDF7] border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-teal-500 appearance-none font-medium"
            >
              <option value="all">جميع الفنانين</option>
              {artistsList.map(art => (
                <option key={art} value={art}>
                  {art}
                </option>
              ))}
            </select>
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
          </div>

          {/* Sort By Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full bg-[#FFFDF7] border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-teal-500 appearance-none font-medium"
            >
              <option value="newest">الترتيب: الأحدث تاريخاً</option>
              <option value="oldest">الترتيب: الأقدم</option>
              <option value="views">الترتيب: الأكثر مشاهدة</option>
              <option value="downloads">الترتيب: الأكثر تحميلاً</option>
              <option value="alpha">الترتيب: أبجدياً</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      {paginatedVideos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedVideos.map(video => (
            <VideoCard
              key={video.id}
              video={video}
              onWatch={onSelectVideo}
              onConvertMp3={onConvertMp3}
              onDownloadVideo={onDownloadVideo}
              isFavorite={favorites.includes(video.id)}
              onToggleFavorite={onToggleFavorite}
              onCategoryClick={onCategoryClick}
              onArtistClick={onArtistClick}
              onShare={onShare}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-amber-100 rounded-3xl p-8 shadow-sm">
          <Video className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 font-['Cairo']">لا توجد نتائج مطابقة لبحثك</h3>
          <p className="text-xs text-slate-500 mt-1">جرّب تغيير كلمات البحث أو إعادة ضبط خيارات الفرز والتصنيف.</p>
          <button
            onClick={resetFilters}
            className="mt-4 px-4 py-2 bg-[#13B8A6] text-white text-xs font-bold rounded-xl hover:bg-[#0F766E]"
          >
            عرض كافة الفيديوهات
          </button>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-50"
          >
            السابق
          </button>
          <span className="text-xs text-slate-600 font-mono px-3">
            صفحة {currentPage} من {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-50"
          >
            التالي
          </button>
        </div>
      )}
    </div>
  );
};
