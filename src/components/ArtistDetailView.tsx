import { Calendar, Disc, FileAudio, MapPin, Mic2, Music, Play, Sparkles, Video } from 'lucide-react';
import React, { useState } from 'react';
import { Album, Artist, VideoItem } from '../types';
import { VideoCard } from './VideoCard';

interface ArtistDetailViewProps {
  artist: Artist;
  allVideos: VideoItem[];
  allAlbums: Album[];
  favorites: string[];
  onSelectVideo: (video: VideoItem) => void;
  onConvertMp3: (video: VideoItem) => void;
  onDownloadVideo: (video: VideoItem) => void;
  onToggleFavorite: (videoId: string) => void;
  onBack: () => void;
  onSelectLyric: (video: VideoItem) => void;
}

export const ArtistDetailView: React.FC<ArtistDetailViewProps> = ({
  artist,
  allVideos,
  allAlbums,
  favorites,
  onSelectVideo,
  onConvertMp3,
  onDownloadVideo,
  onToggleFavorite,
  onBack,
  onSelectLyric,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'lyrics' | 'albums'>('all');

  const artistVideos = allVideos.filter(
    v => v.artist === artist.name || v.artistId === artist.id || v.title.includes(artist.name)
  );

  const latestWorks = [...artistVideos].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const artistLyrics = artistVideos.filter(v => !!v.lyrics);
  const albumIds = new Set(artistVideos.map(v => v.albumId).filter(Boolean));
  const artistAlbums = allAlbums.filter(a => albumIds.has(a.id) || a.title.includes(artist.name));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:text-teal-950 transition-colors bg-white px-4 py-2 rounded-xl border border-teal-200 shadow-xs"
      >
        <span>← العودة إلى قائمة الفنانين</span>
      </button>

      {/* Artist Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-amber-100 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-right">
          <img
            src={artist.avatar}
            alt={artist.name}
            className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl object-cover border-4 border-amber-200 shadow-md flex-shrink-0"
          />

          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Cairo']">
                {artist.name}
              </h1>
              <span className="px-3 py-0.5 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200">
                {artist.role}
              </span>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              <span>{artist.origin}</span>
              <span>•</span>
              <span className="text-teal-800 font-bold">{artistVideos.length} تسجيل وجلسة موثقة</span>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed max-w-3xl pt-2">
              {artist.bio}
            </p>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-amber-200/60 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSubTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'all'
              ? 'bg-[#13B8A6] text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:text-teal-700'
          }`}
        >
          كافة الأعمال والفيديوهات ({artistVideos.length})
        </button>

        <button
          onClick={() => setActiveSubTab('lyrics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'lyrics'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:text-purple-700'
          }`}
        >
          كلمات الأغاني المكتوبة ({artistLyrics.length})
        </button>

        <button
          onClick={() => setActiveSubTab('albums')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'albums'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:text-emerald-700'
          }`}
        >
          الجلسات والألبومات المرتبطة ({artistAlbums.length})
        </button>
      </div>

      {/* Content */}
      {activeSubTab === 'all' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestWorks.map(video => (
              <VideoCard
                key={video.id}
                video={video}
                onWatch={onSelectVideo}
                onConvertMp3={onConvertMp3}
                onDownloadVideo={onDownloadVideo}
                isFavorite={favorites.includes(video.id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>

          {latestWorks.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl p-6 text-slate-500 text-sm border border-slate-200">
              لم يتم العثور على تسجيلات للفنان في الأرشيف الحالي.
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'lyrics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artistLyrics.map(video => (
            <div
              key={video.id}
              onClick={() => onSelectLyric(video)}
              className="p-5 rounded-2xl bg-white border border-amber-100 hover:border-purple-300 cursor-pointer transition-all flex flex-col justify-between shadow-sm hover:shadow-md"
            >
              <div>
                <h3 className="text-base font-bold text-slate-900 font-['Cairo'] mb-1">
                  {video.title}
                </h3>
                <span className="text-xs text-teal-800 font-bold block mb-3">{video.artist}</span>
                <p className="text-xs text-slate-700 italic line-clamp-4 leading-relaxed bg-[#FFFDF7] p-3 rounded-xl border border-amber-100 font-['Cairo']">
                  "{video.lyrics}"
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-purple-700 font-bold">
                <span>قراءة النص كاملاً</span>
                <span>←</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSubTab === 'albums' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(artistAlbums.length > 0 ? artistAlbums : allAlbums.slice(0, 2)).map(album => (
            <div
              key={album.id}
              className="bg-white border border-amber-100 rounded-2xl p-4 flex gap-4 items-center shadow-xs"
            >
              <img
                src={album.cover}
                alt={album.title}
                className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
              />
              <div className="overflow-hidden">
                <span className="text-[11px] text-teal-700 font-mono font-bold">{album.year}</span>
                <h4 className="text-sm font-bold text-slate-900 truncate font-['Cairo']">{album.title}</h4>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">{album.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
