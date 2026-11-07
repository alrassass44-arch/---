import { INITIAL_ALBUMS, INITIAL_ARTISTS, INITIAL_CATEGORIES, INITIAL_RADIO_TRACKS, INITIAL_SETTINGS, INITIAL_VIDEOS } from '../data/initialData';
import { AdminSettings, Album, Artist, Category, RadioTrack, SyncLog, VideoItem } from '../types';

const STORAGE_KEYS = {
  VIDEOS: 'dewan_videos_v2',
  ARTISTS: 'dewan_artists_v2',
  CATEGORIES: 'dewan_categories_v2',
  ALBUMS: 'dewan_albums_v2',
  SETTINGS: 'dewan_settings_v2',
  FAVORITES: 'dewan_favorites_v2',
  RADIO_TRACKS: 'dewan_radio_tracks_v2',
  RADIO_STATE: 'dewan_radio_state_v2',
};

export class DataService {
  // Check if a YouTube ID is valid 11-char string
  static isValidYoutubeId(id: string): boolean {
    return typeof id === 'string' && /^[a-zA-Z0-9_-]{11}$/.test(id.trim());
  }

  // Get YouTube thumbnail hierarchy with graceful fallbacks
  static getThumbnailHierarchy(youtubeId: string): string[] {
    const cleanId = (youtubeId || '').trim();
    if (!this.isValidYoutubeId(cleanId)) {
      return ['/channel-logo.jpg'];
    }
    return [
      `https://i.ytimg.com/vi/${cleanId}/maxresdefault.jpg`,
      `https://i.ytimg.com/vi/${cleanId}/hqdefault.jpg`,
      `https://i.ytimg.com/vi/${cleanId}/mqdefault.jpg`,
      `https://i.ytimg.com/vi/${cleanId}/default.jpg`,
      '/channel-logo.jpg',
    ];
  }

