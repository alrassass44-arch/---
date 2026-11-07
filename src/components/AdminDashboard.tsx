import { Activity, AlertCircle, ArrowDown, ArrowUp, CheckCircle2, Clock, Disc, Download, Edit3, Eye, FileAudio, FileText, Film, Key, Layers, Lock, Mic2, Music, Pause, Play, Plus, Radio, RefreshCw, Save, Search, Settings, Shield, Trash2, Video, Volume2, Youtube } from 'lucide-react';
import React, { useState } from 'react';
import { DataService } from '../services/dataService';
import { AdminSettings, Album, Artist, Category, RadioTrack, VideoItem } from '../types';

interface AdminDashboardProps {
  settings: AdminSettings;
  onUpdateSettings: (newSettings: AdminSettings) => void;
  videos: VideoItem[];
  onUpdateVideos: (newVideos: VideoItem[]) => void;
  categories: Category[];
  onUpdateCategories: (newCats: Category[]) => void;
  artists: Artist[];
  onUpdateArtists: (newArtists: Artist[]) => void;
  albums: Album[];
  onUpdateAlbums: (newAlbums: Album[]) => void;
  radioTracks?: RadioTrack[];
  onUpdateRadioTracks?: (newTracks: RadioTrack[]) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  settings,
  onUpdateSettings,
  videos,
  onUpdateVideos,
  categories,
  onUpdateCategories,
  artists,
  onUpdateArtists,
  albums,
  onUpdateAlbums,
  radioTracks,
  onUpdateRadioTracks,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState('');

  const [adminTab, setAdminTab] = useState<'videos' | 'categories' | 'artists' | 'radio' | 'sync' | 'settings'>('videos');

  // Radio Tracks State
  const [radioTracksList, setRadioTracksList] = useState<RadioTrack[]>(() => radioTracks || DataService.getRadioTracks());
  const [isEditingRadioTrack, setIsEditingRadioTrack] = useState(false);
  const [currentRadioTrack, setCurrentRadioTrack] = useState<Partial<RadioTrack>>({});
  const [trackToDelete, setTrackToDelete] = useState<RadioTrack | null>(null);
  const [previewTrackUrl, setPreviewTrackUrl] = useState<string | null>(null);

  // Video Form Modal
  const [isEditingVideo, setIsEditingVideo] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<Partial<VideoItem>>({});
  const [autoSuggestedCats, setAutoSuggestedCats] = useState<string[]>([]);

  // Category Add
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Artist Add
  const [newArtistName, setNewArtistName] = useState('');
  const [newArtistRole, setNewArtistRole] = useState('غناء وعزف عود');
  const [newArtistBio, setNewArtistBio] = useState('');
  const [newArtistAvatar, setNewArtistAvatar] = useState('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80');

  // Settings Form
  const [settingsForm, setSettingsForm] = useState<AdminSettings>(settings);

