import {
  Bluetooth,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Download,
  FastForward,
  GripHorizontal,
  HardDrive,
  Headphones,
  ListMusic,
  Maximize2,
  Minimize2,
  Move,
  Music,
  Palette,
  Pause,
  Play,
  Radio,
  Repeat,
  Repeat1,
  Rewind,
  RotateCcw,
  Search,
  Shuffle,
  SkipBack,
  SkipForward,
  Sparkles,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { DataService } from '../services/dataService';
import { OfflineAudioService } from '../services/offlineAudioService';
import { getVideoThumbnail, handleVideoThumbnailError } from '../utils/mediaUtils';
import { BluetoothAudioService } from '../services/bluetoothAudioService';
import { BluetoothManagerModal } from './BluetoothManagerModal';

interface RadioPlayerProps {
  tracks: RadioTrack[];
  onTrackChange?: (track: RadioTrack) => void;
}

export const RadioPlayer: React.FC<RadioPlayerProps> = ({ tracks, onTrackChange }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Dragging State
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(() => {
    try {
      const saved = localStorage.getItem('dewan_player_drag_pos');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return null;
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initX: number; initY: number }>({
    startX: 0,
    startY: 0,
    initX: 0,
    initY: 0,
  });

  // Permanent close state
  const [isPermanentlyClosed, setIsPermanentlyClosed] = useState<boolean>(() => {
    return localStorage.getItem('dewan_player_permanently_closed') === 'true';
  });

  // Color theme: 'facebook' (Royal Blue) by default
  const [colorTheme, setColorTheme] = useState<'facebook' | 'talent' | 'gold'>(() => {
    const saved = localStorage.getItem('dewan_player_color') as any;
    if (saved === 'talent' || saved === 'gold') return saved;
    return 'facebook';
  });

  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState<boolean>(false);
  const [isBluetoothModalOpen, setIsBluetoothModalOpen] = useState<boolean>(false);
  const [connectedDeviceName, setConnectedDeviceName] = useState<string | null>(() => {
    return localStorage.getItem('dewan_selected_audio_device_name') || null;
  });

  // Mode: tracks or live stream
  const [playerMode, setPlayerMode] = useState<'tracks' | 'live'>('tracks');

  // Track playback state
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffled, setIsShuffled] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('all');
  const [isContinuousAutoplay, setIsContinuousAutoplay] = useState<boolean>(true); // "بعد التالي بعد التالي"
  const [playlistSearch, setPlaylistSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Online / Offline State
  const [isOnline, setIsOnline] = useState<boolean>(() => OfflineAudioService.isOnline());
  const [isCurrentCached, setIsCurrentCached] = useState<boolean>(false);

  // Live Stream Metadata
  const [liveInfo, setLiveInfo] = useState<{
    title: string;
    artist: string;
    listeners: number;
    streamUrl: string;
  }>({
    title: 'بث ديوان السعادة المباشر 24/7',
    artist: 'كوكبة فناني ديوان السعادة',
    listeners: 164,
    streamUrl: '/api/radio/live-stream',
  });

  const activeTracks = tracks.filter(t => t.enabled);
  const currentTrack = activeTracks[currentTrackIndex] || activeTracks[0] || null;

  // Restore saved state from LocalStorage on mount
  useEffect(() => {
    const saved = DataService.getRadioState();
    if (saved) {
      if (saved.volume !== undefined) setVolume(saved.volume);
      if (saved.isMuted !== undefined) setIsMuted(saved.isMuted);
      if (saved.isShuffled !== undefined) setIsShuffled(saved.isShuffled);
      if (saved.repeatMode !== undefined) setRepeatMode(saved.repeatMode);
      if (saved.isMinimized !== undefined) setIsMinimized(saved.isMinimized);

      if (saved.currentTrackId && activeTracks.length > 0) {
        const foundIdx = activeTracks.findIndex(t => t.id === saved.currentTrackId);
        if (foundIdx > -1) {
          setCurrentTrackIndex(foundIdx);
        }
      }
    }

    // Fetch live status
    fetch('/api/radio/live-status')
      .then(res => res.json())
      .then(data => {
        if (data && data.active) {
          setLiveInfo({
            title: data.title || 'بث ديوان السعادة المباشر 24/7',
            artist: data.artist || 'كوكبة فناني ديوان السعادة',
            listeners: data.listeners || 164,
            streamUrl: data.streamUrl || '/api/radio/live-stream',
          });
        }
      })
      .catch(() => {});
  }, []);

  // Listen to network change & open-radio events
  useEffect(() => {
    const handleNetwork = (e: any) => {
      setIsOnline(e.detail?.online ?? navigator.onLine);
    };
    const handleOpenRadio = () => {
      setIsPermanentlyClosed(false);
      localStorage.setItem('dewan_player_permanently_closed', 'false');
      if (audioRef.current && !isPlaying) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    };

    window.addEventListener('dewan:network-change', handleNetwork);
    window.addEventListener('dewan:open-radio', handleOpenRadio);

    return () => {
      window.removeEventListener('dewan:network-change', handleNetwork);
      window.removeEventListener('dewan:open-radio', handleOpenRadio);
    };
  }, [isPlaying]);

  // Check offline cached status for current track
  useEffect(() => {
    if (currentTrack) {
      setIsCurrentCached(OfflineAudioService.isCached(currentTrack));
    }
  }, [currentTrack]);

  // Listen for Bluetooth connected events
  useEffect(() => {
    const handleBtConnected = (e: any) => {
      if (e.detail?.deviceName) {
        setConnectedDeviceName(e.detail.deviceName);
      }
    };
    window.addEventListener('dewan:bluetooth-connected', handleBtConnected);
    return () => {
      window.removeEventListener('dewan:bluetooth-connected', handleBtConnected);
    };
  }, []);

  // Drag Handlers for freely moving the player
  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button, input, a, select')) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: rect.left,
      initY: rect.top,
    };
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;

    const newX = Math.max(10, Math.min(window.innerWidth - 360, dragStartRef.current.initX + dx));
    const newY = Math.max(10, Math.min(window.innerHeight - 80, dragStartRef.current.initY + dy));

    const pos = { x: newX, y: newY };
    setDragPos(pos);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (_) {}
    if (dragPos) {
      localStorage.setItem('dewan_player_drag_pos', JSON.stringify(dragPos));
    }
  };

  // Permanent Close Action
  const handlePermanentClose = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setIsPermanentlyClosed(true);
    localStorage.setItem('dewan_player_permanently_closed', 'true');
    window.dispatchEvent(new CustomEvent('dewan:radio-closed'));
  };

  const handleReopenPlayer = () => {
    setIsPermanentlyClosed(false);
    localStorage.setItem('dewan_player_permanently_closed', 'false');
  };

  const handleCycleColorTheme = () => {
    const next = colorTheme === 'facebook' ? 'talent' : colorTheme === 'talent' ? 'gold' : 'facebook';
    setColorTheme(next);
    localStorage.setItem('dewan_player_color', next);
  };

  // Dynamic Theme Gradients (Matching Facebook Royal Blue and Talent)
  const getThemeContainerClass = () => {
    if (colorTheme === 'talent') {
      return 'bg-gradient-to-r from-[#064e3b]/98 via-[#0f766e]/98 to-[#022c22]/98 border-2 border-emerald-400/60 shadow-2xl shadow-emerald-950/70';
    }
    if (colorTheme === 'gold') {
      return 'bg-gradient-to-r from-slate-950/98 via-slate-900/98 to-amber-950/98 border border-amber-400/50 shadow-2xl shadow-amber-950/60';
    }
    // 'facebook' default: مطابق لبطاقة فيسبوك الرسمية (الأزرق الملكي)
    return 'bg-gradient-to-br from-[#1877F2]/98 via-[#0D65D9]/98 to-[#0A4EA8]/98 border-2 border-blue-300/80 shadow-2xl shadow-blue-800/60';
  };

  const getPillThemeClass = () => {
    if (colorTheme === 'talent') {
      return 'bg-gradient-to-r from-[#064e3b] via-[#0f766e] to-[#022c22] border-2 border-emerald-400/60 shadow-2xl shadow-emerald-950/70 text-white';
    }
    if (colorTheme === 'gold') {
      return 'bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 border border-amber-400/50 shadow-2xl text-white';
    }
    // Facebook vibrant royal blue:
    return 'bg-gradient-to-r from-[#1877F2] via-[#0D65D9] to-[#0A4EA8] border-2 border-blue-300/80 shadow-2xl shadow-blue-800/60 text-white';
  };

  // Save state on change
  useEffect(() => {
    if (currentTrack) {
      DataService.saveRadioState({
        currentTrackId: currentTrack.id,
        currentTime,
        volume,
        isMuted,
        isShuffled,
        repeatMode,
        isMinimized,
      });
    }
  }, [currentTrack, currentTime, volume, isMuted, isShuffled, repeatMode, isMinimized]);

  // Coordinate with YouTube Video Player
  useEffect(() => {
    const handleVideoPlaying = () => {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    };

    window.addEventListener('dewan:video-play', handleVideoPlaying);
    return () => {
      window.removeEventListener('dewan:video-play', handleVideoPlaying);
    };
  }, []);

  // Sync volume & mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Setup Media Session API
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    try {
      const title = playerMode === 'live' ? liveInfo.title : currentTrack?.title || 'راديو ديوان السعادة';
      const artist = playerMode === 'live' ? liveInfo.artist : currentTrack?.artist || 'ديوان السعادة';
      const thumb = currentTrack?.thumbnail || '/channel-logo.jpg';

      navigator.mediaSession.metadata = new MediaMetadata({
        title,
        artist,
        album: 'راديو ديوان السعادة – نغم يجمعنا',
        artwork: [
          { src: thumb, sizes: '192x192', type: 'image/png' },
          { src: thumb, sizes: '512x512', type: 'image/png' },
        ],
      });

      navigator.mediaSession.setActionHandler('play', () => handlePlay());
      navigator.mediaSession.setActionHandler('pause', () => handlePause());
      navigator.mediaSession.setActionHandler('previoustrack', () => handlePrev());
      navigator.mediaSession.setActionHandler('nexttrack', () => handleNext());
      navigator.mediaSession.setActionHandler('seekforward', () => handleSkip(10));
      navigator.mediaSession.setActionHandler('seekbackward', () => handleSkip(-10));
    } catch (e) {
      console.warn('MediaSession setup warning:', e);
    }
  }, [currentTrack, playerMode, liveInfo]);

  // Handle Play/Pause
  const handlePlay = async () => {
    if (!audioRef.current) return;
    window.dispatchEvent(new CustomEvent('dewan:radio-play', { detail: { track: currentTrack } }));

    // Support offline audio resolving
    if (playerMode === 'tracks' && currentTrack) {
      const playable = await OfflineAudioService.getPlayableUrl(currentTrack, currentTrackIndex);
      if (audioRef.current.src !== playable && !audioRef.current.src.endsWith(playable)) {
        audioRef.current.src = playable;
      }
    }

    audioRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch(err => {
        console.warn('Playback error / autoplay restricted:', err);
      });
  };

  const handlePause = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  // Toggle Mode
  const handleToggleMode = (mode: 'tracks' | 'live') => {
    if (mode === playerMode) return;
    const wasPlaying = isPlaying;
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setPlayerMode(mode);
    setIsPlaying(false);

    setTimeout(async () => {
      if (audioRef.current) {
        if (mode === 'live') {
          audioRef.current.src = liveInfo.streamUrl;
        } else if (currentTrack) {
          audioRef.current.src = await OfflineAudioService.getPlayableUrl(currentTrack, currentTrackIndex);
        }
        audioRef.current.load();
        if (wasPlaying) {
          audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      }
    }, 50);
  };

  // Skip 10 seconds
  const handleSkip = (seconds: number) => {
    if (!audioRef.current || playerMode === 'live') return;
    const newTime = Math.max(0, Math.min(audioRef.current.duration || 0, audioRef.current.currentTime + seconds));
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Next Track: Continuous autoplay ("بعد التالي بعد التالي")
  const handleNext = async () => {
    if (playerMode === 'live' || activeTracks.length === 0) return;
    let nextIdx = 0;
    if (isShuffled) {
      nextIdx = Math.floor(Math.random() * activeTracks.length);
      if (nextIdx === currentTrackIndex && activeTracks.length > 1) {
        nextIdx = (nextIdx + 1) % activeTracks.length;
      }
    } else {
      nextIdx = (currentTrackIndex + 1) % activeTracks.length;
    }

    setCurrentTrackIndex(nextIdx);
    const nextTrack = activeTracks[nextIdx];
    if (onTrackChange && nextTrack) onTrackChange(nextTrack);

    if (audioRef.current && nextTrack) {
      const playable = await OfflineAudioService.getPlayableUrl(nextTrack, nextIdx);
      audioRef.current.src = playable;
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }
  };

  // Previous Track
  const handlePrev = async () => {
    if (playerMode === 'live' || activeTracks.length === 0) return;
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    const prevIdx = (currentTrackIndex - 1 + activeTracks.length) % activeTracks.length;
    setCurrentTrackIndex(prevIdx);
    const prevTrack = activeTracks[prevIdx];
    if (onTrackChange && prevTrack) onTrackChange(prevTrack);

    if (audioRef.current && prevTrack) {
      const playable = await OfflineAudioService.getPlayableUrl(prevTrack, prevIdx);
      audioRef.current.src = playable;
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }
  };

  // Track Ended Handler: Core requirement ("بعد التالي بعد التالي")
  const handleTrackEnded = () => {
    if (playerMode === 'live') return;

    if (repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    } else if (isContinuousAutoplay || repeatMode === 'all' || isShuffled) {
      // Automatically moves to next track without stopping
      handleNext();
    } else {
      if (currentTrackIndex < activeTracks.length - 1) {
        handleNext();
      } else {
        setIsPlaying(false);
      }
    }
  };

  const handleSelectTrack = async (track: RadioTrack) => {
    const idx = activeTracks.findIndex(t => t.id === track.id);
    if (idx > -1) {
      if (playerMode === 'live') {
        setPlayerMode('tracks');
      }
      setCurrentTrackIndex(idx);
      if (onTrackChange) onTrackChange(track);
      setIsPlaylistOpen(false);

      if (audioRef.current) {
        const playable = await OfflineAudioService.getPlayableUrl(track, idx);
        audioRef.current.src = playable;
        audioRef.current.currentTime = 0;
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {});
      }
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (playerMode === 'live') return;
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  if (!currentTrack) return null;

  // When Permanently Closed: Render a discrete subtle restore badge on the left side
  if (isPermanentlyClosed) {
    return (
      <div
        className="fixed bottom-5 left-4 z-40 print:hidden select-none"
        dir="rtl"
      >
        <button
          onClick={handleReopenPlayer}
          className="group flex items-center gap-2 px-3.5 py-2 rounded-full bg-gradient-to-r from-[#1877F2] to-[#0A4EA8] text-white border border-blue-300 shadow-xl shadow-blue-900/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="إعادة فتح مشغل راديو ديوان السعادة"
        >
          <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
            <Radio className="w-3 h-3 animate-pulse" />
          </div>
          <span className="text-xs font-black font-['Cairo']">
            راديو ديوان
          </span>
        </button>
      </div>
    );
  }

  const filteredPlaylist = activeTracks.filter(
    t =>
      t.title.toLowerCase().includes(playlistSearch.toLowerCase()) ||
      t.artist.toLowerCase().includes(playlistSearch.toLowerCase()) ||
      (t.maqam && t.maqam.toLowerCase().includes(playlistSearch.toLowerCase()))
  );

  // Position Styling: Placed on the bottom-LEFT by default (so it NEVER overlaps with WhatsApp at bottom-right!)
  const positionStyle: React.CSSProperties = dragPos
    ? {
        position: 'fixed',
        left: `${dragPos.x}px`,
        top: `${dragPos.y}px`,
        transform: 'none',
        zIndex: 45,
      }
    : {
        position: 'fixed',
        bottom: '20px',
        left: '16px', // Guaranteed separation from WhatsApp button on the right!
        zIndex: 45,
      };

  return (
    <>
      {/* Hidden Native Audio Element */}
      <audio
        ref={audioRef}
        src={playerMode === 'live' ? liveInfo.streamUrl : currentTrack.audioUrl}
        preload="metadata"
        onTimeUpdate={() => {
          if (audioRef.current && playerMode !== 'live') {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current && playerMode !== 'live') {
            setDuration(audioRef.current.duration || 0);
          }
        }}
        onWaiting={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onEnded={handleTrackEnded}
      />

      {/* Draggable & Movable Floating Container */}
      <aside
        ref={containerRef}
        style={positionStyle}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`print:hidden select-none pointer-events-auto transition-shadow ${
          isDragging ? 'cursor-grabbing opacity-90 scale-[1.02]' : ''
        }`}
        dir="rtl"
      >
        {isMinimized ? (
          /* Minimized Sleek Pill Card (Draggable, Facebook Royal Blue) */
          <div
            className={`backdrop-blur-xl rounded-full py-2 px-3 sm:px-4 shadow-2xl flex items-center justify-between gap-3 text-white max-w-[94vw] sm:max-w-[420px] ${getPillThemeClass()}`}
          >
            {/* Drag Handle Grip Icon */}
            <div
              className="p-1 text-blue-200/80 hover:text-white cursor-grab flex-shrink-0"
              title="اسحب لنقل المشغل لأي مكان في الشاشة"
            >
              <GripHorizontal className="w-4 h-4" />
            </div>

            {/* Artwork & Info */}
            <div
              className="flex items-center gap-2.5 overflow-hidden cursor-pointer flex-1"
              onClick={() => setIsMinimized(false)}
              title="انقر لتكبير مشغل الراديو"
            >
              <div className="relative w-9 h-9 rounded-full overflow-hidden border border-amber-300/80 flex-shrink-0 bg-slate-800 shadow-md">
                <img
                  src={getVideoThumbnail({ thumbnail: currentTrack.thumbnail, youtubeId: currentTrack.videoId })}
                  alt={currentTrack.title}
                  className={`w-full h-full object-cover ${isPlaying ? 'animate-spin' : ''}`}
                  style={{ animationDuration: '8s' }}
                  onError={e => handleVideoThumbnailError(e, currentTrack.videoId)}
                />
              </div>

              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-amber-300 font-bold font-mono">
                    {playerMode === 'live' ? '🔴 بث مباشر 24/7' : 'راديو ديوان السعادة'}
                  </span>
                  {!isOnline && (
                    <span className="text-[9px] px-1 rounded bg-amber-500/30 text-amber-200 font-mono">
                      Offline
                    </span>
                  )}
                </div>
                <p className="text-xs font-bold text-white truncate font-['Cairo']">
                  {playerMode === 'live' ? liveInfo.title : currentTrack.title}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={handlePrev}
                className="p-1 text-blue-100 hover:text-white transition cursor-pointer"
                title="السابق"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleTogglePlay}
                className="w-8 h-8 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center shadow-md shadow-amber-400/40 transition-transform active:scale-95 cursor-pointer font-bold"
                title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
              >
                {isPlaying ? (
                  <Pause className="w-3.5 h-3.5 fill-slate-950" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-slate-950 mr-0.5" />
                )}
              </button>

              <button
                onClick={handleNext}
                className="p-1 text-blue-100 hover:text-white transition cursor-pointer"
                title="التالي (بعد التالي بعد التالي)"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsMinimized(false)}
                className="p-1 text-blue-200 hover:text-white transition cursor-pointer"
                title="تكبير المشغل"
              >
                <ChevronUp className="w-4 h-4" />
              </button>

              {/* Permanent Close Button */}
              <button
                onClick={handlePermanentClose}
                className="p-1 text-blue-200 hover:text-rose-300 transition cursor-pointer"
                title="إغلاق المشغل نهائياً"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Expanded Floating Widget (Draggable, Facebook Royal Blue) */
          <div
            className={`backdrop-blur-2xl text-white shadow-2xl p-4 rounded-3xl w-[94vw] sm:w-[410px] transition-colors ${getThemeContainerClass()}`}
          >
            {/* Header: Drag Grip + Title + Dock / Bluetooth / Minimize / Permanent Close */}
            <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-white/15">
              <div className="flex items-center gap-2 overflow-hidden cursor-grab" title="اسحب لنقل المشغل">
                <GripHorizontal className="w-4 h-4 text-blue-200" />
                <div className="overflow-hidden">
                  <span className="text-xs font-black text-white font-['Cairo'] flex items-center gap-1.5 truncate">
                    <span>مشغل راديو ديوان السعادة</span>
                    {!isOnline && (
                      <span className="px-1.5 py-0.2 rounded-md bg-amber-500 text-[9px] text-slate-950 font-black">
                        بدون إنترنت
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {/* Autoplay Next Continuous Indicator */}
                <button
                  onClick={() => setIsContinuousAutoplay(!isContinuousAutoplay)}
                  className={`px-1.5 py-1 rounded-lg text-[10px] font-bold border transition flex items-center gap-1 ${
                    isContinuousAutoplay
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-xs'
                      : 'bg-white/10 text-white/70 border-white/20'
                  }`}
                  title="ميزة التشغيل المتواصل للأغاني التالية تلقائياً (بعد التالي بعد التالي)"
                >
                  <Sparkles className="w-3 h-3" />
                  <span className="hidden sm:inline">تشغيل متواصل</span>
                </button>

                {/* Bluetooth */}
                <button
                  onClick={() => setIsBluetoothModalOpen(true)}
                  className={`p-1.5 rounded-lg border transition cursor-pointer ${
                    connectedDeviceName
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                      : 'bg-white/10 border-white/20 text-white/80 hover:text-white'
                  }`}
                  title={connectedDeviceName ? `متصل: ${connectedDeviceName}` : 'ربط البلوتوث'}
                >
                  <Bluetooth className="w-3.5 h-3.5" />
                </button>

                {/* Palette */}
                <button
                  onClick={handleCycleColorTheme}
                  className="p-1.5 rounded-lg bg-white/10 border border-white/20 text-white/80 hover:text-white transition cursor-pointer"
                  title="تغيير لون المشغل"
                >
                  <Palette className="w-3.5 h-3.5" />
                </button>

                {/* Minimize */}
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-1 text-white/80 hover:text-white transition cursor-pointer"
                  title="تصغير"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>

                {/* Permanent Close */}
                <button
                  onClick={handlePermanentClose}
                  className="p-1 text-white/80 hover:text-rose-300 transition cursor-pointer"
                  title="إغلاق المشغل نهائياً"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-2 gap-1.5 mb-3 p-1 bg-black/25 rounded-xl border border-white/15">
              <button
                onClick={() => handleToggleMode('tracks')}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
                  playerMode === 'tracks'
                    ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <Music className="w-3 h-3" />
                <span>الوضع 1: الأغاني ({activeTracks.length})</span>
              </button>

              <button
                onClick={() => handleToggleMode('live')}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
                  playerMode === 'live'
                    ? 'bg-red-600 text-white font-black shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-400 animate-ping inline-block" />
                <span>الوضع 2: البث المباشر</span>
              </button>
            </div>

            {/* Current Track Info */}
            <div className="flex items-center gap-3 mb-3">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-amber-300/80 flex-shrink-0 shadow-lg bg-slate-900">
                <img
                  src={getVideoThumbnail({
                    thumbnail: playerMode === 'live' ? '/channel-logo.jpg' : currentTrack.thumbnail,
                    youtubeId: currentTrack.videoId,
                  })}
                  alt="صورة الراديو"
                  className={`w-full h-full object-cover ${isPlaying ? 'animate-spin' : ''}`}
                  style={{ animationDuration: '10s' }}
                  onError={e => handleVideoThumbnailError(e, currentTrack.videoId)}
                />
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center gap-0.5">
                    <span className="w-1 h-3 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1 h-5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
              </div>

              <div className="overflow-hidden flex-1">
                <p className="text-xs sm:text-sm font-black text-white truncate font-['Cairo']">
                  {playerMode === 'live' ? liveInfo.title : currentTrack.title}
                </p>
                <p className="text-[11px] text-blue-100 font-semibold truncate mt-0.5">
                  {playerMode === 'live' ? liveInfo.artist : `${currentTrack.artist} ${currentTrack.maqam ? `• ${currentTrack.maqam}` : ''}`}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {playerMode === 'live' ? (
                    <span className="text-[10px] text-emerald-300 font-mono flex items-center gap-1 font-bold">
                      <Wifi className="w-3 h-3 animate-pulse" />
                      <span>{liveInfo.listeners} مستمع حي</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-blue-200 font-mono">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  )}

                  {/* Offline Cache Indicator */}
                  {isCurrentCached && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/25 border border-emerald-400/50 text-emerald-200 font-bold flex items-center gap-1">
                      <HardDrive className="w-2.5 h-2.5" />
                      <span>محفوظ للأوفلاين</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Progress Slider (Only in Tracks Mode) */}
            {playerMode === 'tracks' ? (
              <div className="mb-3">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-black/30 rounded-full appearance-none cursor-pointer accent-amber-400 hover:h-2 transition-all"
                  style={{
                    background: `linear-gradient(to left, #D8B66A ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.2) 0%)`,
                  }}
                />
              </div>
            ) : (
              <div className="mb-3 flex items-center justify-between text-[10px] bg-red-950/40 border border-red-500/40 px-3 py-1 rounded-xl text-red-200">
                <span className="flex items-center gap-1 font-bold">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                  <span>بث صوتي حي مستمر 24/7</span>
                </span>
                <span className="font-mono text-white/70">320 kbps HD</span>
              </div>
            )}

            {/* Playback Controls Row */}
            <div className="flex items-center justify-between gap-2">
              {/* Left Mini: Repeat / Shuffle */}
              <div className="flex items-center gap-1">
                {playerMode === 'tracks' && (
                  <button
                    onClick={() => {
                      if (repeatMode === 'off') setRepeatMode('all');
                      else if (repeatMode === 'all') setRepeatMode('one');
                      else setRepeatMode('off');
                    }}
                    className={`p-1.5 rounded-lg transition cursor-pointer ${
                      repeatMode !== 'off'
                        ? 'text-amber-300 bg-amber-400/20 border border-amber-300/40'
                        : 'text-white/60 hover:text-white'
                    }`}
                    title={repeatMode === 'all' ? 'تكرار الكل' : repeatMode === 'one' ? 'تكرار المقطع' : 'إيقاف التكرار'}
                  >
                    {repeatMode === 'one' ? <Repeat1 className="w-3.5 h-3.5 text-amber-300" /> : <Repeat className="w-3.5 h-3.5" />}
                  </button>
                )}

                {playerMode === 'tracks' && (
                  <button
                    onClick={() => setIsShuffled(!isShuffled)}
                    className={`p-1.5 rounded-lg transition cursor-pointer ${
                      isShuffled
                        ? 'text-amber-300 bg-amber-400/20 border border-amber-300/40'
                        : 'text-white/60 hover:text-white'
                    }`}
                    title="تشغيل عشوائي"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Core Playback Center */}
              <div className="flex items-center gap-2">
                {playerMode === 'tracks' && (
                  <button
                    onClick={handlePrev}
                    className="p-1.5 text-white/80 hover:text-amber-300 transition cursor-pointer"
                    title="السابق"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={handleTogglePlay}
                  className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer font-black ${
                    playerMode === 'live'
                      ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/40'
                      : 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-amber-400/40'
                  }`}
                  title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current mr-0.5" />
                  )}
                </button>

                {playerMode === 'tracks' && (
                  <button
                    onClick={handleNext}
                    className="p-1.5 text-white/80 hover:text-amber-300 transition cursor-pointer"
                    title="التالي (بعد التالي بعد التالي)"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Right Side: Volume & Playlist */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1.5 text-white/80 hover:text-amber-300 transition cursor-pointer"
                  title={isMuted ? 'إلغاء الكتم' : 'كتم'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-3.5 h-3.5 text-rose-300" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" />
                  )}
                </button>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={e => {
                    setVolume(parseFloat(e.target.value));
                    if (isMuted) setIsMuted(false);
                  }}
                  className="w-14 sm:w-16 h-1 bg-black/30 rounded-full appearance-none cursor-pointer accent-amber-400"
                />

                {playerMode === 'tracks' && (
                  <button
                    onClick={() => setIsPlaylistOpen(true)}
                    className="p-1.5 text-white/80 hover:text-amber-300 transition cursor-pointer"
                    title="قائمة المقاطع"
                  >
                    <ListMusic className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Playlist Drawer Modal */}
      {isPlaylistOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
          dir="rtl"
        >
          <div className="bg-[#101827] border border-amber-400/40 rounded-3xl max-w-md w-full max-h-[80vh] flex flex-col text-right shadow-2xl text-white overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListMusic className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-black font-['Cairo'] text-white">
                  قائمة تسجيلات راديو ديوان السعادة ({activeTracks.length})
                </h3>
              </div>
              <button
                onClick={() => setIsPlaylistOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 border-b border-slate-800">
              <div className="relative">
                <input
                  type="text"
                  placeholder="بحث في تسجيلات الراديو..."
                  value={playlistSearch}
                  onChange={e => setPlaylistSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="overflow-y-auto p-2 space-y-1.5 flex-1">
              {filteredPlaylist.map((t, idx) => {
                const isCur = t.id === currentTrack.id && playerMode === 'tracks';
                const cached = OfflineAudioService.isCached(t);
                return (
                  <div
                    key={t.id}
                    onClick={() => handleSelectTrack(t)}
                    className={`p-2.5 rounded-xl border transition flex items-center justify-between gap-3 cursor-pointer ${
                      isCur
                        ? 'bg-amber-400/15 border-amber-400 text-amber-300'
                        : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <span className="text-[11px] font-mono text-slate-400 w-5 text-center">
                        {idx + 1}
                      </span>
                      <img
                        src={getVideoThumbnail({ thumbnail: t.thumbnail, youtubeId: t.videoId })}
                        alt={t.title}
                        className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                        onError={e => handleVideoThumbnailError(e, t.videoId)}
                      />
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold truncate font-['Cairo']">
                          {t.title}
                        </p>
                        <p className="text-[10px] text-teal-300 truncate">
                          {t.artist} {t.maqam && `• ${t.maqam}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {cached && (
                        <span className="text-[9px] px-1 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                          Offline
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-slate-400">{t.duration}</span>
                      {isCur && isPlaying ? (
                        <Pause className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <Play className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bluetooth Setup Modal */}
      <BluetoothManagerModal
        isOpen={isBluetoothModalOpen}
        onClose={() => setIsBluetoothModalOpen(false)}
        onAudioDeviceSelected={(_devId, devName) => {
          setConnectedDeviceName(devName);
        }}
      />
    </>
  );
};
