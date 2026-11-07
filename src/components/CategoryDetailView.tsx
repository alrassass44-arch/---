import { ChevronRight, Layers, Music, Play, Tag, Video } from 'lucide-react';
import React from 'react';
import { Category, VideoItem } from '../types';
import { VideoCard } from './VideoCard';

interface CategoryDetailViewProps {
  categoryName: string;
  categories: Category[];
  videos: VideoItem[];
  favorites: string[];
  onSelectVideo: (video: VideoItem) => void;
  onConvertMp3: (video: VideoItem) => void;
  onDownloadVideo: (video: VideoItem) => void;
  onToggleFavorite: (videoId: string) => void;
  onBack: () => void;
  onArtistClick?: (artistName: string) => void;
}

export const CategoryDetailView: React.FC<CategoryDetailViewProps> = ({
  categoryName,
  categories,
  videos,
  favorites,
  onSelectVideo,
  onConvertMp3,
  onDownloadVideo,
  onToggleFavorite,
  onBack,
  onArtistClick,
}) => {
  const currentCategory = categories.find(c => c.name === categoryName);
  const categoryVideos = videos.filter(v => v.categories.includes(categoryName));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:text-teal-950 transition-colors bg-white px-4 py-2 rounded-xl border border-teal-200 shadow-xs"
      >
        <span>← العودة إلى قائمة التصنيفات</span>
      </button>

      {/* Category Header */}
      <div className="bg-white border border-amber-100 p-6 sm:p-8 rounded-3xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs px-3 py-1 rounded-full bg-teal-50 text-teal-800 font-bold border border-teal-200">
              تصنيف ديوان السعادة المعتمد
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Cairo']">
              {categoryName}
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              {currentCategory?.description || 'مجموعة مختارة وموثقة من جلسات ديوان السعادة بصنعاء.'}
            </p>
          </div>

          <div className="bg-[#FFFDF7] px-6 py-4 rounded-2xl border border-amber-200 text-center sm:text-left self-start sm:self-auto shadow-xs">
            <span className="text-2xl font-black text-teal-800 block font-mono">{categoryVideos.length}</span>
            <span className="text-xs text-slate-500 font-bold">جلسات مسجلة</span>
          </div>
        </div>
      </div>

      {/* Videos in this category */}
      {categoryVideos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categoryVideos.map(video => (
            <VideoCard
              key={video.id}
              video={video}
              onWatch={onSelectVideo}
              onConvertMp3={onConvertMp3}
              onDownloadVideo={onDownloadVideo}
              isFavorite={favorites.includes(video.id)}
              onToggleFavorite={onToggleFavorite}
              onArtistClick={onArtistClick}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
          <Layers className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 font-['Cairo']">لا توجد تسجيلات مسندة لهذا التصنيف بعد</h3>
          <p className="text-xs text-slate-500 mt-1">
            سيتم إضافة تسجيلات جديدة فور مزامنتها مع القناة أو إضافتها من لوحة التحكم.
          </p>
        </div>
      )}
    </div>
  );
};