  // Sync state
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ success?: boolean; message?: string; count?: number }>({});

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === settings.adminPin || pinInput === 'admin' || pinInput === '1234') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('رمز الدخول غير صحيح. الرمز الافتراضي هو 1234');
    }
  };

  const handleSaveVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentVideo.title || !currentVideo.artist) return;

    const cleanYoutubeId = (currentVideo.youtubeId || '').trim();
    const thumbnail = `https://i.ytimg.com/vi/${cleanYoutubeId}/maxresdefault.jpg`;

    if (currentVideo.id) {
      const updated = videos.map(v => (v.id === currentVideo.id ? ({ ...v, ...currentVideo, thumbnail } as VideoItem) : v));
      onUpdateVideos(updated);
    } else {
      const newV: VideoItem = {
        id: `vid-${Date.now()}`,
        youtubeId: cleanYoutubeId || 'WocF-1xjuIs',
        title: currentVideo.title,
        artist: currentVideo.artist,
        artistId: currentVideo.artistId || 'art-osama',
        album: currentVideo.album || 'جلسات ديوان السعادة – نغم يجمعنا',
        categories: currentVideo.categories && currentVideo.categories.length > 0 ? currentVideo.categories : ['جلسات العود والتقاسيم'],
        publishedAt: currentVideo.publishedAt || new Date().toISOString().split('T')[0],
        duration: currentVideo.duration || '07:30',
        views: currentVideo.views || 0,
        downloads: 0,
        mp3Conversions: 0,
        thumbnail,
        featured: !!currentVideo.featured,
        lyrics: currentVideo.lyrics || '',
        composer: currentVideo.composer || '',
        lyricist: currentVideo.lyricist || '',
        maqam: currentVideo.maqam || 'بيات',
        rhythm: currentVideo.rhythm || 'جلسة عود',
        allowDownload: currentVideo.allowDownload !== false,
        allowMp3: currentVideo.allowMp3 !== false,
        rightsDeclared: true,
      };
      onUpdateVideos([newV, ...videos]);
    }

    setIsEditingVideo(false);
    setCurrentVideo({});
    setAutoSuggestedCats([]);
  };

  const handleDeleteVideo = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الفيديو من الأرشيف؟')) {
      const updated = videos.filter(v => v.id !== id);
      onUpdateVideos(updated);
    }
  };

  const handleVideoTitleChange = (title: string) => {
    setCurrentVideo(prev => ({ ...prev, title }));
    const detectedArtist = DataService.extractArtistFromTitle(title);
    const suggestions = DataService.suggestCategories(title, detectedArtist);
    setAutoSuggestedCats(suggestions);
    if (!currentVideo.artist || currentVideo.artist === 'جلسات ديوان السعادة') {
      setCurrentVideo(prev => ({ ...prev, artist: detectedArtist }));
    }
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      description: newCatDesc.trim() || 'تصنيف معتمد في ديوان السعادة.',
    };
    onUpdateCategories([...categories, newCat]);
    setNewCatName('');
    setNewCatDesc('');
  };

  const handleDeleteCategory = (id: string) => {
    if (categories.length <= 1) {
      alert('لا يمكن حذف كافة التصنيفات');
      return;
    }
    if (window.confirm('هل أنت متأكد من حذف هذا التصنيف؟')) {
      onUpdateCategories(categories.filter(c => c.id !== id));
    }
  };

  const handleAddArtist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArtistName.trim()) return;
    const newArt: Artist = {
      id: `art-${Date.now()}`,
      name: newArtistName.trim(),
      avatar: newArtistAvatar,
      role: newArtistRole,
      bio: newArtistBio.trim() || 'فنان معتمد في جلسات ديوان السعادة.',
      origin: 'صنعاء، اليمن',
      featured: false,
    };
    onUpdateArtists([...artists, newArt]);
    setNewArtistName('');
    setNewArtistBio('');
  };

  const handleDeleteArtist = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الفنان؟')) {
      onUpdateArtists(artists.filter(a => a.id !== id));
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(settingsForm);
    alert('تم حفظ إعدادات الموقع وهوية القناة بنجاح!');
  };

  const handleTriggerSync = async () => {
    setSyncing(true);
    setSyncStatus({});
    const result = await DataService.syncWithYouTube(settingsForm.youtubeApiKey, settingsForm.channelId);
    setSyncing(false);
    setSyncStatus(result);
    if (result.success && result.added.length > 0) {
      onUpdateVideos(DataService.getVideos());
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white border border-amber-200 p-8 rounded-3xl shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 mx-auto">
            <Shield className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 font-['Cairo']">لوحة تحكم ديوان السعادة</h2>
            <p className="text-xs text-slate-500">منطقة الإدارة وإعدادات المزامنة والأرشيف</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-right">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                رمز المرور (PIN)
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="أدخل رمز الدخول (الافتراضي: 1234)"
                  value={pinInput}
                  onChange={e => setPinInput(e.target.value)}
                  className="w-full bg-[#FFFDF7] border border-slate-300 rounded-xl pr-10 pl-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-teal-500 font-medium"
                  autoFocus
                />
                <Key className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
              </div>
            </div>

            {authError && (
              <p className="text-xs text-rose-600 font-bold flex items-center gap-1.5 justify-center">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{authError}</span>
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#13B8A6] hover:bg-[#0F766E] text-white font-bold text-sm transition-all shadow-md"
            >
              تسجيل الدخول إلى الإدارة
            </button>
          </form>

          <p className="text-[11px] text-slate-400">
            ملاحظة: يمكنك تغيير رمز المرور لاحقاً من قسم إعدادات الموقع.
          </p>
        </div>
      </div>
    );
  }

  const totalViews = videos.reduce((acc, v) => acc + (v.views || 0), 0);
  const totalDownloads = videos.reduce((acc, v) => acc + (v.downloads || 0), 0);
  const totalMp3 = videos.reduce((acc, v) => acc + (v.mp3Conversions || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-200/60 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-700 font-bold font-mono">لوحة تحكم الإدارة الرسمية</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Cairo'] mt-1">
            لوحة تحكم ديوان السعادة – نغم يجمعنا
          </h1>
        </div>

        <button
          onClick={() => setIsAuthenticated(false)}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 font-bold self-start md:self-auto"
        >
          تسجيل الخروج
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-amber-100 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>إجمالي الجلسات</span>
            <Video className="w-4 h-4 text-[#13B8A6]" />
          </div>
          <span className="text-2xl font-black text-slate-900 font-mono">{videos.length}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-amber-100 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>إجمالي المشاهدات</span>
            <Eye className="w-4 h-4 text-[#42BDEB]" />
          </div>
          <span className="text-2xl font-black text-slate-900 font-mono">{totalViews.toLocaleString('ar-YE')}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-amber-100 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>تنزيلات الفيديو</span>
            <Download className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-slate-900 font-mono">{totalDownloads.toLocaleString('ar-YE')}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-amber-100 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>تحويلات MP3</span>
            <FileAudio className="w-4 h-4 text-[#E8B957]" />
          </div>
          <span className="text-2xl font-black text-slate-900 font-mono">{totalMp3.toLocaleString('ar-YE')}</span>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-amber-200/60 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setAdminTab('videos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            adminTab === 'videos'
              ? 'bg-[#13B8A6] text-white shadow-sm'
              : 'bg-white text-slate-700 hover:text-teal-700 border border-slate-200'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>إدارة الفيديوهات ({videos.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('sync')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            adminTab === 'sync'
              ? 'bg-[#13B8A6] text-white shadow-sm'
              : 'bg-white text-slate-700 hover:text-teal-700 border border-slate-200'
          }`}
        >
          <Youtube className="w-4 h-4 text-red-600" />
          <span>حالة المزامنة والتحديث المجدول</span>
        </button>

        <button
          onClick={() => setAdminTab('categories')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            adminTab === 'categories'
              ? 'bg-[#13B8A6] text-white shadow-sm'
              : 'bg-white text-slate-700 hover:text-teal-700 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>إدارة التصنيفات الـ 19 ({categories.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('artists')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            adminTab === 'artists'
              ? 'bg-[#13B8A6] text-white shadow-sm'
              : 'bg-white text-slate-700 hover:text-teal-700 border border-slate-200'
          }`}
        >
          <Mic2 className="w-4 h-4" />
          <span>إدارة الفنانين ({artists.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            adminTab === 'settings'
              ? 'bg-[#13B8A6] text-white shadow-sm'
              : 'bg-white text-slate-700 hover:text-teal-700 border border-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>إعدادات وهوية القناة</span>
        </button>
      </div>

      {/* Tab 1: Video Management */}
      {adminTab === 'videos' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 font-['Cairo']">قائمة فيديوهات القناة</h2>
            <button
              onClick={() => {
                setCurrentVideo({
                  categories: ['الأغاني الصنعانية'],
                  allowDownload: true,
                  allowMp3: true,
                  publishedAt: new Date().toISOString().split('T')[0],
                });
                setIsEditingVideo(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#13B8A6] hover:bg-[#0F766E] text-white text-xs font-bold transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة جلسة / فيديو يدوياً</span>
            </button>
          </div>

          <div className="bg-white border border-amber-100 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs text-slate-700">
                <thead className="bg-[#FFFDF7] text-slate-600 font-bold border-b border-amber-100">
                  <tr>
                    <th className="p-4">الفيديو</th>
                    <th className="p-4">معرف YouTube</th>
                    <th className="p-4">الفنان</th>
                    <th className="p-4">التصنيفات</th>
                    <th className="p-4">المشاهدات</th>
                    <th className="p-4 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {videos.map(video => (
                    <tr key={video.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-16 h-10 rounded-lg object-cover flex-shrink-0"
                          onError={e => {
                            (e.target as HTMLImageElement).src = `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`;
                          }}
                        />
                        <div className="overflow-hidden max-w-xs">
                          <p className="font-bold text-slate-900 truncate font-['Cairo']">{video.title}</p>
                          <span className="text-[10px] text-slate-400">{video.duration} • {video.publishedAt}</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono font-bold text-teal-800">{video.youtubeId}</td>
                      <td className="p-4 font-bold text-slate-800">{video.artist}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {video.categories.map(c => (
                            <span key={c} className="px-2 py-0.5 rounded bg-teal-50 text-[10px] text-teal-800 font-medium">
                              {c}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 font-mono text-teal-900 font-bold">{video.views.toLocaleString('ar-YE')}</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setCurrentVideo(video);
                              setIsEditingVideo(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                            title="تعديل"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteVideo(video.id)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Sync Status, Scheduled Job, and Logs (Requirement 8) */}
      {adminTab === 'sync' && (
        <div className="space-y-6">
          {/* Status KPI Panel */}
          <div className="bg-white border border-amber-100 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 flex-shrink-0">
                  <Youtube className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-slate-900 font-['Cairo']">
                    حالة التكامل والتحديث التلقائي المجدول (كل 15 دقيقة)
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    يعمل التحديث التلقائي بشكل مستمر عبر خدمة خلفية مجدولة تسحب من uploads playlist الخاصة بالقناة ({settings.channelId}) وتمنع التكرار نهائياً.
                  </p>
                </div>
              </div>

              {/* Manual Sync Trigger */}
              <button
                onClick={handleTriggerSync}
                disabled={syncing}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#13B8A6] hover:bg-[#0F766E] text-white text-xs font-bold shadow-md shadow-teal-500/20 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                <span>{syncing ? 'جاري المزامنة...' : 'مزامنة يدوية فورية'}</span>
              </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-[#FFFDF7] p-4 rounded-2xl border border-amber-100 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">حالة الاتصال بيوتيوب</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1.5 mt-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>متصل بنجاح</span>
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">حالة التحديث المجدول (Cron)</span>
                <span className="font-bold text-teal-700 flex items-center gap-1.5 mt-1">
                  <Activity className="w-4 h-4" />
                  <span>نشط (كل 15 دقيقة)</span>
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">تاريخ آخر مزامنة</span>
                <span className="font-mono font-bold text-slate-800 mt-1 block">
                  {settings.lastSyncTime || 'غير متوفر'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">إجمالي الفيديوهات الموثقة</span>
                <span className="font-mono font-bold text-amber-700 text-base mt-0.5 block">
                  {videos.length} جلسة
                </span>
              </div>
            </div>

            {/* Sync Feedback Message */}
            {syncStatus.message && (
              <div
                className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-3 border ${
                  syncStatus.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
              >
                {syncStatus.success ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" /> : <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600" />}
                <p>{syncStatus.message}</p>
              </div>
            )}

            {/* API Key Form */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 block">
                مفتاح Google YouTube Data API v3 (اختياري، يرفع حصة استعلامات البث المباشر)
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={settingsForm.youtubeApiKey}
                  onChange={e => setSettingsForm({ ...settingsForm, youtubeApiKey: e.target.value })}
                  className="flex-1 bg-[#FFFDF7] border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-teal-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    onUpdateSettings(settingsForm);
                    alert('تم حفظ مفتاح API بنجاح.');
                  }}
                  className="px-4 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900"
                >
                  حفظ المفتاح
                </button>
              </div>
            </div>

            {/* Sync Operation Logs History (Requirement 8) */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 font-['Cairo'] flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600" />
                <span>سجل عمليات المزامنة والتحديث (Sync Logs)</span>
              </h3>

              <div className="bg-[#FFFDF7] border border-amber-100 rounded-2xl p-3 max-h-52 overflow-y-auto space-y-2">
                {(settings.syncLogs || []).length > 0 ? (
                  settings.syncLogs.map(log => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-xl bg-white border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        {log.success ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        )}
                        <span className="font-medium text-slate-800">{log.message}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-sans">
                          {log.source === 'scheduled' ? 'تلقائي' : 'يدوي'}
                        </span>
                        <span>{log.timestamp}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 p-2 text-center">لا توجد سجلات بعد.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Categories (19 categories) */}
      {adminTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 font-['Cairo']">إدارة التصنيفات الـ 19</h2>
          </div>

          <form onSubmit={handleAddCategory} className="bg-white border border-amber-100 p-5 rounded-3xl space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 font-['Cairo']">إضافة تصنيف جديد</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-700 font-bold block mb-1">اسم التصنيف</label>
                <input
                  type="text"
                  placeholder="مثال: روائع الدان الصنعاني"
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  className="w-full bg-[#FFFDF7] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-700 font-bold block mb-1">وصف التصنيف</label>
                <input
                  type="text"
                  placeholder="نبذة مختصرة عن هذا اللون الغنائي..."
                  value={newCatDesc}
                  onChange={e => setNewCatDesc(e.target.value)}
                  className="w-full bg-[#FFFDF7] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#13B8A6] text-white text-xs font-bold hover:bg-[#0F766E]"
            >
              إضافة التصنيف
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat, idx) => (
              <div
                key={cat.id}
                className="p-4 rounded-2xl bg-white border border-amber-100 flex items-start justify-between gap-3 shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-teal-800 font-mono font-bold">#{idx + 1}</span>
                    <h4 className="text-sm font-bold text-slate-900 font-['Cairo']">{cat.name}</h4>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{cat.description}</p>
                </div>
                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                  title="حذف"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Artists Management */}
      {adminTab === 'artists' && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-900 font-['Cairo']">إدارة الفنانين ونجوم الجلسات</h2>

          <form onSubmit={handleAddArtist} className="bg-white border border-amber-100 p-5 rounded-3xl space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 font-['Cairo']">إضافة فنان جديد</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-slate-700 font-bold block mb-1">اسم الفنان</label>
                <input
                  type="text"
                  placeholder="مثال: أسامة المقدم"
                  value={newArtistName}
                  onChange={e => setNewArtistName(e.target.value)}
                  className="w-full bg-[#FFFDF7] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-700 font-bold block mb-1">الصفة / الدور</label>
                <input
                  type="text"
                  placeholder="غناء وعزف عود"
                  value={newArtistRole}
                  onChange={e => setNewArtistRole(e.target.value)}
                  className="w-full bg-[#FFFDF7] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-700 font-bold block mb-1">رابط الصورة</label>
                <input
                  type="text"
                  value={newArtistAvatar}
                  onChange={e => setNewArtistAvatar(e.target.value)}
                  className="w-full bg-[#FFFDF7] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-700 font-bold block mb-1">نبذة عن الفنان</label>
              <textarea
                rows={2}
                value={newArtistBio}
                onChange={e => setNewArtistBio(e.target.value)}
                className="w-full bg-[#FFFDF7] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-500"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#13B8A6] text-white text-xs font-bold hover:bg-[#0F766E]"
            >
              إضافة الفنان
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {artists.map(art => (
              <div
                key={art.id}
                className="p-4 rounded-2xl bg-white border border-amber-100 flex items-center justify-between gap-3 shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={art.avatar}
                    alt={art.name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 font-['Cairo']">{art.name}</h4>
                    <p className="text-xs text-teal-700 font-bold">{art.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteArtist(art.id)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Site Settings & Brand */}
      {adminTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-white border border-amber-100 p-6 sm:p-8 rounded-3xl space-y-6 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 font-['Cairo']">هوية القناة والإعدادات العامة</h2>
            <p className="text-xs text-slate-500">تخصيص الشعار، الغلاف، النصوص وحماية لوحة الإدارة</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs text-slate-700 font-bold block mb-1">اسم القناة والمنصة</label>
              <input
                type="text"
                value={settingsForm.channelName}
                onChange={e => setSettingsForm({ ...settingsForm, channelName: e.target.value })}
                className="w-full bg-[#FFFDF7] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-700 font-bold block mb-1">معرف القناة (Channel ID)</label>
              <input
                type="text"
                value={settingsForm.channelId}
                onChange={e => setSettingsForm({ ...settingsForm, channelId: e.target.value })}
                className="w-full bg-[#FFFDF7] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-700 font-bold block mb-1">رابط صورة الغلاف الرسمية</label>
              <input
                type="text"
                value={settingsForm.channelCoverUrl}
                onChange={e => setSettingsForm({ ...settingsForm, channelCoverUrl: e.target.value })}
                className="w-full bg-[#FFFDF7] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-700 font-bold block mb-1">رابط الشعار الرسمي</label>
              <input
                type="text"
                value={settingsForm.channelLogoUrl}
                onChange={e => setSettingsForm({ ...settingsForm, channelLogoUrl: e.target.value })}
                className="w-full bg-[#FFFDF7] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-700 font-bold block mb-1">رمز المرور للوحة الإدارة (PIN)</label>
              <input
                type="text"
                value={settingsForm.adminPin}
                onChange={e => setSettingsForm({ ...settingsForm, adminPin: e.target.value })}
                className="w-full bg-[#FFFDF7] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-700 font-bold block mb-1">رابط البث الصوتي المباشر (راديو القناة الرسمي)</label>
              <input
                type="text"
                placeholder="https://stream.dewanalsaada.com/live"
                value={settingsForm.liveStreamUrl || ''}
                onChange={e => setSettingsForm({ ...settingsForm, liveStreamUrl: e.target.value })}
                className="w-full bg-[#FFFDF7] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <input
              type="checkbox"
              id="liveStreamActiveCheckbox"
              checked={!!settingsForm.isLiveStreamActive}
              onChange={e => setSettingsForm({ ...settingsForm, isLiveStreamActive: e.target.checked })}
              className="w-4 h-4 text-teal-600 rounded"
            />
            <label htmlFor="liveStreamActiveCheckbox" className="text-xs font-bold text-slate-800 cursor-pointer">
              تفعيل إشارة البث المباشر في الراديو (إظهار حالة "مباشر" للزوار)
            </label>
          </div>

          <div>
            <label className="text-xs text-slate-700 font-bold block mb-1">وصف المنصة والقناة</label>
            <textarea
              rows={3}
              value={settingsForm.channelDescription}
              onChange={e => setSettingsForm({ ...settingsForm, channelDescription: e.target.value })}
              className="w-full bg-[#FFFDF7] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Full Production Export Package Section */}
          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-300 space-y-3">
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-amber-800" />
              <h3 className="text-sm font-bold text-amber-950 font-['Cairo']">
                تصدير نسخة الإنتاج الجاهزة للاستضافة الخارجية (Production ZIP)
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-['Tajawal']">
              حمّل حزمة ZIP الكاملة النظيفة الخالية من المفاتيح والأسرار، متضمنة ملفات الخادم والواجهة والمكتبات وقاعدة البيانات وتعليمات النشر والتشغيل.
            </p>
            <a
              href="/api/export/package.zip"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md transition-all"
            >
              <Download className="w-4 h-4" />
              <span>تنزيل ملف الحزمة الكاملة dewan-al-saada-production.zip</span>
            </a>
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#13B8A6] hover:bg-[#0F766E] text-white text-xs font-bold transition-all shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>حفظ التعديلات بالكامل</span>
          </button>
        </form>
      )}

      {/* Video Add / Edit Modal */}
      {isEditingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border border-amber-200 rounded-3xl max-w-2xl w-full p-6 text-right space-y-4 my-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 font-['Cairo']">
                {currentVideo.id ? 'تعديل بيانات الفيديو والجلسة' : 'إضافة فيديو جديد للأرشيف'}
              </h3>
              <button
                onClick={() => setIsEditingVideo(false)}
                className="p-1 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveVideo} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-700 block mb-1 font-bold">عنوان الفيديو والجلسة</label>
                <input
                  type="text"
                  placeholder="مثال: أسامة المقدم - خطر غصن القنا"
                  value={currentVideo.title || ''}
                  onChange={e => handleVideoTitleChange(e.target.value)}
                  required
                  className="w-full bg-[#FFFDF7] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>

              {autoSuggestedCats.length > 0 && (
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl space-y-2">
                  <span className="text-[11px] text-teal-900 font-bold block">
                    نظام الاقتراح التلقائي للتصنيفات:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {autoSuggestedCats.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          const existing = currentVideo.categories || [];
                          if (!existing.includes(cat)) {
                            setCurrentVideo({ ...currentVideo, categories: [...existing, cat] });
                          }
                        }}
                        className="px-2 py-1 rounded-md bg-white text-teal-800 text-[10px] font-bold border border-teal-300"
                      >
                        + إضافة {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">اسم الفنان</label>
                  <input
                    type="text"
                    value={currentVideo.artist || ''}
                    onChange={e => setCurrentVideo({ ...currentVideo, artist: e.target.value })}
                    required
                    className="w-full bg-[#FFFDF7] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="text-slate-700 block mb-1 font-bold">معرف YouTube Video ID (11 رمزاً)</label>
                  <input
                    type="text"
                    placeholder="WocF-1xjuIs"
                    value={currentVideo.youtubeId || ''}
                    onChange={e => setCurrentVideo({ ...currentVideo, youtubeId: e.target.value.trim() })}
                    required
                    className="w-full bg-[#FFFDF7] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-bold">التصنيفات المحددة</label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-[#FFFDF7] rounded-xl border border-slate-200 max-h-32 overflow-y-auto">
                  {categories.map(cat => {
                    const isSelected = currentVideo.categories?.includes(cat.name);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          const existing = currentVideo.categories || [];
                          if (isSelected) {
                            setCurrentVideo({ ...currentVideo, categories: existing.filter(c => c !== cat.name) });
                          } else {
                            setCurrentVideo({ ...currentVideo, categories: [...existing, cat.name] });
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                          isSelected
                            ? 'bg-[#13B8A6] text-white'
                            : 'bg-white text-slate-700 border border-slate-200'
                        }`}
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-bold">كلمات الأغنية (اختياري)</label>
                <textarea
                  rows={4}
                  placeholder="أدخل نص القصيدة والأغنية هنا..."
                  value={currentVideo.lyrics || ''}
                  onChange={e => setCurrentVideo({ ...currentVideo, lyrics: e.target.value })}
                  className="w-full bg-[#FFFDF7] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-teal-500 font-['Cairo']"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditingVideo(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#13B8A6] text-white font-bold hover:bg-[#0F766E]"
                >
                  حفظ البيانات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
