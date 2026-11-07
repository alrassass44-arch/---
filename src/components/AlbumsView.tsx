import { Calendar, Disc, Music, Play, Sparkles, UserCheck } from 'lucide-react';
import React from 'react';
import { Album, VideoItem } from '../types';

interface AlbumsViewProps {
  albums: Album[];
  videos: VideoItem[];
  onSelectVideo: (video: VideoItem) => void;
}

export const AlbumsView: React.FC<AlbumsViewProps> = ({ albums, videos, onSelectVideo }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-amber-200/60 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Cairo'] flex items-center gap-3">
          <Disc className="w-7 h-7 text-[#13B8A6]" />
          <span>ألبومات وجلسات ديوان السعادة التوثيقية</span>
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          إصدارات وسلاسل طربية حية ومسجلة في استوديوهات ومقيل ديوان السعادة بصنعاء
        </p>
      </div>

      {/* Albums Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {albums.map(album => {
          const albumVideos = videos.filter(v => v.albumId === album.id || v.album === album.title);

          return (
            <div
              key={album.id}
              className="bg-white border border-amber-100 hover:border-teal-400 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-5"
            >
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                <img
                  src={album.cover}
                  alt={album.title}
                  className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl object-cover border-2 border-amber-200 flex-shrink-0 shadow-xs"
                />

                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 font-bold border border-teal-200">
                      إصدار رسمي
                    </span>
                    <span className="text-xs text-slate-500 font-mono font-bold">{album.year}</span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 font-['Cairo']">{album.title}</h3>

                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                    <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                    <span>المشرف الفني: {album.sessionSupervisor}</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {album.description}
                  </p>
                </div>
              </div>

              {/* Tracks in this album */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
                  <span>المقاطع والجلسات في هذا الألبوم ({albumVideos.length})</span>
                  <span>المدة</span>
                </div>

                {albumVideos.map((track, idx) => (
                  <div
                    key={track.id}
                    onClick={() => onSelectVideo(track)}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#FFFDF7] hover:bg-teal-50 cursor-pointer transition-colors group border border-amber-100/60"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="text-xs text-teal-700 font-mono font-bold w-4">{idx + 1}</span>
                      <Play className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 fill-current flex-shrink-0" />
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-slate-800 group-hover:text-teal-800 truncate">
                          {track.title}
                        </p>
                        <p className="text-[11px] text-teal-700 font-medium truncate">{track.artist}</p>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono font-medium flex-shrink-0">
                      {track.duration}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
