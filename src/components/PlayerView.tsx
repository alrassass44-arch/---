import { Calendar, CheckCircle2, Copy, Download, ExternalLink, FileAudio, Heart, Maximize2, Minimize2, Music, Share2, Tag, Volume2, Youtube } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { DataService } from '../services/dataService';
import { VideoItem } from '../types';
import { YouTubePlayer } from './YouTubePlayer';

interface PlayerViewProps {
  video: VideoItem;
  allVideos: VideoItem[];
  onSelectVideo: (video: VideoItem) => void;
  onConvertMp3: (video: VideoItem) => void;
  onDownloadVideo: (video: VideoItem) => void;
  isFavorite: boolean;
  onToggleFavorite: (videoId: string) => void;
  onBack: () => void;
  onCategoryClick?: (cat: string) => void;
  onArtistClick?: (artist: string) => void;
  onShare?: (video: VideoItem) => void;
}

export const PlayerView: React.FC<PlayerViewProps> = ({
  video,
  allVideos,
  onSelectVideo,
  onConvertMp3,
  onDownloadVideo,
  isFavorite,
  onToggleFavorite,
  onBack,
  onCategoryClick,
  onArtistClick,
  onShare,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedLyrics, setCopiedLyrics] = useState(false);

  useEffect(() => {
    DataService.incrementViews(video.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [video.id]);

  const handleCopyLink = () => {
    if (onShare) {
      onShare(video);
      return;
    }
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyLyrics = () => {
    if (video.lyrics && navigator.clipboard) {
      navigator.clipboard.writeText(video.lyrics);
      setCopiedLyrics(true);
      setTimeout(() => setCopiedLyrics(false), 2500);
    }
  };

  const relatedVideos = allVideos
    .filter(
      v =>
        v.id !== video.id &&
        (v.artist === video.artist || v.categories.some(c => video.categories.includes(c)))
    )
    .slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-teal-800 hover:text-teal-950 bg-white px-4 py-2 rounded-xl border border-teal-200 shadow-sm transition-all"
        >
          <span>← العودة إلى تصفح المكتبة</span>
        </button>

        <a
          href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-xl border border-red-200 font-bold transition-colors"
        >
          <Youtube className="w-4 h-4 text-red-600" />
          <span>فتح المقطع في YouTube</span>
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Player Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Production-grade YouTube Player with Error Handler */}
          <YouTubePlayer
            videoId={video.youtubeId}
            title={video.title}
            artist={video.artist}
          />

          {/* Details Card */}
          <div className="bg-white rounded-3xl p-6 border border-amber-100 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1.5">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-['Cairo'] leading-snug">
                  {video.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                  <button
                    onClick={() => onArtistClick?.(video.artist)}
                    className="flex items-center gap-1.5 text-teal-700 font-bold hover:underline"
                  >
                    <Music className="w-4 h-4 text-[#E8B957]" />
                    <span>{video.artist}</span>
                  </button>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {video.publishedAt}
                  </span>
                  <span>•</span>
                  <span className="font-mono text-teal-800">{video.views.toLocaleString('ar-YE')} مشاهدة</span>
                  <span>•</span>
                  <span className="text-[#2867A5] font-semibold">{video.album}</span>
                </div>
              </div>

              {/* Action Buttons: Favorite, Share, MP3, Download */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <button
                  onClick={() => onToggleFavorite(video.id)}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isFavorite
                      ? 'bg-rose-50 text-rose-600 border-rose-300'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:text-slate-900'
                  }`}
                  title={isFavorite ? 'في المفضلة' : 'أضف للمفضلة'}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                </button>

                <button
                  onClick={handleCopyLink}
                  className="p-2.5 rounded-xl bg-slate-50 text-slate-700 border border-slate-200 hover:text-teal-700 transition-colors"
                  title="مشاركة الرابط"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => onConvertMp3(video)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all shadow-sm"
                >
                  <FileAudio className="w-4 h-4 text-amber-600" />
                  <span>تحويل MP3 (320kbps)</span>
                </button>

                <button
                  onClick={() => onDownloadVideo(video)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-300 text-xs font-bold transition-all shadow-sm"
                >
                  <Download className="w-4 h-4 text-teal-600" />
                  <span>تحميل الفيديو</span>
                </button>
              </div>
            </div>

            {/* Categories */}
            <div className="pt-4 border-t border-slate-100 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-teal-600" />
                التصنيفات:
              </span>
              {video.categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => onCategoryClick?.(cat)}
                  className="text-xs px-3 py-1 rounded-full bg-teal-50 hover:bg-teal-600 hover:text-white text-teal-800 border border-teal-200/80 transition-colors font-medium"
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Technical Music Metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FFFDF7] p-4 rounded-2xl border border-amber-100 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">المقام الموسيقي</span>
                <span className="font-bold text-slate-800 mt-0.5 block">{video.maqam || 'بيات / راست يماني'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">الإيقاع</span>
                <span className="font-bold text-slate-800 mt-0.5 block">{video.rhythm || 'جلسة عود ومرواس'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">الملحن</span>
                <span className="font-bold text-slate-800 mt-0.5 block">{video.composer || 'تراث يمني أصيل'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">الشاعر</span>
                <span className="font-bold text-slate-800 mt-0.5 block">{video.lyricist || 'روائع الكلمة اليمنية'}</span>
              </div>
            </div>
          </div>

          {/* Synchronized Lyrics */}
          {video.lyrics && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-100 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
                    <Music className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 font-['Cairo']">كلمات وقصيدة الجلسة</h2>
                    <span className="text-xs text-slate-500">نص القصيدة الرسمي الموثق في ديوان السعادة</span>
                  </div>
                </div>

                <button
                  onClick={handleCopyLyrics}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-xs font-bold text-teal-800 transition-colors border border-teal-200"
                >
                  {copiedLyrics ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">تم النسخ!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-[#E8B957]" />
                      <span>نسخ الكلمات</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-center font-['Cairo'] leading-loose text-base sm:text-lg text-slate-800 bg-[#FFFDF7] p-6 sm:p-8 rounded-2xl border border-amber-100 whitespace-pre-line selection:bg-teal-100">
                {video.lyrics}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Up Next & Suggestions */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-amber-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 font-['Cairo']">
              <span className="w-2.5 h-2.5 rounded-full bg-[#13B8A6]" />
              <span>جلسات مقترحة ومشابهة</span>
            </h3>

            <div className="space-y-3">
              {relatedVideos.map(rel => (
                <div
                  key={rel.id}
                  onClick={() => onSelectVideo(rel)}
                  className="group flex items-center gap-3 p-2.5 rounded-2xl hover:bg-teal-50/70 border border-slate-100 hover:border-teal-200 cursor-pointer transition-all"
                >
                  <div className="relative w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-200">
                    <img
                      src={rel.thumbnail}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute bottom-1 left-1 text-[10px] bg-slate-900/80 px-1.5 py-0.5 rounded text-white font-mono">
                      {rel.duration}
                    </span>
                  </div>
                  <div className="overflow-hidden flex-1">
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-teal-700 truncate transition-colors font-['Cairo']">
                      {rel.title}
                    </h4>
                    <p className="text-[11px] text-teal-800 mt-1 truncate font-medium">{rel.artist}</p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {rel.views.toLocaleString('ar-YE')} مشاهدة
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 text-center">
              <a
                href="https://www.youtube.com/@dewanalsaada"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:underline font-bold"
              >
                <Youtube className="w-4 h-4" />
                <span>اشترك في قناة ديوان السعادة على يوتيوب</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
