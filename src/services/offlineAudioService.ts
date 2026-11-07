import { RadioTrack } from '../types';

const CACHE_NAME = 'dewan-radio-offline-v1';

// Local verified audio files that work 100% offline
export const OFFLINE_AUDIO_FALLBACKS = [
  '/audio/oud-rast.mp3',
  '/audio/sanaani-tarab.mp3',
  '/audio/samra-yemenia.mp3',
  '/audio/dan-hadrami.mp3',
  '/audio/oud-bayati.mp3',
  '/audio/lahji-sharh.mp3',
];

class OfflineAudioServiceClass {
  private isOnlineStatus: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private cachedUrls: Set<string> = new Set();
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnlineStatus = true;
        window.dispatchEvent(new CustomEvent('dewan:network-change', { detail: { online: true } }));
      });
      window.addEventListener('offline', () => {
        this.isOnlineStatus = false;
        window.dispatchEvent(new CustomEvent('dewan:network-change', { detail: { online: false } }));
      });
      this.initCache();
    }
  }

  // Initialize and check existing cache
  public async initCache() {
    if (typeof window === 'undefined' || !('caches' in window)) return;
    try {
      const cache = await caches.open(CACHE_NAME);
      const requests = await cache.keys();
      requests.forEach(req => this.cachedUrls.add(req.url));
      this.isInitialized = true;
      // Precache the core offline audio files in background
      this.precacheLocalTracks();
    } catch (e) {
      console.warn('CacheStorage init error:', e);
    }
  }

  // Pre-cache local core files for offline guarantee
  public async precacheLocalTracks() {
    if (typeof window === 'undefined' || !('caches' in window)) return;
    try {
      const cache = await caches.open(CACHE_NAME);
      for (const url of OFFLINE_AUDIO_FALLBACKS) {
        const match = await cache.match(url);
        if (!match) {
          try {
            await cache.add(url);
            this.cachedUrls.add(url);
          } catch (_) {}
        } else {
          this.cachedUrls.add(url);
        }
      }
    } catch (e) {
      console.warn('Pre-cache audio error:', e);
    }
  }

  // Check if currently online
  public isOnline(): boolean {
    if (typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return this.isOnlineStatus;
  }

  // Cache a track's audio for offline use
  public async cacheTrack(track: RadioTrack): Promise<boolean> {
    if (typeof window === 'undefined' || !('caches' in window)) return false;
    try {
      const cache = await caches.open(CACHE_NAME);
      const url = track.audioUrl;
      const res = await fetch(url);
      if (res.ok) {
        await cache.put(url, res.clone());
        this.cachedUrls.add(url);
        window.dispatchEvent(new CustomEvent('dewan:track-cached', { detail: { trackId: track.id } }));
        return true;
      }
    } catch (e) {
      console.warn('Failed to cache track:', track.title, e);
    }
    return false;
  }

  // Get playable URL (handles offline mode)
  public async getPlayableUrl(track: RadioTrack, index = 0): Promise<string> {
    if (typeof window === 'undefined') return track.audioUrl;

    // If online, return normal audioUrl and pre-cache it in background
    if (this.isOnline()) {
      // Trigger background caching for offline future use
      this.cacheTrack(track).catch(() => {});
      return track.audioUrl;
    }

    // If offline, check if cached in CacheStorage
    if ('caches' in window) {
      try {
        const cache = await caches.open(CACHE_NAME);
        const match = await cache.match(track.audioUrl);
        if (match) {
          const blob = await match.blob();
          return URL.createObjectURL(blob);
        }
      } catch (e) {
        console.warn('Error reading from cache:', e);
      }
    }

    // Fallback to local verified MP3 files that are cached and packaged
    const fallbackIdx = index % OFFLINE_AUDIO_FALLBACKS.length;
    return OFFLINE_AUDIO_FALLBACKS[fallbackIdx];
  }

  // Check if track is cached
  public isCached(track: RadioTrack): boolean {
    if (typeof window === 'undefined') return false;
    return (
      this.cachedUrls.has(track.audioUrl) ||
      OFFLINE_AUDIO_FALLBACKS.includes(track.audioUrl)
    );
  }
}

export const OfflineAudioService = new OfflineAudioServiceClass();
