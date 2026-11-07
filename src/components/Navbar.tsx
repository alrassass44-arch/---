import {
  BellRing,
  ExternalLink,
  Facebook,
  Lock,
  LogOut,
  Menu,
  MessageCircle,
  Music,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  Unlock,
  X,
  Youtube,
  Bot,
  Sparkles,
} from 'lucide-react';
import React, { useState } from 'react';
import { ActiveTab, AdminSettings, VideoItem } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  settings: AdminSettings;
  videos: VideoItem[];
  onSelectVideo: (video: VideoItem) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isAdminUnlocked: boolean;
  onOpenAdminAuth: () => void;
  onLogoutAdmin: () => void;
  onOpenAiAssistant?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  settings,
  videos,
  onSelectVideo,
  searchQuery,
  setSearchQuery,
  isAdminUnlocked,
  onOpenAdminAuth,
  onLogoutAdmin,
  onOpenAiAssistant,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const YOUTUBE_SUBSCRIBE_URL = 'https://www.youtube.com/@dewanalsaada?sub_confirmation=1';
  const FACEBOOK_PAGE_URL = 'https://www.facebook.com/dewanalsaada/';

  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const handleCopyTabLink = (e: React.MouseEvent, tabId: string, label: string) => {
    e.stopPropagation();
    const url = `${window.location.origin}/#${tabId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedTab(tabId);
        setTimeout(() => setCopiedTab(null), 2000);
      }).catch(() => {});
    }
  };

  const DEVELOPER_WHATSAPP_URL = `https://wa.me/967774632249?text=${encodeURIComponent('السلام عليكم ارغب في التواصل معكم لطلب موقع الكتروني او اعلان ممول')}`;

  // Streamlined primary navigation for desktop (removed duplicates: الأغاني and الفنانون)
  const primaryNavItems: { id: ActiveTab; label: string }[] = [
    { id: 'home', label: 'الرئيسية' },
    { id: 'library', label: 'المكتبة' },
    { id: 'videos', label: 'الفيديوهات' },
    { id: 'albums', label: 'الألبومات' },
    { id: 'lyrics', label: 'الكلمات' },
    { id: 'radio', label: 'الراديو' },
    { id: 'contact', label: 'تواصل معنا' },
  ];

  // Secondary sections grouped in dropdown
  const secondaryNavItems: { id: ActiveTab; label: string }[] = [
    { id: 'artists', label: 'الفنانون' },
    { id: 'songs', label: 'الأغاني' },
    { id: 'categories', label: 'التصنيفات الـ 19' },
    { id: 'popular', label: 'الأكثر مشاهدة' },
    { id: 'new-releases', label: 'الإصدارات الجديدة' },
  ];

  const searchResults = searchQuery.trim()
    ? videos
        .filter(
          v =>
            v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.categories.some(c => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (v.lyrics && v.lyrics.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .slice(0, 5)
    : [];

  const handleAdminClick = () => {
    if (!isAdminUnlocked) {
      onOpenAdminAuth();
    } else {
      setActiveTab('admin');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group flex-shrink-0"
            onClick={() => setActiveTab('home')}
          >
            <div className="relative">
              <img
                src={settings.channelLogoUrl}
                alt="ديوان السعادة"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-amber-400 object-cover group-hover:scale-105 transition-transform duration-300 shadow-md shadow-amber-500/20"
                onError={e => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=160&q=80';
                }}
              />
              <span
                className="absolute -bottom-0.5 -left-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-emerald-500 border-2 border-white rounded-full"
                title="قناة رسمية موثقة"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-black text-sm sm:text-lg md:text-xl text-slate-900 tracking-wide font-['Cairo']">
                  ديوان السعادة
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 font-bold border border-teal-200 hidden xs:inline-block">
                  نغم يجمعنا
                </span>
              </div>
              <span className="text-[11px] sm:text-xs text-slate-500 font-medium hidden sm:inline-block">
                إحياء الأغنية اليمنية بطابع شبابي فرائحي
              </span>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-xs xl:max-w-sm mx-3 relative">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="ابحث عن أغنية، فنان، ألبوم..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 250)}
                className="w-full bg-[#FFFDF7] border border-slate-200 rounded-xl pr-9 pl-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all font-medium"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Suggestions Dropdown */}
            {searchFocused && searchResults.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-white border border-amber-200 rounded-2xl shadow-xl overflow-hidden z-50">
                <div className="px-3.5 py-2 text-xs font-bold text-teal-800 bg-teal-50 border-b border-teal-100">
                  نتائج فورية ({searchResults.length})
                </div>
                {searchResults.map(video => (
                  <div
                    key={video.id}
                    onMouseDown={() => {
                      onSelectVideo(video);
                      setActiveTab('watch');
                    }}
                    className="p-3 hover:bg-teal-50/60 cursor-pointer flex items-center gap-3 border-b border-slate-100 last:border-b-0 transition-colors"
                  >
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-12 h-9 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-900 truncate">{video.title}</p>
                      <p className="text-[11px] text-teal-700 font-medium">{video.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Streamlined Desktop Navigation Links (with Copy Link Icon) */}
          <nav className="hidden xl:flex items-center gap-1 relative">
            {primaryNavItems.map(item => {
              const isCopied = copiedTab === item.id;
              return (
                <div
                  key={item.id}
                  className={`relative group/nav flex items-center rounded-xl transition-all ${
                    activeTab === item.id
                      ? 'bg-[#13B8A6] text-white shadow-sm'
                      : 'text-slate-700 hover:text-teal-700 hover:bg-teal-50'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      setSearchQuery('');
                      setMoreMenuOpen(false);
                    }}
                    className="pr-3 pl-1.5 py-1.5 text-xs font-bold whitespace-nowrap cursor-pointer"
                  >
                    {item.label}
                  </button>
                  <button
                    type="button"
                    onClick={e => handleCopyTabLink(e, item.id, item.label)}
                    title={`نسخ رابط قسم ${item.label}`}
                    className={`pl-2 pr-1 py-1.5 text-xs rounded-l-xl transition-colors cursor-pointer ${
                      activeTab === item.id
                        ? 'hover:bg-teal-700/80 text-white/80 hover:text-white'
                        : 'text-slate-400 hover:text-teal-600 hover:bg-teal-100/60'
                    }`}
                  >
                    {isCopied ? (
                      <span className="text-[10px] text-emerald-300 font-mono font-bold">✓</span>
                    ) : (
                      <span className="text-[10px] opacity-70 group-hover/nav:opacity-100">🔗</span>
                    )}
                  </button>
                </div>
              );
            })}

            {/* Secondary dropdown menu (المزيد) */}
            <div className="relative">
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  secondaryNavItems.some(s => s.id === activeTab)
                    ? 'bg-teal-50 text-teal-800 border border-teal-300'
                    : 'text-slate-600 hover:text-teal-700 hover:bg-teal-50'
                }`}
              >
                <span>المزيد</span>
                <span className="text-[10px]">▼</span>
              </button>

              {moreMenuOpen && (
                <div
                  className="absolute left-0 mt-2 w-48 bg-white border border-amber-200 rounded-2xl shadow-xl py-2 z-50 text-right animate-in fade-in duration-150"
                  onMouseLeave={() => setMoreMenuOpen(false)}
                >
                  {secondaryNavItems.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between px-3 py-1.5 hover:bg-teal-50 transition-colors"
                    >
                      <button
                        onClick={() => {
                          setActiveTab(item.id);
                          setMoreMenuOpen(false);
                        }}
                        className={`text-right flex-1 text-xs font-bold ${
                          activeTab === item.id ? 'text-teal-700' : 'text-slate-700'
                        }`}
                      >
                        {item.label}
                      </button>
                      <button
                        onClick={e => handleCopyTabLink(e, item.id, item.label)}
                        className="text-[10px] text-slate-400 hover:text-teal-600 p-1"
                        title="نسخ الرابط"
                      >
                        {copiedTab === item.id ? '✓' : '🔗'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Action Hub: Facebook, YouTube, Developer WhatsApp & Channel WhatsApp */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Developer Dedicated WhatsApp Button (ALRASSASS) */}
            <a
              href={DEVELOPER_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-sm shadow-amber-500/20 transition-all border border-amber-300"
              title="تواصل مباشر مع المطور: تصميم ALRASSASS لطلب موقع إلكتروني أو إعلان ممول"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-slate-950 text-amber-500" />
              <span>تصميم ALRASSASS</span>
            </a>

            {/* Dewan AI Smart Assistant Button */}
            {onOpenAiAssistant && (
              <button
                onClick={onOpenAiAssistant}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600/15 via-teal-600/15 to-blue-600/15 hover:from-cyan-600/25 hover:to-blue-600/25 text-cyan-800 border border-cyan-400/50 text-xs font-bold transition-all shadow-xs cursor-pointer group"
                title="مساعد ديوان السعادة الذكي (إجابات فورية 24/7)"
              >
                <Bot className="w-3.5 h-3.5 text-cyan-600 group-hover:rotate-12 transition-transform" />
                <span className="hidden xl:inline">المساعد الذكي</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </button>
            )}

            {/* Facebook Page Link */}
            <a
              href={FACEBOOK_PAGE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] border border-[#1877F2]/30 text-xs font-bold transition-all"
              title="صفحة فيسبوك ديوان السعادة"
            >
              <Facebook className="w-3.5 h-3.5 fill-[#1877F2]" />
              <span className="hidden 2xl:inline">فيسبوك</span>
            </a>

            {/* YouTube Subscribe Button */}
            <a
              href={YOUTUBE_SUBSCRIBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold transition-all"
              title="اشتراك في قناة اليوتيوب وتفعيل الجرس"
            >
              <Youtube className="w-3.5 h-3.5 text-red-600" />
              <span className="hidden 2xl:inline">يوتيوب</span>
            </a>

            {/* Direct WhatsApp Manager Chat Button */}
            <a
              href={`https://wa.me/967733600800?text=${encodeURIComponent('السلام عليكم إدارة ديوان السعادة، أود الاستفسار والتواصل.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition-colors"
              title="تواصل واتساب مع إدارة القناة (+967 733 600 800)"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-emerald-600 text-white" />
              <span className="hidden 2xl:inline">الإدارة</span>
            </a>

            {/* Admin Entry Button (Protected with Access Code) */}
            {!isAdminUnlocked ? (
              <button
                onClick={handleAdminClick}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 border border-slate-200 hover:border-amber-300 text-xs font-bold transition-all cursor-pointer"
                title="دخول لوحة الإدارة (محمية برمز سري)"
              >
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>الإدارة</span>
              </button>
            ) : (
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-amber-900">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <button
                  onClick={() => setActiveTab('admin')}
                  className="hover:underline font-bold"
                >
                  لوحة الإدارة
                </button>
                <button
                  onClick={onLogoutAdmin}
                  className="p-1 hover:bg-amber-200/60 rounded text-slate-500 hover:text-rose-600 transition-colors mr-1"
                  title="تسجيل الخروج من الإدارة"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Actions and Hamburger Menu */}
          <div className="flex xl:hidden items-center gap-1.5">
            {/* Mobile Facebook quick icon */}
            <a
              href={FACEBOOK_PAGE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-blue-50 text-[#1877F2] border border-blue-200"
              title="صفحة الفيسبوك"
            >
              <Facebook className="w-4 h-4 fill-[#1877F2]" />
            </a>

            {/* Mobile YouTube quick icon */}
            <a
              href={YOUTUBE_SUBSCRIBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-200"
              title="اشتراك يوتيوب"
            >
              <Youtube className="w-4 h-4 text-red-600" />
            </a>

            {/* Mobile Admin button */}
            <button
              onClick={handleAdminClick}
              className="p-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200"
              title="لوحة الإدارة"
            >
              {isAdminUnlocked ? <ShieldCheck className="w-4 h-4 text-amber-600" /> : <Lock className="w-4 h-4 text-amber-600" />}
            </button>

            {/* Mobile Drawer Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="lg:hidden pb-3">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="ابحث عن أغنية أو فنان..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#FFFDF7] border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-amber-200 px-4 pt-3 pb-6 space-y-3 shadow-xl">
          <div className="grid grid-cols-2 gap-2 mb-2">
            {[...primaryNavItems, ...secondaryNavItems].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`text-right px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === item.id
                    ? 'bg-[#13B8A6] text-white shadow-sm'
                    : 'text-slate-700 hover:bg-teal-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Social Links inside Mobile Drawer */}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            {/* Developer Dedicated WhatsApp Button (ALRASSASS) */}
            <a
              href={DEVELOPER_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs shadow-md border border-amber-300"
            >
              <MessageCircle className="w-4 h-4 fill-slate-950 text-amber-500" />
              <span>تصميم ALRASSASS – تواصل مع المطور</span>
            </a>

            {/* Facebook Button in Drawer */}
            <a
              href={FACEBOOK_PAGE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1877F2] text-white font-bold text-xs shadow-sm"
            >
              <Facebook className="w-4 h-4 fill-white" />
              <span>صفحة فيسبوك ديوان السعادة الرسمية</span>
            </a>

            {/* YouTube Subscribe in Drawer */}
            <a
              href={YOUTUBE_SUBSCRIBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs shadow-sm"
            >
              <Youtube className="w-4 h-4 text-white" />
              <span>اشتراك وتفعيل الجرس بقناة يوتيوب</span>
              <BellRing className="w-3.5 h-3.5" />
            </a>

            {/* WhatsApp Contact in Drawer */}
            <a
              href={`https://wa.me/967733600800?text=${encodeURIComponent('السلام عليكم إدارة ديوان السعادة، أود الاستفسار والتواصل.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>مراسلة واتساب الأستاذ محمد قائد (+967733600800)</span>
            </a>

            {/* Admin Dashboard in Drawer */}
            <div className="pt-1 flex items-center justify-between">
              <button
                onClick={() => {
                  handleAdminClick();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2"
              >
                <Shield className="w-4 h-4 text-amber-600" />
                <span>{isAdminUnlocked ? 'لوحة إدارة الموقع' : 'دخول الإدارة (بالرمز السري)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
