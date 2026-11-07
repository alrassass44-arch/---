import { CheckCircle2, Copy, FileText, Heart, Music, Play, Share2 } from 'lucide-react';
import React, { useState } from 'react';
import { VideoItem } from '../types';

interface LyricDetailViewProps {
  video: VideoItem;
  allVideos: VideoItem[];
  onWatch: (video: VideoItem) => void;
  onBack: () => void;
  onSelectLyric: (video: VideoItem) => void;
}

export const LyricDetailView: React.FC<LyricDetailViewProps> = ({
  video,
  allVideos,
  onWatch,
  onBack,
  onSelectLyric,
}) => {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const handleCopy = () => {
    if (video.lyrics && navigator.clipboard) {
      navigator.clipboard.writeText(video.lyrics);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const similarSongs = allVideos
    .filter(v => v.id !== video.id && !!v.lyrics && (v.artist === video.artist || v.categories.some(c => video.categories.includes(c))))
    .slice(0, 4);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:text-teal-950 transition-colors bg-white px-4 py-2 rounded-xl border border-teal-200 shadow-xs"
      >
        <span>← العودة إلى مكتبة الكلمات</span>
      </button>

      {/* Hero Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-amber-100 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-right">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-32 h-32 sm:w-44 sm:h-44 rounded-2xl object-cover border-4 border-amber-200 shadow-md flex-shrink-0"
          onError={e => {
            (e.target as HTMLImageElement).src = `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`;
          }}
        />

        <div className="space-y-3 flex-1">
          <div className="space-y-1">
            <span className="text-xs px-3 py-0.5 rounded-full bg-teal-50 text-teal-800 font-bold border border-teal-200">
              قصيدة وجلسة غنائية
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Cairo']">
              {video.title.split('-')[1]?.trim() || video.title}
            </h1>
            <p className="text-base text-teal-800 font-bold">{video.artist}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 font-medium">
            <span>الشاعر: {video.lyricist || 'روائع التراث اليمني'}</span>
            <span>•</span>
            <span>الملحن: {video.composer || 'تراث يمني أصيل'}</span>
            <span>•</span>
            <span>الألبوم: {video.album}</span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-center sm:justify-start gap-3 pt-2">
            <button
              onClick={() => onWatch(video)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#13B8A6] hover:bg-[#0F766E] text-white text-xs font-bold transition-all shadow-md shadow-teal-500/20"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>مشاهدة واستماع للجلسة</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-teal-600" />}
              <span>{copied ? 'تم نسخ النص' : 'نسخ الكلمات'}</span>
            </button>

            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="مشاركة رابط القصيدة"
            >
              {shared ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Beautiful Poetic Arabic Lyrics Typography */}
      <div className="p-8 sm:p-12 rounded-3xl bg-white border border-amber-100 text-center relative overflow-hidden shadow-sm">
        <div className="absolute top-4 left-6 text-6xl text-amber-200/50 font-serif pointer-events-none">❝</div>
        <div className="absolute bottom-4 right-6 text-6xl text-amber-200/50 font-serif pointer-events-none">❞</div>

        <div className="max-w-2xl mx-auto space-y-6 font-['Cairo'] text-lg sm:text-xl text-slate-800 leading-loose whitespace-pre-line tracking-wide selection:bg-teal-100">
          {video.lyrics}
        </div>
      </div>

      {/* Similar Songs */}
      {similarSongs.length > 0 && (
        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-bold text-slate-900 font-['Cairo'] flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#13B8A6]" />
            <span>قصائد وأغاني مشابهة في ديوان السعادة</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {similarSongs.map(sim => (
              <div
                key={sim.id}
                onClick={() => onSelectLyric(sim)}
                className="p-4 rounded-2xl bg-white border border-amber-100 hover:border-teal-400 cursor-pointer transition-all shadow-xs"
              >
                <img
                  src={sim.thumbnail}
                  alt={sim.title}
                  className="w-full h-28 rounded-xl object-cover mb-2"
                  onError={e => {
                    (e.target as HTMLImageElement).src = `https://i.ytimg.com/vi/${sim.youtubeId}/hqdefault.jpg`;
                  }}
                />
                <h4 className="text-xs font-bold text-slate-800 truncate font-['Cairo']">{sim.title}</h4>
                <p className="text-[11px] text-teal-800 mt-0.5 truncate font-bold">{sim.artist}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
