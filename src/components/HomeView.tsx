import {
  Bell,
  BellRing,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Disc,
  ExternalLink,
  Facebook,
  FileAudio,
  Flame,
  Heart,
  HeartHandshake,
  MessageCircle,
  Mic2,
  Music,
  Phone,
  Play,
  Radio,
  RefreshCw,
  Send,
  Shield,
  Sparkles,
  Users,
  Youtube,
} from 'lucide-react';
import React, { useState } from 'react';
import { DataService } from '../services/dataService';
import { ActiveTab, AdminSettings, Album, Artist, Category, VideoItem } from '../types';
import { VideoCard } from './VideoCard';

interface HomeViewProps {
  settings: AdminSettings;
  videos: VideoItem[];
  artists: Artist[];
  albums: Album[];
  categories: Category[];
  favorites: string[];
  isAdminUnlocked?: boolean;
  onSelectVideo: (video: VideoItem) => void;
  onConvertMp3: (video: VideoItem) => void;
  onDownloadVideo: (video: VideoItem) => void;
  onToggleFavorite: (videoId: string) => void;
  setActiveTab: (tab: ActiveTab) => void;
  onCategoryClick: (categoryName: string) => void;
  onArtistClick: (artistName: string) => void;
  onSelectLyric: (video: VideoItem) => void;
  onOpenTalentModal: () => void;
  onShareVideo?: (video: VideoItem) => void;
  onSyncComplete?: (newVideos: VideoItem[]) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  settings,
  videos,
  artists,
  albums,
  categories,
  favorites,
  onSelectVideo,
  onConvertMp3,
  onDownloadVideo,
  onToggleFavorite,
  setActiveTab,
  onCategoryClick,
  onArtistClick,
  onSelectLyric,
  onOpenTalentModal,
  onShareVideo,
  onSyncComplete,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const MANAGER_PHONE = '+967733600800';
  const MANAGER_NAME = 'الأستاذ محمد قائد';
  const YOUTUBE_SUBSCRIBE_URL = 'https://www.youtube.com/@dewanalsaada?sub_confirmation=1';
  const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@dewanalsaada';
  const FACEBOOK_PAGE_URL = 'https://www.facebook.com/dewanalsaada/';

