import { CheckCircle2, Copy, FileText, Music, Play, Search, Share2 } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { VideoItem } from '../types';

interface LyricsViewProps {
  videos: VideoItem[];
  onSelectLyric: (video: VideoItem) => void;
  onWatch: (video: VideoItem) => void;
}

export const LyricsView: React.FC<LyricsViewProps> = ({ videos, onSelectLyric, onWatch }) => {
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const lyricSongs = useMemo(() => {
    return videos.filter(v => !!v.lyrics && v.lyrics.trim().length > 0);
  }, [videos]);

  const filteredLyrics = useMemo(() => {
    if (!search.trim()) return lyricSongs;
    const q = search.trim().toLowerCase();
    return lyricSongs.filter(
      v =>
        v.title.toLowerCase().includes(q) ||
        v.artist.toLowerCase().includes(q) ||
        (v.lyrics && v.lyrics.toLowerCase().includes(q))
    );
  }, [lyricSongs, search]);

  const handleCopy = (e: React.MouseEvent, video: VideoItem) => {
    e.stopPropagation();
    if (video.lyrics && navigator.clipboard) {
      navigator.clipboard.writeText(video.lyrics);
      setCopiedId(video.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-200/60 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Cairo'] flex items-center gap-3">
            <FileText className="w-7 h-7 text-[#13B8A6]" />
            <span>مكتبة كلمات وقصائد ديوان السعادة</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            البحث في نصوص الأغاني والقصائد التراثية الموثقة والمرخصة ({lyricSongs.length} نص غنائي)
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="ابحث داخل نص الكلمات والقصائد..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLyrics.map(video => (
          <div
            key={video.id}
            onClick={() => onSelectLyric(video)}
            className="group p-6 rounded-3xl bg-white border border-amber-100 hover:border-teal-400 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-14 h-14 rounded-2xl object-cover flex-shrink-0 border border-slate-200"
                  onError={e => {
                    (e.target as HTMLImageElement).src = `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`;
                  }}
                />
                <div className="overflow-hidden">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors truncate font-['Cairo']">
                    {video.title.split('-')[1]?.trim() || video.title}
                  </h3>
                  <p className="text-xs text-teal-800 font-bold mt-0.5 truncate">{video.artist}</p>
                  <span className="text-[10px] text-slate-400">{video.album}</span>
                </div>
              </div>

              <div className="bg-[#FFFDF7] p-4 rounded-2xl border border-amber-100 text-xs text-slate-700 font-['Cairo'] line-clamp-4 leading-relaxed italic whitespace-pre-line">
                "{video.lyrics}"
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                onClick={e => handleCopy(e, video)}
                className="flex items-center gap-1.5 text-slate-600 hover:text-teal-700 font-bold transition-colors"
              >
                {copiedId === video.id ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">تم النسخ</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-teal-600" />
                    <span>نسخ النص</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onWatch(video);
                  }}
                  className="flex items-center gap-1 text-teal-700 hover:underline font-bold"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>مشاهدة</span>
                </button>
                <span className="text-teal-800 font-bold">عرض القصيدة ←</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredLyrics.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 font-['Cairo']">لم يتم العثور على كلمات مطابقة للبحث</h3>
          <p className="text-xs text-slate-500 mt-1">جرّب البحث باسم القصيدة أو بيت شعري آخر.</p>
        </div>
      )}
    </div>
  );
};
