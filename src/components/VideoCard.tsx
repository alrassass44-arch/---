import { Calendar, CheckCircle2, Clock, Download, Eye, FileAudio, Heart, Music, Play, Share2 } from 'lucide-react';
import React, { useState } from 'react';
import { DataService } from '../services/dataService';
import { VideoItem } from '../types';

interface VideoCardProps {
  video: VideoItem;
  onWatch: (video: VideoItem) => void;
  onConvertMp3: (video: VideoItem) => void;
  onDownloadVideo: (video: VideoItem) => void;
  isFavorite: boolean;
  onToggleFavorite: (videoId: string) => void;
  onCategoryClick?: (category: string) => void;
  onArtistClick?: (artistName: string) => void;
  onShare?: (video: VideoItem) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onWatch,
  onConvertMp3,
  onDownloadVideo,
  isFavorite,
  onToggleFavorite,
  onCategoryClick,
  onArtistClick,
  onShare,
}) => {
  const [copied, setCopied] = useState(false);
  const [imgFallbackIndex, setImgFallbackIndex] = useState(0);

  // Get true YouTube thumbnail hierarchy
  const thumbnailCandidates = DataService.getThumbnailHierarchy(video.youtubeId);
  const currentThumbnail = thumbnailCandidates[imgFallbackIndex] || video.thumbnail;

  const handleImgError = () => {
    if (imgFallbackIndex < thumbnailCandidates.length - 1) {
      setImgFallbackIndex(prev => prev + 1);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) {
      onShare(video);
      return;
    }
    const shareUrl = `${window.location.origin}/#watch-${video.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const primaryCategory = video.categories && video.categories.length > 0 ? video.categories[0] : 'جلسات ديوان السعادة';

  return (
    <div className="group bg-white rounded-2xl border border-amber-100 hover:border-teal-400 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between transform hover:-translate-y-1">
      {/* Thumbnail Container */}
      <div
        className="relative aspect-video w-full overflow-hidden bg-slate-100 cursor-pointer"
        onClick={() => onWatch(video)}
      >
        <img
          src={currentThumbnail}
          alt={video.title}
          onError={handleImgError}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Play Icon Overlay */}
        <div className="absolute inset-0 bg-teal-900/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[1px]">
          <div className="w-13 h-13 rounded-full bg-[#E8B957] text-slate-900 flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform duration-300 shadow-xl shadow-amber-500/30">
            <Play className="w-6 h-6 fill-current translate-x-0.5" />
          </div>
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-slate-900/85 backdrop-blur-sm text-[11px] font-mono text-white flex items-center gap-1 border border-white/10">
          <Clock className="w-3 h-3 text-[#E8B957]" />
          <span>{video.duration}</span>
        </div>

        {/* Category Pill */}
        <div className="absolute top-2.5 right-2.5">
          <button
            onClick={e => {
              e.stopPropagation();
              onCategoryClick?.(primaryCategory);
            }}
            className="px-2.5 py-0.5 rounded-full bg-white/95 hover:bg-[#13B8A6] hover:text-white text-teal-800 text-[11px] font-bold border border-teal-200/80 transition-colors shadow-sm backdrop-blur-sm"
          >
            {primaryCategory}
          </button>
        </div>

        {/* Favorite & Share buttons */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <button
            onClick={e => {
              e.stopPropagation();
              onToggleFavorite(video.id);
            }}
            className={`p-1.5 rounded-full backdrop-blur-md transition-all ${
              isFavorite
                ? 'bg-rose-500 text-white shadow-md'
                : 'bg-white/90 text-slate-700 hover:text-rose-500 shadow-sm'
            }`}
            title={isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={handleShare}
            className="p-1.5 rounded-full bg-white/90 text-slate-700 hover:text-teal-600 shadow-sm backdrop-blur-md transition-all"
            title="مشاركة الرابط"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Details Body */}
      <div className="p-4 flex-1 flex flex-col justify-between bg-white">
        <div>
          {/* Title */}
          <h3
            onClick={() => onWatch(video)}
            className="text-sm font-bold text-slate-900 hover:text-teal-700 cursor-pointer line-clamp-2 transition-colors mb-2 font-['Cairo'] leading-snug"
            title={video.title}
          >
            {video.title}
          </h3>

          {/* Artist & Album */}
          <div className="flex items-center justify-between text-xs text-slate-600 mb-3">
            <button
              onClick={() => onArtistClick?.(video.artist)}
              className="flex items-center gap-1.5 hover:text-teal-700 transition-colors font-bold text-slate-800 truncate max-w-[65%]"
            >
              <Music className="w-3.5 h-3.5 text-[#E8B957] flex-shrink-0" />
              <span className="truncate">{video.artist}</span>
            </button>
            <span className="text-[11px] text-teal-800 truncate max-w-[35%] bg-teal-50 px-2 py-0.5 rounded-md font-medium border border-teal-100">
              {video.album.replace('جلسات ديوان السعادة – ', '')}
            </span>
          </div>

          {/* Metadata: Date & Views */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2.5 mb-3 font-medium">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{video.publishedAt}</span>
            </div>
            <div className="flex items-center gap-1 font-mono text-teal-800">
              <Eye className="w-3 h-3 text-teal-600" />
              <span>{video.views.toLocaleString('ar-YE')} مشاهدة</span>
            </div>
          </div>
        </div>

        {/* 3 Explicit Action Buttons */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          {/* 1. Download Video */}
          <button
            onClick={() => onDownloadVideo(video)}
            className="flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-1 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-bold border border-teal-200 transition-all"
            title="تحميل الفيديو المصرح به"
          >
            <Download className="w-3.5 h-3.5 text-teal-600" />
            <span className="truncate">تحميل فيديو</span>
          </button>

          {/* 2. Watch Video */}
          <button
            onClick={() => onWatch(video)}
            className="flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-1 rounded-xl bg-[#13B8A6] hover:bg-[#0F766E] text-white text-[11px] font-bold shadow-sm shadow-teal-500/20 transition-all"
            title="مشاهدة الجلسة كاملة"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="truncate">مشاهدة</span>
          </button>

          {/* 3. Convert & Download MP3 */}
          <button
            onClick={() => onConvertMp3(video)}
            className="flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-bold border border-amber-200 transition-all"
            title="تحويل وتنزيل بصيغة MP3 عالية النقاء 320kbps"
          >
            <FileAudio className="w-3.5 h-3.5 text-amber-600" />
            <span className="truncate">تحويل MP3</span>
          </button>
        </div>
      </div>
    </div>
  );
};
