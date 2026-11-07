import { Bot, MessageCircle, Shield, Sparkles } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { AdminDashboard } from './components/AdminDashboard';
import { AlbumsView } from './components/AlbumsView';
import { ArtistDetailView } from './components/ArtistDetailView';
import { ArtistsView } from './components/ArtistsView';
import { CategoriesView } from './components/CategoriesView';
import { CategoryDetailView } from './components/CategoryDetailView';
import { ContactView } from './components/ContactView';
import { DewanAiAssistantModal } from './components/DewanAiAssistantModal';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { LibraryAuthModal } from './components/LibraryAuthModal';
import { LyricDetailView } from './components/LyricDetailView';
import { LyricsView } from './components/LyricsView';
import { Mp3ConverterModal } from './components/Mp3ConverterModal';
import { Navbar } from './components/Navbar';
import { PlayerView } from './components/PlayerView';
import { ScrollControls } from './components/ScrollControls';
import { ShareModal } from './components/ShareModal';
import { TalentSupportModal } from './components/TalentSupportModal';
import { VideoDownloadModal } from './components/VideoDownloadModal';
import { VideosView } from './components/VideosView';
import { RadioPlayer } from './components/RadioPlayer';
import { RadioSectionView } from './components/RadioSectionView';
import { DataService } from './services/dataService';
import { ActiveTab, AdminSettings, Album, Artist, Category, RadioTrack, VideoItem } from './types';

