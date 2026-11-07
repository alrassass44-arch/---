export interface VideoItem {
  id: string;
  youtubeId: string;
  title: string;
  artist: string;
  artistId: string;
  album: string;
  albumId?: string;
  categories: string[];
  publishedAt: string;
  duration: string;
  views: number;
  downloads: number;
  mp3Conversions: number;
  thumbnail: string;
  featured: boolean;
  lyrics?: string;
  composer?: string;
  lyricist?: string;
  maqam?: string;
  rhythm?: string;
  allowDownload: boolean;
  allowMp3: boolean;
  rightsDeclared: boolean;
  audioToneFrequency?: number;
  audioUrl?: string;
  videoUrl?: string;
  isDirectDownloadAuthorized?: boolean;
}

export interface RadioTrack {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  album?: string;
  duration: string;
  audioUrl: string;
  thumbnail: string;
  maqam?: string;
  enabled: boolean;
  order: number;
  videoId?: string;
}

export interface Artist {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  role: string;
  origin: string;
  featured: boolean;
  songCount?: number;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  description: string;
  count?: number;
}

export interface Album {
  id: string;
  title: string;
  year: number;
  cover: string;
  description: string;
  sessionSupervisor: string;
}

export interface SyncLog {
  id: string;
  timestamp: string;
  addedCount: number;
  message: string;
  success: boolean;
  source: 'manual' | 'scheduled';
}

export interface AdminSettings {
  channelName: string;
  channelHandle: string;
  channelId: string;
  channelDescription: string;
  channelCoverUrl: string;
  channelLogoUrl: string;
  youtubeApiKey: string;
  adminPin: string;
  allowPublicDownloads: boolean;
  allowMp3Conversions: boolean;
  autoSync: boolean;
  lastSyncTime: string;
  scheduledJobStatus: 'active' | 'idle' | 'error';
  syncLogs: SyncLog[];
  liveStreamUrl?: string;
  isLiveStreamActive?: boolean;
}

export type ActiveTab =
  | 'home'
  | 'library'
  | 'videos'
  | 'songs'
  | 'artists'
  | 'artist-detail'
  | 'albums'
  | 'album-detail'
  | 'lyrics'
  | 'lyric-detail'
  | 'categories'
  | 'category-detail'
  | 'popular'
  | 'new-releases'
  | 'radio'
  | 'contact'
  | 'admin'
  | 'watch';
