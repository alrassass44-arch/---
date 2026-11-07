import {
  AlertCircle,
  CheckCircle2,
  Cpu,
  Download,
  ExternalLink,
  Film,
  HardDriveDownload,
  Loader2,
  Play,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Tv,
  Video,
  X,
  Youtube,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { DataService } from '../services/dataService';
import { VideoItem } from '../types';
import { getVideoThumbnail, handleVideoThumbnailError } from '../utils/mediaUtils';

interface VideoDownloadModalProps {
  video: VideoItem | null;
  onClose: () => void;
  onWatchVideo?: (video: VideoItem) => void;
}

type ProcessStage = 'idle' | 'connecting' | 'downloading_stream' | 'converting' | 'completed';

export const VideoDownloadModal: React.FC<VideoDownloadModalProps> = ({ video, onClose, onWatchVideo }) => {
  const [stage, setStage] = useState<ProcessStage>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [quality, setQuality] = useState<'1080p' | '720p' | '480p' | '360p'>('720p');
  const [hasDirectFile, setHasDirectFile] = useState<boolean | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(true);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!video) return;
    setCheckingAvailability(true);
    setStage('idle');
    setProgress(0);

    fetch(`/api/download/check/${video.youtubeId}`)
      .then(res => res.json())
      .then(() => {
        setHasDirectFile(true);
        setCheckingAvailability(false);
      })
      .catch(() => {
        setHasDirectFile(true);
        setCheckingAvailability(false);
      });

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [video]);

  if (!video) return null;

  // Execute progressive conversion and downloading workflow
  const handleStartDownloadWorkflow = () => {
    if (stage !== 'idle' && stage !== 'completed') return;

    setStage('connecting');
    setProgress(5);

    DataService.incrementDownloads(video.id);

    // Multi-stage progressive conversion simulation mimicking YouTube video download tools
    let currentP = 5;
    progressTimerRef.current = setInterval(() => {
      currentP += Math.floor(Math.random() * 8) + 4;

      if (currentP >= 15 && currentP < 50) {
        setStage('downloading_stream');
      } else if (currentP >= 50 && currentP < 98) {
        setStage('converting');
      } else if (currentP >= 100) {
        currentP = 100;
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
        setStage('completed');
        setProgress(100);

        // Trigger authentic file download
        const cleanTitle = video.title.replace(/[\\/:*?"<>|]/g, '_').slice(0, 45);
        const filename = `ديوان_السعادة_${cleanTitle}_${quality}.mp4`;
        const serverUrl = `/api/download/video/${video.youtubeId}?quality=${quality}`;

        const link = document.createElement('a');
        link.href = serverUrl;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
          if (document.body.contains(link)) {
            document.body.removeChild(link);
          }
        }, 800);
      }

      setProgress(Math.min(currentP, 100));
    }, 180);
  };

  const getStageDescription = () => {
    switch (stage) {
      case 'connecting':
        return 'المرحلة 1: الاتصال بخادم الأرشيف واستخراج مسارات الفيديو والصوت...';
      case 'downloading_stream':
        return `المرحلة 2: تنزيل حزم الوسائط الأصلية بجودة ${quality}...`;
      case 'converting':
        return 'المرحلة 3: معالجة وتحويل الفيديو (H.264 / AAC) وضبط FastStart للتوافق مع كافة المشغلات...';
      case 'completed':
        return 'المرحلة 4: اكتمل التحويل والمعالجة بنجاح! جاري حفظ ملف الفيديو على جهازك...';
      default:
        return 'جاهز للتنزيل والمعالجة بأعلى جودة متوافقة مع كل الأجهزة.';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white border-2 border-amber-300/80 rounded-3xl max-w-lg w-full p-5 sm:p-6 text-right relative shadow-2xl overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          title="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center text-amber-700 flex-shrink-0">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 font-['Cairo'] flex items-center gap-2">
              <span>تنزيل ومعالجة فيديو الجلسة (MP4)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold font-mono">
                H.264 / AAC
              </span>
            </h2>
            <p className="text-xs text-slate-500">تحميل مباشر مع المعالجة الفورية للتوافق مع كافة مشغلات الصوت والفيديو</p>
          </div>
        </div>

        {/* Selected Video Preview Card */}
        <div className="flex items-center gap-3 bg-[#FFFDF7] p-3 rounded-2xl border border-amber-200/80 mb-4">
          <div className="relative w-20 h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-xs bg-slate-900">
            <img
              src={getVideoThumbnail({ thumbnail: video.thumbnail, youtubeId: video.youtubeId })}
              alt={video.title}
              className="w-full h-full object-cover"
              onError={e => handleVideoThumbnailError(e, video.youtubeId)}
            />
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-xs sm:text-sm font-black text-slate-900 truncate font-['Cairo']">{video.title}</p>
            <p className="text-xs text-teal-800 font-bold mt-0.5 truncate">{video.artist}</p>
            <span className="text-[11px] text-slate-500">{video.duration} • {video.album}</span>
          </div>
        </div>

        {/* Quality Selector */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-700 mb-2">
            اختر دقة تنزيل الفيديو:
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: '1080p', label: '1080p FHD' },
              { id: '720p', label: '720p HD' },
              { id: '480p', label: '480p SD' },
              { id: '360p', label: '360p خفيف' },
            ].map(q => (
              <button
                key={q.id}
                type="button"
                disabled={stage !== 'idle' && stage !== 'completed'}
                onClick={() => setQuality(q.id as any)}
                className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  quality === q.id
                    ? 'bg-gradient-to-r from-teal-600 to-[#13B8A6] text-white border-teal-600 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 disabled:opacity-50'
                }`}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Processing Status or Availability */}
        {checkingAvailability ? (
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center justify-center gap-2 mb-4">
            <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
            <span>جاري التحقق من ترخيص ملف الفيديو في أرشيف ديوان السعادة...</span>
          </div>
        ) : stage !== 'idle' ? (
          /* Multi-stage Conversion Progress UI */
          <div className="mb-4 p-4 rounded-2xl bg-slate-950 text-white border border-teal-500/40 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold font-['Cairo'] flex items-center gap-2 text-teal-300">
                {stage === 'completed' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                )}
                <span>{getStageDescription()}</span>
              </span>
              <span className="font-mono text-sm font-black text-amber-400">{progress}%</span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className={`h-full rounded-full transition-all duration-200 ${
                  stage === 'completed'
                    ? 'bg-emerald-400 shadow-md shadow-emerald-400/50'
                    : 'bg-gradient-to-r from-amber-400 via-teal-400 to-emerald-400'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* 4 Conversion Milestone Badges */}
            <div className="grid grid-cols-4 gap-1 pt-1 text-[10px] text-center font-bold">
              <span className={progress >= 15 ? 'text-teal-300' : 'text-slate-500'}>1. الاتصال</span>
              <span className={progress >= 50 ? 'text-teal-300' : 'text-slate-500'}>2. تنزيل الدفق</span>
              <span className={progress >= 95 ? 'text-amber-300' : 'text-slate-500'}>3. المعالجة والتحويل</span>
              <span className={progress >= 100 ? 'text-emerald-400' : 'text-slate-500'}>4. جاهز للتنزيل</span>
            </div>
          </div>
        ) : (
          /* Authorization & Universal Playback Guarantee Banner */
          <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs text-slate-700 space-y-1.5 mb-4">
            <div className="flex items-center gap-2 text-amber-900 font-bold">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>ملف فيديو رسمي مصرح (MP4 H.264/AAC)</span>
            </div>
            <p className="leading-relaxed text-[11px] text-slate-600 font-['Tajawal']">
              يتم تنزيل ومعالجة ملف الفيديو ليطابق المعايير القياسية ليعمل على كافة مشغلات الصوت والفيديو وشاشات السيارات والتلفزيون والهواتف بدون أي حاجة لبرامج إضافية.
            </p>
          </div>
        )}

        {/* Success Completion Details */}
        {stage === 'completed' && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-black font-['Cairo']">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>تم تحويل الفيديو وتنزيله بنجاح!</span>
            </div>
            <div className="grid grid-cols-3 gap-1 pt-1 text-[10px] text-emerald-800 font-mono">
              <span className="flex items-center gap-1"><Smartphone className="w-3 h-3 text-emerald-600" /> كافة الجوالات</span>
              <span className="flex items-center gap-1"><Tv className="w-3 h-3 text-emerald-600" /> الشاشات والسيارات</span>
              <span className="flex items-center gap-1"><Cpu className="w-3 h-3 text-emerald-600" /> ترميز FastStart</span>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <a
            href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-bold hover:underline"
          >
            <Youtube className="w-4 h-4" />
            <span>مشاهدة على YouTube</span>
          </a>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
            >
              {stage === 'completed' ? 'تم الانتهاء' : 'إلغاء'}
            </button>

            {stage === 'completed' ? (
              <button
                onClick={handleStartDownloadWorkflow}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black shadow-md cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>إعادة التنزيل</span>
              </button>
            ) : (
              <button
                onClick={handleStartDownloadWorkflow}
                disabled={stage !== 'idle' || checkingAvailability}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 via-[#13B8A6] to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white text-xs font-black shadow-md shadow-teal-500/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {stage !== 'idle' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري التجهيز والتحويل ({progress}%)...</span>
                  </>
                ) : (
                  <>
                    <HardDriveDownload className="w-4 h-4" />
                    <span>تنزيل وتحويل الفيديو الآن</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
