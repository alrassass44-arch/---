import { Check, Download, Info, Smartphone, X } from 'lucide-react';
import React, { useState } from 'react';
import { usePWAInstall } from './usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'navbar' | 'compact' | 'hero' | 'radio';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installedNotice, setInstalledNotice] = useState(false);

  // If already installed and running standalone, hide the button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setInstalledNotice(true);
      setTimeout(() => setInstalledNotice(false), 5000);
    }
  };

  // Chromium / Android / Desktop Install Flow
  if (isInstallable) {
    if (variant === 'hero') {
      return (
        <button
          onClick={handleInstallClick}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${className}`}
          title="تثبيت تطبيق ديوان السعادة على جهازك"
        >
          <Smartphone className="w-5 h-5" />
          <span>تثبيت تطبيق ديوان السعادة</span>
        </button>
      );
    }

    if (variant === 'radio') {
      return (
        <button
          onClick={handleInstallClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 text-amber-300 text-xs font-bold transition-all cursor-pointer ${className}`}
          title="تثبيت التطبيق للاستماع في الخلفية"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">تثبيت التطبيق</span>
        </button>
      );
    }

    return (
      <button
        onClick={handleInstallClick}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-all cursor-pointer ${className}`}
        title="تثبيت تطبيق ديوان السعادة على جهازك للوصول السريع"
      >
        <Download className="w-4 h-4 text-slate-950" />
        <span>تثبيت التطبيق</span>
      </button>
    );
  }

  // iOS Safari Flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-amber-300/30 text-amber-300 text-xs font-bold transition-all cursor-pointer ${className}`}
          title="إضافة تطبيق ديوان السعادة للشاشة الرئيسية"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
          <span>تثبيت على آيفون</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-amber-300/40 rounded-3xl max-w-sm w-full p-6 text-right relative shadow-2xl text-white">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 left-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-amber-300 font-['Cairo']">تثبيت على آيفون / آيباد</h3>
                  <p className="text-xs text-slate-400">للاستماع دون انقطاع وفي شاشة القفل</p>
                </div>
              </div>
              <ol className="space-y-3 text-xs text-slate-300 leading-relaxed pr-2 list-decimal list-inside">
                <li>
                  اضغط على زر <strong className="text-amber-300">مشاركة (Share)</strong> في شريط متصفح سفاري السفلي.
                </li>
                <li>
                  مرر للأسفل واضغط على <strong className="text-amber-300">إضافة إلى الشاشة الرئيسية (Add to Home Screen)</strong>.
                </li>
                <li>
                  اضغط على <strong className="text-amber-300">إضافة (Add)</strong> في الزاوية العلوية.
                </li>
              </ol>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
              >
                تم، فهمت الخطوات
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
