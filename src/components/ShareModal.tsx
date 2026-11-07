import {
  Bluetooth,
  Check,
  Copy,
  Facebook,
  MessageCircle,
  Radio,
  Send,
  Share2,
  Twitter,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { VideoItem } from '../types';

interface ShareModalProps {
  video: VideoItem | null;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ video, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!video) return null;

  const shareUrl = window.location.origin
    ? `${window.location.origin}?v=${video.youtubeId}`
    : `https://www.youtube.com/watch?v=${video.youtubeId}`;

  const shareTitle = `جلسة: ${video.title} – ديوان السعادة`;
  const shareText = `استمع إلى ${video.title} للفنان ${video.artist} على منصة ديوان السعادة (نغم يجمعنا)`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  const sharePlatforms = [
    {
      name: 'واتساب',
      icon: MessageCircle,
      color: 'bg-emerald-500 hover:bg-emerald-600 text-white',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`,
    },
    {
      name: 'تيليجرام',
      icon: Send,
      color: 'bg-sky-500 hover:bg-sky-600 text-white',
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    },
    {
      name: 'منصة X (تويتر)',
      icon: Twitter,
      color: 'bg-slate-900 hover:bg-slate-800 text-white',
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    },
    {
      name: 'فيسبوك',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700 text-white',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white border border-amber-200 rounded-3xl max-w-md w-full p-6 text-right relative shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-['Cairo']">
              مشاركة الجلسة
            </h2>
            <p className="text-xs text-slate-500">
              انشر الطرب اليمني الأصيل مع أصدقائك ومحبي الفن
            </p>
          </div>
        </div>

        {/* Video Preview */}
        <div className="flex items-center gap-3 bg-[#FFFDF7] p-3 rounded-2xl border border-amber-100 mb-5">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-16 h-12 rounded-xl object-cover flex-shrink-0"
            onError={e => {
              (e.target as HTMLImageElement).src = `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`;
            }}
          />
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-900 truncate font-['Cairo']">
              {video.title}
            </p>
            <p className="text-[11px] text-teal-800 font-bold mt-0.5">
              {video.artist}
            </p>
          </div>
        </div>

        {/* Social Platforms Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {sharePlatforms.map((p, idx) => (
            <a
              key={idx}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl font-bold text-xs transition-all shadow-sm ${p.color}`}
            >
              <p.icon className="w-4 h-4" />
              <span>{p.name}</span>
            </a>
          ))}
        </div>

        {/* Bluetooth & System Nearby Share Button */}
        <button
          onClick={handleNativeShare}
          className="w-full mb-4 py-3 px-4 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 hover:from-teal-100 hover:to-emerald-100 border border-teal-200 text-teal-900 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Bluetooth className="w-4 h-4 text-blue-600" />
          <span>مشاركة عبر البلوتوث / الأجهزة القريبة (System Share)</span>
          <Radio className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
        </button>

        {/* Copy Link Input */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-1.5 pr-3">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="w-full bg-transparent text-xs text-slate-600 outline-none truncate font-mono text-left"
            dir="ltr"
          />
          <button
            onClick={handleCopyLink}
            className="flex-shrink-0 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-950" />
                <span>تم النسخ!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>نسخ</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