  const newReleases = [...videos].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 4);
  const mostViewed = [...videos].sort((a, b) => b.views - a.views).slice(0, 4);
  const suggestedVideos = videos.filter(v => v.featured).slice(0, 4);
  const songsWithLyrics = videos.filter(v => !!v.lyrics).slice(0, 4);

  const handleSyncClick = async () => {
    setIsSyncing(true);
    setSyncNotice(null);
    try {
      const res = await DataService.syncWithYouTube();
      setSyncNotice(res.message);
      if (res.added && res.added.length > 0 && onSyncComplete) {
        onSyncComplete(res.added);
      }
    } catch {
      setSyncNotice('المكتبة محدثة، لا توجد فيديوهات جديدة.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncNotice(null), 5000);
    }
  };

  const handleEnterSession = (categoryName?: string) => {
    if (categoryName) {
      onCategoryClick(categoryName);
    } else {
      setActiveTab('videos');
    }
  };

  // Curated Interactive Sessions Portals
  const sessionHubs = [
    {
      title: 'جلسات الطرب الصنعاني الأصيل',
      subtitle: 'ألحان التراث الصنعاني، المقامات التليدة، وأوتار العود الخالصة',
      category: 'الأغاني الصنعانية',
      featuredArtist: 'إبراهيم الأحمر • أسامة المقدم',
      color: 'from-amber-600/90 to-amber-900/90',
      bgImg: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
      tag: 'تراث صنعاء القديمة',
    },
    {
      title: 'جلسات الدان الحضرمي والسلطنة',
      subtitle: 'روائع المحضار وبلفقيه، نغم المكلا وشبام وصوت العود الشجي',
      category: 'الأغاني الحضرمية',
      featuredArtist: 'محمد بلفقيه • محمد الناخبي',
      color: 'from-teal-700/90 to-emerald-950/90',
      bgImg: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=600&q=80',
      tag: 'الدان الحضرمي',
    },
    {
      title: 'جلسات الشرح اللحجي والعدني',
      subtitle: 'إيقاعات الفرح اللحجي الحماسي، نغمات القمندان وفيصل علوي',
      category: 'الشرح اللحجي',
      featuredArtist: 'عزيز مبارك • فيصل علوي',
      color: 'from-sky-700/90 to-blue-950/90',
      bgImg: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
      tag: 'إيقاع وشرح',
    },
    {
      title: 'سلطنة وتقاسيم العود المنفرد',
      subtitle: 'جلسات استماع خاصة للعود الصافي، تقاسيم مقامات راست وبياتي وحجاز',
      category: 'جلسات العود والتقاسيم',
      featuredArtist: 'كمال النعمان • أسامة المقدم',
      color: 'from-purple-800/90 to-indigo-950/90',
      bgImg: 'https://images.unsplash.com/photo-1520523839898-5071282543e1?auto=format&fit=crop&w=600&q=80',
      tag: 'صولو عود نقي',
    },
  ];

  return (
    <div className="space-y-10 sm:space-y-12 pb-16 w-full overflow-x-hidden">
      {/* Grand Joyful Hero Banner with Full Responsive Design */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0F766E] via-[#13B8A6] to-[#0284C7] text-white">
        {/* Decorative background grid */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-6 sm:gap-8 text-center lg:text-right">
            {/* Channel Logo */}
            <div className="relative flex-shrink-0">
              <img
                src={settings.channelLogoUrl}
                alt={settings.channelName}
                className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full border-4 border-amber-300 shadow-2xl shadow-teal-950/40 object-cover bg-white"
                onError={e => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=200&q=80';
                }}
              />
              <div
                className="absolute bottom-1 right-2 bg-emerald-500 text-white rounded-full p-1.5 border-2 border-white shadow-md"
                title="قناة موثقة رسمياً"
              >
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 fill-current text-white" />
              </div>
            </div>

            {/* Channel Info & Description */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-['Cairo'] tracking-tight drop-shadow-sm">
                  {settings.channelName}
                </h1>
                <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black shadow-sm">
                  القناة الرسمية • @dewanalsaada
                </span>
              </div>

              <p className="text-xs sm:text-sm md:text-base text-teal-50 max-w-2xl leading-relaxed font-['Tajawal'] drop-shadow-sm font-medium mx-auto lg:mx-0">
                {settings.channelDescription}
              </p>

              {/* Official Social Action Bar (YouTube Subscribe, Bell, Facebook) */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 pt-2">
                {/* YouTube Subscribe Button */}
                <a
                  href={YOUTUBE_SUBSCRIBE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 sm:py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-900/30 transition-all transform hover:scale-105 active:scale-95"
                  title="اشترك في قناة ديوان السعادة على يوتيوب"
                >
                  <Youtube className="w-4 h-4 text-white" />
                  <span>اشتراك في القناة</span>
                </a>

                {/* YouTube Notification Bell Button */}
                <a
                  href={YOUTUBE_CHANNEL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3.5 py-2 sm:py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md shadow-amber-900/20 transition-all transform hover:scale-105 active:scale-95"
                  title="تفعيل جرس التنبيهات ليصلك كل تسجيل جديد فوراً"
                >
                  <BellRing className="w-4 h-4 text-slate-950 animate-bounce" />
                  <span>تفعيل الجرس 🔔</span>
                </a>

                {/* Facebook Page Button */}
                <a
                  href={FACEBOOK_PAGE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 sm:py-2.5 rounded-xl bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold text-xs shadow-md shadow-blue-900/30 transition-all transform hover:scale-105 active:scale-95"
                  title="صفحة فيسبوك الرسمية لديوان السعادة"
                >
                  <Facebook className="w-4 h-4 fill-white text-[#1877F2]" />
                  <span>صفحة الفيسبوك</span>
                </a>
              </div>

              {/* Badges Bar */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-2 text-[11px] sm:text-xs">
                <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-xl border border-white/25 font-bold">
                  <Music className="w-3.5 h-3.5 text-amber-300" />
                  <span>19 تصنيف تراثي</span>
                </span>
                <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-xl border border-white/25 font-bold">
                  <Radio className="w-3.5 h-3.5 text-amber-300" />
                  <span>مزامنة تلقائية كل 15 دقيقة</span>
                </span>
                <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-xl border border-white/25 font-bold">
                  <Disc className="w-3.5 h-3.5 text-amber-300" />
                  <span>جلسات العود والصوت النقي</span>
                </span>
              </div>
            </div>

            {/* Quick Actions in Hero */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-center gap-3 pt-3 lg:pt-0 w-full lg:w-auto">
              <button
                onClick={() => handleEnterSession()}
                className="w-full sm:w-auto lg:w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-950/20 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>دخول الجلسات والمكتبة</span>
              </button>

              <button
                onClick={onOpenTalentModal}
                className="w-full sm:w-auto lg:w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <HeartHandshake className="w-4 h-4" />
                <span>طلب دعم فني للمواهب</span>
              </button>

              <div className="flex items-center gap-2 w-full">
                <a
                  href={`https://wa.me/967733600800?text=${encodeURIComponent('السلام عليكم إدارة ديوان السعادة، أود الاستفسار والتواصل.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs border border-white/30 backdrop-blur-md transition-all"
                  title="مراسلة الأستاذ محمد قائد عبر واتساب"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span>واتساب الإدارة</span>
                </a>

                <button
                  onClick={handleSyncClick}
                  disabled={isSyncing}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                  title="تحديث آلي لمحتوى قناة اليوتيوب وإضافة أي جلسات جديدة فوراً إلى الموقع والتطبيق"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'جاري الفحص...' : 'تحديث آلي من القناة'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sync Notification Banner */}
      {syncNotice && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold flex items-center gap-2 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
            <span>{syncNotice}</span>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. Bawaabat Dokhoul Al-Jalasat: Interactive Session Entrance */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 border-b border-amber-200/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shadow-sm flex-shrink-0">
              <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current text-[#D97706]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-['Cairo'] flex items-center gap-2">
                <span>بوابة الدخول إلى الجلسات الطربية</span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold">
                  مفتوحة للجميع
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                اختر لون الطرب المفضل وادخل مباشرة للاستماع إلى أندر تسجيلات ديوان السعادة بصنعاء
              </p>
            </div>
          </div>

          <button
            onClick={() => handleEnterSession()}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <span>عرض كل الجلسات ({videos.length})</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Interactive Gateway Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {sessionHubs.map((hub, index) => (
            <div
              key={index}
              onClick={() => handleEnterSession(hub.category)}
              className="group relative rounded-3xl overflow-hidden border border-amber-200/80 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1.5 flex flex-col justify-between min-h-[240px] sm:min-h-[260px]"
            >
              {/* Background Image */}
              <img
                src={hub.bgImg}
                alt={hub.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />

              {/* Gradient tint overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-t ${hub.color} group-hover:opacity-95 transition-opacity`}
              />

              {/* Card Header */}
              <div className="relative z-10 p-4 sm:p-5 flex items-start justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[11px] font-bold text-amber-200">
                  {hub.tag}
                </span>

                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
                  <Play className="w-4 h-4 fill-current translate-x-0.5" />
                </div>
              </div>

              {/* Card Footer Body */}
              <div className="relative z-10 p-4 sm:p-5 text-white">
                <p className="text-[11px] text-amber-300 font-bold mb-1">
                  {hub.featuredArtist}
                </p>
                <h3 className="text-base font-black font-['Cairo'] mb-1.5 leading-snug drop-shadow-sm">
                  {hub.title}
                </h3>
                <p className="text-xs text-white/80 line-clamp-2 leading-relaxed mb-3 font-['Tajawal']">
                  {hub.subtitle}
                </p>

                <div className="flex items-center justify-between pt-2.5 border-t border-white/20 text-xs font-bold">
                  <span className="text-amber-200 group-hover:text-amber-300 flex items-center gap-1">
                    <span>دخول الجلسة والاستماع</span>
                    <ChevronLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
                  </span>
                  <span className="text-[10px] text-emerald-300 bg-black/30 px-2 py-0.5 rounded-md">
                    متاح مجاناً
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. Official Social Channels Follow Section (YouTube & Facebook) */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* YouTube Card with Subscribe & Bell */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-red-600 via-rose-600 to-red-800 text-white shadow-xl flex flex-col justify-between space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0">
                <Youtube className="w-7 h-7 text-white" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold bg-white/20 px-2.5 py-0.5 rounded-full inline-block">
                  قناة اليوتيوب الرسمية
                </span>
                <h3 className="text-lg font-black font-['Cairo']">
                  اشترك وفعّل جرس التنبيهات ليصلك كل جديد
                </h3>
                <p className="text-xs text-red-100 leading-relaxed font-['Tajawal']">
                  انضم إلى آلاف المتابعين لقناة ديوان السعادة وتابع الجلسات الحصرية المنشورة بجودة 1080p وصوت ستيريو عالي النقاء.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={YOUTUBE_SUBSCRIBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white text-red-700 hover:bg-red-50 font-black text-xs shadow-md transition-all cursor-pointer"
              >
                <Youtube className="w-4 h-4 text-red-600" />
                <span>اشتراك فوري بالقناة</span>
              </a>

              <a
                href={YOUTUBE_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
              >
                <BellRing className="w-4 h-4" />
                <span>تفعيل الجرس 🔔</span>
              </a>
            </div>
          </div>

          {/* Facebook Official Page Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#1877F2] via-[#0D65D9] to-[#0A4EA8] text-white shadow-xl flex flex-col justify-between space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0">
                <Facebook className="w-7 h-7 fill-white text-[#1877F2]" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold bg-white/20 px-2.5 py-0.5 rounded-full inline-block">
                  صفحة الفيسبوك الرسمية
                </span>
                <h3 className="text-lg font-black font-['Cairo']">
                  تابع صفحتنا على فيسبوك للاطلاع على كل جديد
                </h3>
                <p className="text-xs text-blue-100 leading-relaxed font-['Tajawal']">
                  مقتطفات الجلسات، كواليس التسجيلات، إعلانات الفعاليات القادمة، وتغطيات مباشرة عبر صفحة ديوان السعادة على فيسبوك.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={FACEBOOK_PAGE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white text-[#1877F2] hover:bg-blue-50 font-black text-xs shadow-md transition-all cursor-pointer"
              >
                <Facebook className="w-4 h-4 fill-current" />
                <span>زيارة صفحة فيسبوك (facebook.com/dewanalsaada)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. Dedicated Artists & Creative Talent Support Banner */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-10 shadow-2xl border border-emerald-500/30">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1.5px,transparent_1.5px)] [background-size:20px_20px]" />
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
            <div className="space-y-3 sm:space-y-4 text-center lg:text-right max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>رعاية المواهب ودعم المبدعين</span>
              </div>

              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black font-['Cairo'] text-white leading-snug">
                هل تمتلك موهبة غنائية أو عزف عود وتبحث عن دعم فني؟
              </h2>

              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-['Tajawal']">
                تفتح إدارة <span className="text-amber-300 font-bold">ديوان السعادة</span> أبوابها لرعاية وتوثيق المواهب اليمنية والعربية الشابة ونشر أعمالهم في أرقى جلسات الطرب. تواصل مباشرة مع المشرف العام <span className="text-amber-300 font-bold">{MANAGER_NAME}</span> عبر نموذج الواتساب المخصص أو بالاتصال المباشر.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1 text-[11px] sm:text-xs text-emerald-200">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>تسجيل استوديو وتوثيق رسمي</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>حفظ ونشر حقوق الفنان</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>إدارة: {MANAGER_NAME} ({MANAGER_PHONE})</span>
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto flex-shrink-0">
              <button
                onClick={onOpenTalentModal}
                className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-950/40 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <HeartHandshake className="w-5 h-5 text-emerald-900" />
                <span>تقديم طلب رعاية فنية عبر واتساب</span>
              </button>

              <a
                href={`https://wa.me/967733600800?text=${encodeURIComponent('السلام عليكم الأستاذ محمد قائد، أود التواصل بخصوص المشاركة في جلسات ديوان السعادة.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs backdrop-blur-md transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-current text-emerald-400" />
                <span>محادثة واتساب مباشرة ({MANAGER_PHONE})</span>
              </a>

              <a
                href={`tel:${MANAGER_PHONE}`}
                className="flex items-center justify-center gap-2 px-4 py-2 text-center text-xs text-emerald-200 hover:text-white transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>أو الاتصال المباشر: {MANAGER_PHONE}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 19 Categories Luxury Quick Horizontal Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#13B8A6]" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 font-['Cairo']">
              تصنيفات ديوان السعادة المعتمدة (19 تصنيفاً تراثياً)
            </h2>
          </div>
          <button
            onClick={() => setActiveTab('categories')}
            className="text-xs text-teal-700 hover:text-teal-900 hover:underline flex items-center gap-1 font-bold"
          >
            <span>عرض الكل</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat, index) => (
            <button
              key={cat.id}
              onClick={() => onCategoryClick(cat.name)}
              className="flex-shrink-0 px-3.5 sm:px-4 py-2 rounded-xl bg-white hover:bg-[#13B8A6] hover:text-white text-slate-700 border border-amber-100 hover:border-teal-400 text-xs font-bold transition-all whitespace-nowrap shadow-sm group"
            >
              <span className="text-[#13B8A6] group-hover:text-white ml-1.5 font-mono">
                #{index + 1}
              </span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Section 1: أحدث الإصدارات (New Releases) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 border-b border-amber-200/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-['Cairo']">أحدث الإصدارات والجلسات</h2>
              <p className="text-xs text-slate-500">آخر ما تم توثيقه ورفعه في جلسات ديوان السعادة</p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('new-releases')}
            className="text-xs text-teal-700 hover:underline flex items-center gap-1 font-bold"
          >
            <span>عرض الكل ({videos.length})</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {newReleases.map(video => (
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
              onShare={onShareVideo}
            />
          ))}
        </div>
      </section>

      {/* Section 2: الأكثر مشاهدة (Most Viewed) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 border-b border-amber-200/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-['Cairo']">الجلسات الأكثر مشاهدة واستماعاً</h2>
              <p className="text-xs text-slate-500">أعلى المشاهدات والإعجابات عبر محبي الفن اليمني</p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('popular')}
            className="text-xs text-amber-800 hover:underline flex items-center gap-1 font-bold"
          >
            <span>قائمة الأكثر مشاهدة</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {mostViewed.map(video => (
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
              onShare={onShareVideo}
            />
          ))}
        </div>
      </section>

      {/* Section 3: الفنانين المميزين (Featured Artists) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 border-b border-amber-200/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <Mic2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-['Cairo']">نجوم وفناني ديوان السعادة</h2>
              <p className="text-xs text-slate-500">نخبة من عمالقة ومبدعي الطرب اليمني المعاصر والقديم</p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('artists')}
            className="text-xs text-teal-700 hover:underline flex items-center gap-1 font-bold"
          >
            <span>جميع الفنانين ({artists.length})</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {artists.slice(0, 6).map(artist => {
            const count = videos.filter(v => v.artist === artist.name || v.title.includes(artist.name)).length;
            return (
              <div
                key={artist.id}
                onClick={() => onArtistClick(artist.name)}
                className="group p-3.5 sm:p-4 rounded-2xl bg-white border border-amber-100 hover:border-teal-400 text-center cursor-pointer transition-all hover:shadow-lg flex flex-col items-center"
              >
                <div className="relative mb-2.5">
                  <img
                    src={artist.avatar}
                    alt={artist.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-amber-300 group-hover:scale-105 transition-transform"
                    onError={e => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=200&q=80';
                    }}
                  />
                  {artist.featured && (
                    <span className="absolute bottom-0 right-0 w-4 h-4 sm:w-5 sm:h-5 bg-amber-400 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] text-slate-950 font-bold border border-white">
                      ★
                    </span>
                  )}
                </div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-teal-700 transition-colors font-['Cairo'] truncate w-full">
                  {artist.name}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate w-full">{artist.role}</p>
                <span className="mt-2 text-[10px] text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full font-bold">
                  {count > 0 ? `${count} تسجيلات` : 'مشارك بالجلسات'}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 4: كلمات الأغاني (Lyrics) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 border-b border-amber-200/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-['Cairo']">مكتبة كلمات الأغاني والقصائد</h2>
              <p className="text-xs text-slate-500">نصوص الأغاني التراثية مع إمكانية البحث والنسخ السريع</p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('lyrics')}
            className="text-xs text-purple-700 hover:underline flex items-center gap-1 font-bold"
          >
            <span>مكتبة الكلمات</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {songsWithLyrics.map(video => (
            <div
              key={video.id}
              onClick={() => onSelectLyric(video)}
              className="group p-4 sm:p-5 rounded-2xl bg-white border border-amber-100 hover:border-purple-400 cursor-pointer transition-all flex flex-col justify-between shadow-sm hover:shadow-md"
            >
              <div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 mb-2 inline-block font-bold">
                  كلمات موثقة
                </span>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-700 font-['Cairo'] line-clamp-1">
                  {video.title.split('-')[1]?.trim() || video.title}
                </h3>
                <p className="text-xs text-teal-800 font-bold mt-0.5 mb-2.5">{video.artist}</p>
                <div className="text-xs text-slate-700 font-['Cairo'] line-clamp-3 leading-relaxed bg-[#FFFDF7] p-2.5 sm:p-3 rounded-xl border border-amber-100 italic">
                  "{video.lyrics}"
                </div>
              </div>

              <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-purple-700 font-bold">
                <span>عرض القصيدة كاملة</span>
                <ChevronLeft className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 5: الأغاني المقترحة (Recommended Songs) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 border-b border-amber-200/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-['Cairo']">جلسات ننصحك بالاستماع إليها</h2>
              <p className="text-xs text-slate-500">مختارات طربية تجمع التراث الصنعاني واللحجي والدان الحضرمي</p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('videos')}
            className="text-xs text-teal-700 hover:underline flex items-center gap-1 font-bold"
          >
            <span>المكتبة الشاملة</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {suggestedVideos.map(video => (
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
              onShare={onShareVideo}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
