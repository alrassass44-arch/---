import { Disc, Heart, MapPin, Mic2, Music, Search, Video } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Artist, VideoItem } from '../types';

interface ArtistsViewProps {
  artists: Artist[];
  videos: VideoItem[];
  onSelectArtist: (artist: Artist) => void;
}

export const ArtistsView: React.FC<ArtistsViewProps> = ({ artists, videos, onSelectArtist }) => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'alpha' | 'songs'>('alpha');

  const artistsWithCounts = useMemo(() => {
    return artists.map(artist => {
      const count = videos.filter(v => v.artist === artist.name || v.artistId === artist.id).length;
      return { ...artist, songCount: count };
    });
  }, [artists, videos]);

  const filteredArtists = useMemo(() => {
    let result = artistsWithCounts.filter(
      a =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.bio.toLowerCase().includes(search.toLowerCase()) ||
        a.role.toLowerCase().includes(search.toLowerCase())
    );

    if (sortBy === 'alpha') {
      result.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
    } else {
      result.sort((a, b) => (b.songCount || 0) - (a.songCount || 0));
    }

    return result;
  }, [artistsWithCounts, search, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-200/60 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Cairo'] flex items-center gap-3">
            <Mic2 className="w-7 h-7 text-[#13B8A6]" />
            <span>نظام الفنانين ونجوم ديوان السعادة</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            تعرف على رواد ونجوم الجلسات، واستمع إلى أرشيف أعمالهم وأغانيهم الموثقة في الديوان
          </p>
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث باسم الفنان..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          </div>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-500 font-bold"
          >
            <option value="alpha">ترتيب أبجدي (أ - ي)</option>
            <option value="songs">الأكثر أعمالاً وجلسات</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredArtists.map(artist => (
          <div
            key={artist.id}
            onClick={() => onSelectArtist(artist)}
            className="group bg-white border border-amber-100 hover:border-teal-400 rounded-3xl p-5 cursor-pointer transition-all hover:-translate-y-1 shadow-sm hover:shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 bg-slate-100">
                <img
                  src={artist.avatar}
                  alt={artist.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {artist.featured && (
                  <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black shadow-md">
                    نجم مميز
                  </span>
                )}
                <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-xl bg-slate-900/80 backdrop-blur-sm text-xs font-semibold text-white flex items-center gap-1.5 border border-white/10">
                  <Music className="w-3.5 h-3.5 text-[#E8B957]" />
                  <span>{artist.songCount} جلسات</span>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors font-['Cairo']">
                {artist.name}
              </h3>
              <p className="text-xs text-teal-800 mt-0.5 font-bold">{artist.role}</p>

              <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-2">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{artist.origin}</span>
              </div>

              <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                {artist.bio}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-teal-700 font-bold">
              <span>تصفح كافة أعمال الفنان</span>
              <span>←</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