export default function App() {
  const [settings, setSettings] = useState<AdminSettings>(() => DataService.getSettings());
  const [videos, setVideos] = useState<VideoItem[]>(() => DataService.getVideos());
  const [categories, setCategories] = useState<Category[]>(() => DataService.getCategories());
  const [artists, setArtists] = useState<Artist[]>(() => DataService.getArtists());
  const [albums, setAlbums] = useState<Album[]>(() => DataService.getAlbums());
  const [favorites, setFavorites] = useState<string[]>(() => DataService.getFavorites());

  // Admin Access Gate (Strictly and only for Admin Dashboard)
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);

  // Modals State
  const [isTalentModalOpen, setIsTalentModalOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [shareModalVideo, setShareModalVideo] = useState<VideoItem | null>(null);

  // Navigation state
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);
  const [selectedLyricVideo, setSelectedLyricVideo] = useState<VideoItem | null>(null);

  // Media Modals
  const [mp3ModalVideo, setMp3ModalVideo] = useState<VideoItem | null>(null);
  const [downloadModalVideo, setDownloadModalVideo] = useState<VideoItem | null>(null);

  const [searchQuery, setSearchQuery] = useState('');

  // Check initial admin session on mount
  useEffect(() => {
    fetch('/api/library-access/status')
      .then(res => res.json())
      .then(data => {
        if (data && data.unlocked) {
          setIsAdminUnlocked(true);
        }
      })
      .catch(() => {});
  }, []);

  // Initial load: fetch videos from backend server /api/videos if available
  useEffect(() => {
    fetch('/api/videos')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.videos) && data.videos.length > 0) {
          const currentIds = new Set(videos.map(v => v.youtubeId));
          const newOnes = data.videos.filter((v: any) => !currentIds.has(v.youtubeId));
          if (newOnes.length > 0) {
            const merged = [...newOnes, ...videos];
            setVideos(merged);
            DataService.saveVideos(merged);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleUpdateSettings = (newSettings: AdminSettings) => {
    setSettings(newSettings);
    DataService.saveSettings(newSettings);
  };

  const handleUpdateVideos = (newVideos: VideoItem[]) => {
    setVideos(newVideos);
    DataService.saveVideos(newVideos);
  };

  const handleUpdateCategories = (newCategories: Category[]) => {
    setCategories(newCategories);
    DataService.saveCategories(newCategories);
  };

  const handleUpdateArtists = (newArtists: Artist[]) => {
    setArtists(newArtists);
    DataService.saveArtists(newArtists);
  };

  const handleUpdateAlbums = (newAlbums: Album[]) => {
    setAlbums(newAlbums);
    DataService.saveAlbums(newAlbums);
  };

  const handleToggleFavorite = (videoId: string) => {
    const updated = DataService.toggleFavorite(videoId);
    setFavorites(updated);
  };

  // Tab Navigation: All public library tabs are unrestricted. Only 'admin' requires the secret code!
  const handleNavigateTab = (tab: ActiveTab) => {
    if (tab === 'admin' && !isAdminUnlocked) {
      setIsAdminAuthModalOpen(true);
      return;
    }

    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Watch video: completely open and free for all visitors without asking for any code!
  const handleSelectVideo = (video: VideoItem) => {
    setSelectedVideo(video);
    setActiveTab('watch');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSuccess = () => {
    setIsAdminUnlocked(true);
    setIsAdminAuthModalOpen(false);
    setActiveTab('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogoutAdmin = async () => {
    try {
      await fetch('/api/library-access/logout', { method: 'POST' });
    } catch {}
    setIsAdminUnlocked(false);
    if (activeTab === 'admin') {
      setActiveTab('home');
    }
  };

  const handleSelectArtist = (artist: Artist) => {
    setSelectedArtist(artist);
    setActiveTab('artist-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleArtistByName = (artistName: string) => {
    const found = artists.find(a => a.name === artistName);
    if (found) {
      handleSelectArtist(found);
    } else {
      handleSelectArtist({
        id: `art-${Date.now()}`,
        name: artistName,
        avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
        bio: `فنان مشارك في جلسات ديوان السعادة بصنعاء.`,
        role: 'غناء وعزف عود',
        origin: 'صنعاء، اليمن',
        featured: false,
      });
    }
  };

  const handleSelectCategory = (categoryName: string) => {
    setSelectedCategoryName(categoryName);
    setActiveTab('category-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectLyric = (video: VideoItem) => {
    setSelectedLyricVideo(video);
    setActiveTab('lyric-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSyncComplete = (newVideos: VideoItem[]) => {
    setVideos(DataService.getVideos());
    setSettings(DataService.getSettings());
  };

  useEffect(() => {
    if (searchQuery.trim().length > 1 && activeTab === 'home') {
      setActiveTab('videos');
    }
  }, [searchQuery, activeTab]);

  return (
    <div
      className="min-h-screen bg-[#FFFDF7] text-slate-800 flex flex-col justify-between selection:bg-[#13B8A6]/20 selection:text-teal-900 relative w-full overflow-x-hidden"
      dir="rtl"
    >
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleNavigateTab}
        settings={settings}
        videos={videos}
        onSelectVideo={handleSelectVideo}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isAdminUnlocked={isAdminUnlocked}
        onOpenAdminAuth={() => setIsAdminAuthModalOpen(true)}
        onLogoutAdmin={handleLogoutAdmin}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
      />

      {/* Main Routed View */}
      <main className="flex-1 w-full">
        {activeTab === 'home' && (
          <HomeView
            settings={settings}
            videos={videos}
            artists={artists}
            albums={albums}
            categories={categories}
            favorites={favorites}
            isAdminUnlocked={isAdminUnlocked}
            onSelectVideo={handleSelectVideo}
            onConvertMp3={setMp3ModalVideo}
            onDownloadVideo={setDownloadModalVideo}
            onToggleFavorite={handleToggleFavorite}
            setActiveTab={handleNavigateTab}
            onCategoryClick={handleSelectCategory}
            onArtistClick={handleArtistByName}
            onSelectLyric={handleSelectLyric}
            onOpenTalentModal={() => setIsTalentModalOpen(true)}
            onShareVideo={setShareModalVideo}
            onSyncComplete={handleSyncComplete}
          />
        )}

        {activeTab === 'library' && (
          <VideosView
            videos={videos}
            categories={categories}
            favorites={favorites}
            onSelectVideo={handleSelectVideo}
            onConvertMp3={setMp3ModalVideo}
            onDownloadVideo={setDownloadModalVideo}
            onToggleFavorite={handleToggleFavorite}
            onCategoryClick={handleSelectCategory}
            onArtistClick={handleArtistByName}
            onShare={setShareModalVideo}
            onSyncComplete={handleSyncComplete}
          />
        )}

        {activeTab === 'radio' && (
          <RadioSectionView
            settings={settings}
            onPlayTrack={track => {
              window.dispatchEvent(new CustomEvent('dewan:radio-play', { detail: { track } }));
            }}
          />
        )}

        {activeTab === 'videos' && (
          <VideosView
            videos={videos}
            categories={categories}
            favorites={favorites}
            onSelectVideo={handleSelectVideo}
            onConvertMp3={setMp3ModalVideo}
            onDownloadVideo={setDownloadModalVideo}
            onToggleFavorite={handleToggleFavorite}
            onCategoryClick={handleSelectCategory}
            onArtistClick={handleArtistByName}
            onShare={setShareModalVideo}
            onSyncComplete={handleSyncComplete}
          />
        )}

        {activeTab === 'songs' && (
          <VideosView
            videos={videos}
            categories={categories}
            favorites={favorites}
            onSelectVideo={handleSelectVideo}
            onConvertMp3={setMp3ModalVideo}
            onDownloadVideo={setDownloadModalVideo}
            onToggleFavorite={handleToggleFavorite}
            onCategoryClick={handleSelectCategory}
            onArtistClick={handleArtistByName}
            onShare={setShareModalVideo}
            onSyncComplete={handleSyncComplete}
          />
        )}

        {activeTab === 'popular' && (
          <VideosView
            videos={[...videos].sort((a, b) => b.views - a.views)}
            categories={categories}
            favorites={favorites}
            onSelectVideo={handleSelectVideo}
            onConvertMp3={setMp3ModalVideo}
            onDownloadVideo={setDownloadModalVideo}
            onToggleFavorite={handleToggleFavorite}
            onCategoryClick={handleSelectCategory}
            onArtistClick={handleArtistByName}
            onShare={setShareModalVideo}
            onSyncComplete={handleSyncComplete}
          />
        )}

        {activeTab === 'new-releases' && (
          <VideosView
            videos={[...videos].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))}
            categories={categories}
            favorites={favorites}
            onSelectVideo={handleSelectVideo}
            onConvertMp3={setMp3ModalVideo}
            onDownloadVideo={setDownloadModalVideo}
            onToggleFavorite={handleToggleFavorite}
            onCategoryClick={handleSelectCategory}
            onArtistClick={handleArtistByName}
            onShare={setShareModalVideo}
            onSyncComplete={handleSyncComplete}
          />
        )}

        {activeTab === 'artists' && (
          <ArtistsView
            artists={artists}
            videos={videos}
            onSelectArtist={handleSelectArtist}
          />
        )}

        {activeTab === 'artist-detail' && selectedArtist && (
          <ArtistDetailView
            artist={selectedArtist}
            allVideos={videos}
            allAlbums={albums}
            favorites={favorites}
            onSelectVideo={handleSelectVideo}
            onConvertMp3={setMp3ModalVideo}
            onDownloadVideo={setDownloadModalVideo}
            onToggleFavorite={handleToggleFavorite}
            onBack={() => setActiveTab('artists')}
            onSelectLyric={handleSelectLyric}
          />
        )}

        {activeTab === 'albums' && (
          <AlbumsView
            albums={albums}
            videos={videos}
            onSelectVideo={handleSelectVideo}
          />
        )}

        {activeTab === 'lyrics' && (
          <LyricsView
            videos={videos}
            onSelectLyric={handleSelectLyric}
            onWatch={handleSelectVideo}
          />
        )}

        {activeTab === 'lyric-detail' && selectedLyricVideo && (
          <LyricDetailView
            video={selectedLyricVideo}
            allVideos={videos}
            onWatch={handleSelectVideo}
            onBack={() => setActiveTab('lyrics')}
            onSelectLyric={handleSelectLyric}
          />
        )}

        {activeTab === 'categories' && (
          <CategoriesView
            categories={categories}
            videos={videos}
            onSelectCategory={handleSelectCategory}
          />
        )}

        {activeTab === 'category-detail' && selectedCategoryName && (
          <CategoryDetailView
            categoryName={selectedCategoryName}
            categories={categories}
            videos={videos}
            favorites={favorites}
            onSelectVideo={handleSelectVideo}
            onConvertMp3={setMp3ModalVideo}
            onDownloadVideo={setDownloadModalVideo}
            onToggleFavorite={handleToggleFavorite}
            onBack={() => setActiveTab('categories')}
            onArtistClick={handleArtistByName}
          />
        )}

        {activeTab === 'contact' && (
          <ContactView
            settings={settings}
            onOpenTalentModal={() => setIsTalentModalOpen(true)}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            videos={videos}
            onUpdateVideos={handleUpdateVideos}
            categories={categories}
            onUpdateCategories={handleUpdateCategories}
            artists={artists}
            onUpdateArtists={handleUpdateArtists}
            albums={albums}
            onUpdateAlbums={handleUpdateAlbums}
          />
        )}

        {activeTab === 'watch' && selectedVideo && (
          <PlayerView
            video={selectedVideo}
            allVideos={videos}
            onSelectVideo={handleSelectVideo}
            onConvertMp3={setMp3ModalVideo}
            onDownloadVideo={setDownloadModalVideo}
            isFavorite={favorites.includes(selectedVideo.id)}
            onToggleFavorite={handleToggleFavorite}
            onBack={() => setActiveTab('videos')}
            onCategoryClick={handleSelectCategory}
            onArtistClick={handleArtistByName}
            onShare={setShareModalVideo}
          />
        )}
      </main>

      {/* Golden Scroll Controls (Chevrons / Inverted Triangles for smooth scrolling) */}
      <ScrollControls />

      {/* Floating Action Buttons: Channel WhatsApp & Dewan AI Smart Assistant */}
      <div className="fixed right-4 sm:right-5 bottom-5 sm:bottom-6 z-40 print:hidden select-none flex flex-col items-end gap-2.5">
        {/* Dewan Smart AI Assistant Floating Button with Luminous Lighting & Kinetic Effects */}
        <button
          onClick={() => setIsAiAssistantOpen(true)}
          className="group relative flex items-center gap-2 bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white p-2.5 sm:px-4 sm:py-2.5 rounded-full shadow-[0_0_25px_rgba(6,182,212,0.45)] hover:shadow-[0_0_35px_rgba(6,182,212,0.7)] transition-all duration-300 transform hover:scale-105 active:scale-95 border-2 border-cyan-300 cursor-pointer"
          title="مساعد ديوان السعادة الذكي (إجابات فورية 24/7)"
        >
          <div className="relative">
            <Bot className="w-4 h-4 text-cyan-200 group-hover:rotate-12 transition-transform duration-300" />
            <Sparkles className="w-2.5 h-2.5 text-amber-300 absolute -top-1.5 -left-1.5 animate-spin" style={{ animationDuration: '4s' }} />
          </div>
          <span className="hidden sm:inline text-xs font-black font-['Cairo'] tracking-wide">
            مساعد ديوان الذكي
          </span>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
        </button>

        {/* Channel Management WhatsApp (Unobstructed at bottom-right) */}
        <a
          href={`https://wa.me/967733600800?text=${encodeURIComponent('السلام عليكم إدارة ديوان السعادة، أود التواصل مع الأستاذ محمد قائد.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2 sm:gap-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white p-2.5 sm:px-4 sm:py-2.5 rounded-full shadow-xl shadow-emerald-600/30 transition-all duration-300 transform hover:scale-105 active:scale-95 border-2 border-emerald-300"
          title="تواصل مباشر عبر واتساب مع الأستاذ محمد قائد (+967 733 600 800)"
        >
          <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
          <span className="hidden sm:inline text-xs font-bold font-['Cairo']">
            واتساب ديوان السعادة
          </span>
        </a>
      </div>

      {/* Dewan AI Smart Assistant Modal */}
      <DewanAiAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        onOpenRadio={() => window.dispatchEvent(new CustomEvent('dewan:open-radio'))}
        onOpenTalentModal={() => {
          setIsAiAssistantOpen(false);
          setIsTalentModalOpen(true);
        }}
      />

      {/* Secure Admin Access Modal (Prompted ONLY when accessing Admin Dashboard) */}
      <LibraryAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Creative Talent & Artist Support Modal */}
      <TalentSupportModal
        isOpen={isTalentModalOpen}
        onClose={() => setIsTalentModalOpen(false)}
      />

      {/* Social Media Sharing Modal */}
      <ShareModal
        video={shareModalVideo}
        onClose={() => setShareModalVideo(null)}
      />

      {/* Audio Conversion Modal */}
      <Mp3ConverterModal
        video={mp3ModalVideo}
        onClose={() => setMp3ModalVideo(null)}
      />

      {/* Video Download & Rights Modal */}
      <VideoDownloadModal
        video={downloadModalVideo}
        onClose={() => setDownloadModalVideo(null)}
      />

      {/* Radio Player: Floating global player with dockable controls (Right, Left, Bottom) & Facebook royal blue theme */}
      <RadioPlayer tracks={DataService.getRadioTracks()} />

      {/* Global Footer */}
      <Footer settings={settings} setActiveTab={handleNavigateTab} />
    </div>
  );
}