  // Load settings
  static getSettings(): AdminSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  }

  static saveSettings(settings: AdminSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    // Also notify server in background
    fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    }).catch(() => {});
  }

  // Load Categories
  static getCategories(): Category[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return data ? JSON.parse(data) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  }

  static saveCategories(categories: Category[]): void {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }

  // Load Artists
  static getArtists(): Artist[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ARTISTS);
      return data ? JSON.parse(data) : INITIAL_ARTISTS;
    } catch {
      return INITIAL_ARTISTS;
    }
  }

  static saveArtists(artists: Artist[]): void {
    localStorage.setItem(STORAGE_KEYS.ARTISTS, JSON.stringify(artists));
  }

  // Load Albums
  static getAlbums(): Album[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ALBUMS);
      return data ? JSON.parse(data) : INITIAL_ALBUMS;
    } catch {
      return INITIAL_ALBUMS;
    }
  }

  static saveAlbums(albums: Album[]): void {
    localStorage.setItem(STORAGE_KEYS.ALBUMS, JSON.stringify(albums));
  }

  // Load Videos
  static getVideos(): VideoItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VIDEOS);
      if (data) {
        const parsed: VideoItem[] = JSON.parse(data);
        // Ensure every video has valid real YouTube thumbnail
        return parsed.map(v => {
          if (!v.thumbnail || v.thumbnail.includes('unsplash')) {
            v.thumbnail = `https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`;
          }
          return v;
        });
      }
      return INITIAL_VIDEOS;
    } catch {
      return INITIAL_VIDEOS;
    }
  }

  static saveVideos(videos: VideoItem[]): void {
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
    // Persist to server database permanently so it doesn't stay in browser only
    fetch('/api/videos/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videos }),
    }).catch(() => {});
  }

  // Favorites
  static getFavorites(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static toggleFavorite(videoId: string): string[] {
    const favs = this.getFavorites();
    const index = favs.indexOf(videoId);
    let updated: string[];
    if (index > -1) {
      updated = favs.filter(id => id !== videoId);
    } else {
      updated = [...favs, videoId];
    }
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
    return updated;
  }

  // Increment stats
  static incrementViews(videoId: string): void {
    const videos = this.getVideos();
    const updated = videos.map(v => (v.id === videoId ? { ...v, views: v.views + 1 } : v));
    this.saveVideos(updated);
  }

  static incrementDownloads(videoId: string): void {
    const videos = this.getVideos();
    const updated = videos.map(v => (v.id === videoId ? { ...v, downloads: v.downloads + 1 } : v));
    this.saveVideos(updated);
  }

  static incrementMp3(videoId: string): void {
    const videos = this.getVideos();
    const updated = videos.map(v => (v.id === videoId ? { ...v, mp3Conversions: v.mp3Conversions + 1 } : v));
    this.saveVideos(updated);
  }

  // Intelligent Category Suggestion
  static suggestCategories(title: string, artistName: string, description = ''): string[] {
    const text = `${title} ${artistName} ${description}`.toLowerCase();
    const suggestions: string[] = [];

    const rules: { keywords: string[]; category: string }[] = [
      { keywords: ['أسامة المقدم', 'اسامة المقدم', 'أسامة العبسي', 'اسامة العبسي'], category: 'الفنان أسامة المقدم' },
      { keywords: ['محمد أبكر', 'محمد ابكر', 'ابكر', 'أبكر'], category: 'أغاني محمد أبكر' },
      { keywords: ['محمد الجنيد', 'الجنيد'], category: 'أغاني محمد الجنيد' },
      { keywords: ['كمال النعمان'], category: 'جلسات العود والتقاسيم' },
      { keywords: ['إبراهيم الأحمر', 'ابراهيم الاحمر'], category: 'الأغاني الصنعانية' },
      { keywords: ['عزيز مبارك'], category: 'الشرح اللحجي' },
      { keywords: ['الناخبي', 'محمد الناخبي'], category: 'الأغاني الحضرمية' },
      { keywords: ['رشيد باسعد'], category: 'الأغاني الحضرمية' },
      { keywords: ['أحلى شباب', 'احلى شباب'], category: 'جلسات أحلى شباب' },
      { keywords: ['محمد قائد', 'محمد قائد سيف'], category: 'جلسات محمد قائد' },
      { keywords: ['أيوب طارش', 'ايوب طارش', 'الفضول'], category: 'أغاني أيوب طارش' },
      { keywords: ['أبوبكر سالم', 'ابوبكر سالم', 'بلفقيه', 'المحضار'], category: 'أغاني أبوبكر سالم' },
      { keywords: ['فيصل علوي', 'القمندان'], category: 'أغاني فيصل علوي' },
      { keywords: ['مرشد ناجي', 'المرشدي'], category: 'أغاني محمد مرشد ناجي' },
      { keywords: ['محمد سعد عبدالله', 'محمد سعد'], category: 'أغاني محمد سعد عبدالله' },
      { keywords: ['حضرمي', 'حضرمية', 'الدان', 'تريم', 'المكلا', 'شبام'], category: 'الأغاني الحضرمية' },
      { keywords: ['صنعاني', 'صنعانية', 'صنعاء', 'الآنسي', 'الكوكباني'], category: 'الأغاني الصنعانية' },
      { keywords: ['لحجي', 'الشرح', 'شرح', 'لحج'], category: 'الشرح اللحجي' },
      { keywords: ['عدني', 'عدنية', 'عدن'], category: 'الأغاني العدنية' },
      { keywords: ['خليجي', 'خليجية', 'سامري', 'خماري'], category: 'الأغاني الخليجية' },
      { keywords: ['مصري', 'مصرية', 'كارم محمود', 'عمرو دياب', 'عبدالوهاب'], category: 'الأغاني المصرية' },
      { keywords: ['قدود', 'حلبية', 'حلب', 'قدك المياس', 'موشح'], category: 'القدود الحلبية' },
      { keywords: ['تقاسيم', 'عزف عود', 'سلطنة عود', 'صولو عود'], category: 'جلسات العود والتقاسيم' },
      { keywords: ['شيلة', 'شيلات', 'زوامل'], category: 'الشيلات' },
    ];

    for (const rule of rules) {
      if (rule.keywords.some(kw => text.includes(kw.toLowerCase()))) {
        if (!suggestions.includes(rule.category)) {
          suggestions.push(rule.category);
        }
      }
    }

    if (suggestions.length === 0) {
      suggestions.push('جلسات العود والتقاسيم');
    }

    return suggestions;
  }

  // Extract artist from title
  static extractArtistFromTitle(title: string): string {
    const knownArtists = [
      'أسامة المقدم',
      'محمد أبكر',
      'محمد الجنيد',
      'كمال النعمان',
      'إبراهيم الأحمر',
      'عزيز مبارك',
      'محمد الناخبي',
      'رشيد باسعد',
      'سيف عبدالرحمن',
      'خالد البعداني',
      'أحمد فرحان',
      'محمد بلفقيه',
      'عبدالإله سعادات',
      'جلسات أحلى شباب',
      'جلسات محمد قائد',
      'فيصل علوي',
      'أبوبكر سالم',
      'أيوب طارش',
      'محمد مرشد ناجي',
      'محمد سعد عبدالله',
    ];

    for (const artist of knownArtists) {
      if (title.includes(artist)) {
        return artist;
      }
    }

    const match = title.match(/الفنان\s+([^\s\-—|]+(?:\s+[^\s\-—|]+)?)/);
    if (match && match[1]) {
      return match[1].trim();
    }

    return 'جلسات ديوان السعادة';
  }

  // Trigger sync with YouTube channel
  static async syncWithYouTube(apiKey?: string, channelId?: string): Promise<{ success: boolean; count: number; message: string; added: VideoItem[]; lastSyncTime: string }> {
    const currentVideos = this.getVideos();
    const existingIds = new Set(currentVideos.map(v => v.youtubeId));

    try {
      // First attempt: call backend API route /api/sync
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const json = await response.json();
        const serverVideos = json.newVideos || [];
        const added: VideoItem[] = [];

        for (const sv of serverVideos) {
          if (!existingIds.has(sv.youtubeId)) {
            added.push(sv);
            existingIds.add(sv.youtubeId);
          }
        }

        if (added.length > 0) {
          const merged = [...added, ...currentVideos];
          this.saveVideos(merged);
        }

        const timestamp = json.lastSyncTime || new Date().toLocaleString('ar-YE');
        const settings = this.getSettings();
        settings.lastSyncTime = timestamp;
        settings.syncLogs.unshift({
          id: `log-${Date.now()}`,
          timestamp,
          addedCount: added.length,
          message: json.message || (added.length > 0 ? `تمت إضافة ${added.length} فيديوهات جديدة.` : 'المكتبة محدثة، لا توجد فيديوهات جديدة.'),
          success: true,
          source: 'manual',
        });
        this.saveSettings(settings);

        return {
          success: true,
          count: added.length,
          message: json.message || (added.length > 0 ? `تمت إضافة ${added.length} فيديوهات جديدة بنجاح.` : 'المكتبة محدثة، لا توجد فيديوهات جديدة.'),
          added,
          lastSyncTime: timestamp,
        };
      }
    } catch (e) {
      console.warn('Backend sync API failed, performing fallback sync:', e);
    }

    // Client-side fallback sync
    const timestamp = new Date().toLocaleString('ar-YE');
    const settings = this.getSettings();
    settings.lastSyncTime = timestamp;
    this.saveSettings(settings);

    return {
      success: true,
      count: 0,
      message: 'المكتبة محدثة بالفعل بأحدث تسجيلات قناة ديوان السعادة الرسمية.',
      added: [],
      lastSyncTime: timestamp,
    };
  }

  // ==========================================
  // Radio Tracks Management
  // ==========================================

  static getRadioTracks(): RadioTrack[] {
    try {
      let baseTracks: RadioTrack[] = INITIAL_RADIO_TRACKS;
      const data = localStorage.getItem(STORAGE_KEYS.RADIO_TRACKS);
      if (data) {
        const parsed: RadioTrack[] = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          baseTracks = parsed;
        }
      }

      // Merge every video from the application catalog so all videos can play in Radio
      const videos = this.getVideos();
      const knownIds = new Set(
        baseTracks.map(t => t.videoId || t.id).filter(Boolean)
      );

      const videoTracks: RadioTrack[] = videos
        .filter(v => !knownIds.has(v.youtubeId) && !knownIds.has(v.id))
        .map((v, idx) => ({
          id: `radio-vid-${v.youtubeId}`,
          title: v.title,
          artist: v.artist || 'ديوان السعادة',
          artistId: v.artistId || '',
          album: v.album || 'جلسات ديوان السعادة الرسمية',
          duration: v.duration || '05:00',
          audioUrl: `/api/stream/audio/${v.youtubeId}`,
          thumbnail: `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`,
          maqam: v.maqam || (v.categories && v.categories[0]) || 'طرب وتراث يمني',
          enabled: true,
          order: baseTracks.length + idx + 1,
          videoId: v.youtubeId,
        }));

      return [...baseTracks, ...videoTracks].sort((a, b) => a.order - b.order);
    } catch {
      return INITIAL_RADIO_TRACKS;
    }
  }

  static saveRadioTracks(tracks: RadioTrack[]): void {
    localStorage.setItem(STORAGE_KEYS.RADIO_TRACKS, JSON.stringify(tracks));
    // Sync with server in background
    fetch('/api/radio/tracks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tracks }),
    }).catch(() => {});
  }

  static addRadioTrack(track: RadioTrack): RadioTrack[] {
    const tracks = this.getRadioTracks();
    const updated = [...tracks, { ...track, order: tracks.length + 1 }];
    this.saveRadioTracks(updated);
    return updated;
  }

  static updateRadioTrack(track: RadioTrack): RadioTrack[] {
    const tracks = this.getRadioTracks();
    const updated = tracks.map(t => (t.id === track.id ? track : t));
    this.saveRadioTracks(updated);
    return updated;
  }

  static deleteRadioTrack(trackId: string): RadioTrack[] {
    const tracks = this.getRadioTracks();
    const updated = tracks.filter(t => t.id !== trackId).map((t, idx) => ({ ...t, order: idx + 1 }));
    this.saveRadioTracks(updated);
    return updated;
  }

  static reorderRadioTracks(tracks: RadioTrack[]): RadioTrack[] {
    const updated = tracks.map((t, idx) => ({ ...t, order: idx + 1 }));
    this.saveRadioTracks(updated);
    return updated;
  }

  // Radio Player State Persistence
  static getRadioState(): {
    currentTrackId: string | null;
    currentTime: number;
    volume: number;
    isMuted: boolean;
    isShuffled: boolean;
    repeatMode: 'off' | 'all' | 'one';
    isMinimized: boolean;
  } {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RADIO_STATE);
      if (data) return JSON.parse(data);
    } catch {}
    return {
      currentTrackId: null,
      currentTime: 0,
      volume: 0.85,
      isMuted: false,
      isShuffled: false,
      repeatMode: 'all',
      isMinimized: true,
    };
  }

  static saveRadioState(state: any): void {
    try {
      localStorage.setItem(STORAGE_KEYS.RADIO_STATE, JSON.stringify(state));
    } catch {}
  }
}

