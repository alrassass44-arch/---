import { AlertCircle, KeyRound, Loader2, Lock, ShieldCheck, X } from 'lucide-react';
import React, { useState } from 'react';

interface LibraryAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const LibraryAuthModal: React.FC<LibraryAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/library-access/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCode('');
        setErrorMessage('');
        onSuccess();
      } else {
        // Strict specification: display the exact message from server
        setErrorMessage(data.message || 'الرمز غير صحيح، حاول مرة أخرى.');
        setCode('');
      }
    } catch {
      setErrorMessage('الرمز غير صحيح، حاول مرة أخرى.');
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white border border-amber-200 rounded-3xl max-w-md w-full p-6 sm:p-8 text-right relative shadow-2xl overflow-hidden">
        {/* Decorative corner glows */}
        <div className="absolute -top-16 -left-16 w-36 h-36 bg-amber-100 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-teal-100 rounded-full blur-2xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          title="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Golden Shield Icon */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 border border-amber-300 flex items-center justify-center text-amber-600 shadow-inner mb-3">
            <Lock className="w-8 h-8 text-[#D97706]" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 font-['Cairo']">
            دخول لوحة الإدارة
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
            منطقة التحكم وإدارة المحتوى والربط المباشر بالقناة محمية برمز سري مصرح به
          </p>
        </div>

        {/* Error notification banner */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 mr-1">
              الرمز السري للإدارة
            </label>
            <div className="relative">
              <input
                type="password"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="أدخل الرمز السري..."
                autoFocus
                autoComplete="current-password"
                disabled={loading}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-200/50 outline-none transition-all text-center tracking-widest text-slate-800 font-mono text-base placeholder:text-slate-400 placeholder:tracking-normal placeholder:font-sans"
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-[#E8B957] to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>جاري التحقق من الخادم...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>دخول الإدارة</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>حماية مشفرة ومصادقة سحابية</span>
          <span>ديوان السعادة © 2026</span>
        </div>
      </div>
    </div>
  );
};
