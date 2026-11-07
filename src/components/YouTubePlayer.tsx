import { AlertCircle, CheckCircle2, ExternalLink, Play, RefreshCw, ShieldAlert, Youtube } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { DataService } from '../services/dataService';

interface YouTubePlayerProps {
  videoId: string;
  title: string;
  artist: string;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ videoId, title, artist }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [playerError, setPlayerError] = useState<{ code: number; message: string; isEmbedBlocked: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [useIframeFallback, setUseIframeFallback] = useState(false);

  // Validate 11-char ID
  const cleanId = (videoId || '').trim();
  const isValid = DataService.isValidYoutubeId(cleanId);

  useEffect(() => {
    setPlayerError(null);
    setIsLoading(true);
    setUseIframeFallback(false);

    if (!isValid) {
      setPlayerError({
        code: 2,
        message: 'معرف الفيديو غير صالح أو غير مكتمل (يجب أن يتكون من 11 رمزاً).',
        isEmbedBlocked: false,
      });
      setIsLoading(false);
      return;
    }

    const playerId = `yt-player-${cleanId}-${Date.now()}`;
    let playerInstance: any = null;

    // Function to initialize YouTube API player
    const initPlayer = () => {
      if (!(window as any).YT || !(window as any).YT.Player) {
        // Fallback directly to clean responsive iframe
        setUseIframeFallback(true);
        setIsLoading(false);
        return;
      }

      if (!containerRef.current) return;

      try {
        // Create an inner div for YT.Player
        const playerDiv = document.createElement('div');
        playerDiv.id = playerId;
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(playerDiv);

        playerInstance = new (window as any).YT.Player(playerId, {
          height: '100%',
          width: '100%',
          videoId: cleanId,
          playerVars: {
            autoplay: 1,
            modestbranding: 1,
            rel: 0,
            origin: window.location.origin,
            enablejsapi: 1,
          },
          events: {
            onReady: () => {
              setIsLoading(false);
              setPlayerError(null);
              // Video is ready to play: pause any background radio
              window.dispatchEvent(new CustomEvent('dewan:video-play'));
            },
            onStateChange: (event: any) => {
              // 1 = PLAYING
              if (event.data === 1) {
                window.dispatchEvent(new CustomEvent('dewan:video-play'));
              }
            },
            onError: (event: any) => {
              setIsLoading(false);
              const errCode = Number(event.data);
              let msg = 'حدث خطأ أثناء تشغيل الفيديو.';
              let blocked = false;

              switch (errCode) {
                case 2:
                  msg = 'معرف الفيديو غير صالح أو المعاملات غير مقبولة (الخطأ 2).';
                  break;
                case 5:
                  msg = 'تعذر تشغيل الفيديو بمشغل HTML5 (الخطأ 5).';
                  break;
                case 100:
                  msg = 'هذا الفيديو خاص أو محذوف من القناة (الخطأ 100).';
                  break;
                case 101:
                case 150:
                  msg = 'قيود التضمين: صاحب القناة أو إدارة الحقوق تمنع تشغيل هذا الفيديو داخل مواقع مدمجة (الخطأ 101/150).';
                  blocked = true;
                  break;
                default:
                  msg = `حدث خطأ غير متوقع في المشغل (رمز الخطأ: ${errCode}).`;
                  blocked = true;
                  break;
              }

              setPlayerError({ code: errCode, message: msg, isEmbedBlocked: blocked });
            },
          },
        });

        playerRef.current = playerInstance;
      } catch (err) {
        console.warn('YT.Player init failed, falling back to standard iframe:', err);
        setUseIframeFallback(true);
        setIsLoading(false);
      }
    };

    // Pause video if radio begins playing
    const handleRadioPlay = () => {
      try {
        if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
          playerRef.current.pauseVideo();
        }
      } catch {}
    };
    window.addEventListener('dewan:radio-play', handleRadioPlay);

    // Load YouTube Iframe API if not loaded yet
    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);

      const prevCallback = (window as any).onYouTubeIframeAPIReady;
      (window as any).onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        initPlayer();
      };

      // Fallback timer if script doesn't initialize within 3 seconds
      const timeout = setTimeout(() => {
        if (isLoading) {
          setUseIframeFallback(true);
          setIsLoading(false);
        }
      }, 3000);

      return () => {
        clearTimeout(timeout);
        window.removeEventListener('dewan:radio-play', handleRadioPlay);
        if (playerInstance && playerInstance.destroy) playerInstance.destroy();
      };
    } else {
      initPlayer();
      return () => {
        window.removeEventListener('dewan:radio-play', handleRadioPlay);
        if (playerInstance && playerInstance.destroy) playerInstance.destroy();
      };
    }
  }, [cleanId, isValid]);

  const youtubeWatchUrl = `https://www.youtube.com/watch?v=${cleanId}`;

  return (
    <div className="space-y-3">
      {/* 16:9 Responsive Player Box */}
      <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-slate-900 border-2 border-amber-300/40 shadow-2xl">
        {/* Container for YouTube API */}
        {!useIframeFallback && !playerError && (
          <div ref={containerRef} className="w-full h-full" />
        )}

        {/* Standard Iframe Fallback */}
        {useIframeFallback && !playerError && (
          <iframe
            src={`https://www.youtube.com/embed/${cleanId}?autoplay=1&modestbranding=1&rel=0`}
            title={title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            onLoad={() => setIsLoading(false)}
          />
        )}

        {/* Loading Spinner Overlay */}
        {isLoading && !playerError && (
          <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center gap-3 text-amber-400">
            <RefreshCw className="w-8 h-8 animate-spin text-[#13B8A6]" />
            <span className="text-xs font-semibold text-white">جاري تحميل جلسة ديوان السعادة...</span>
          </div>
        )}

        {/* Friendly Error State Handling */}
        {playerError && (
          <div className="absolute inset-0 bg-slate-950 p-6 flex flex-col items-center justify-center text-center text-white space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div className="space-y-1 max-w-md">
              <h3 className="text-base font-bold text-amber-400 font-['Cairo']">
                {playerError.isEmbedBlocked ? 'تنبيه حقوق التضمين في يوتيوب' : 'تنبيه تشغيل الفيديو'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {playerError.message}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a
                href={youtubeWatchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-all"
              >
                <Youtube className="w-4 h-4 fill-current" />
                <span>مشاهدة الجلسة على YouTube في نافذة جديدة</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => {
                  setPlayerError(null);
                  setUseIframeFallback(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium"
              >
                إعادة المحاولة
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Direct external watch link bar */}
      <div className="flex items-center justify-between text-xs px-2 text-slate-600">
        <span className="flex items-center gap-1.5 font-medium text-teal-800">
          <CheckCircle2 className="w-4 h-4 text-teal-600" />
          <span>مشغل ديوان السعادة المباشر (16:9 عالي النقاء)</span>
        </span>

        <a
          href={youtubeWatchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-red-600 hover:text-red-700 font-bold hover:underline"
        >
          <Youtube className="w-4 h-4" />
          <span>فتح في تطبيق YouTube</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
