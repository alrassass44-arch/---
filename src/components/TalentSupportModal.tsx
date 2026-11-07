import { Check, Copy, HeartHandshake, MessageCircle, Phone, Send, Sparkles, User, X } from 'lucide-react';
import React, { useState } from 'react';

interface TalentSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TalentSupportModal: React.FC<TalentSupportModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [talentType, setTalentType] = useState('غناء طربي وعزف عود');
  const [city, setCity] = useState('صنعاء');
  const [phone, setPhone] = useState('');
  const [workLink, setWorkLink] = useState('');
  const [notes, setNotes] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const MANAGER_PHONE = '+967733600800';
  const MANAGER_NAME = 'الأستاذ محمد قائد';

  const buildMessage = () => {
    return `السلام عليكم ورحمة الله وبركاته،
تحية طيبة لإدارة منصة وقناة ديوان السعادة – نغم يجمعنا
عناية: ${MANAGER_NAME} المحترم

طلب انضمام ودعم فني للمواهب:
👤 الاسم / اللقب الفني: ${name || 'لم يحدد'}
🎵 نوع الموهبة: ${talentType}
📍 المحافظة / الإقامة: ${city}
📱 رقم التواصل: ${phone || 'نفس الرقم'}
🔗 رابط نموذج عمل أو تسجيل: ${workLink || 'سيتم إرساله في المحادثة'}

💬 تفاصيل المشاركة والطلب:
${notes || 'أرغب في المشاركة في تسجيلات وجلسات ديوان السعادة ونشر الأعمال الفنية عبر القناة.'}

وشكراً لكم، مع تمنياتي لديوان السعادة بمزيد من التألق والنجاح.`;
  };

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    const text = buildMessage();
    const cleanPhone = '967733600800';
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopy = () => {
    const text = buildMessage();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white border border-amber-200 rounded-3xl max-w-xl w-full p-6 sm:p-8 text-right relative shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Glow corners */}
        <div className="absolute -top-20 -left-20 w-44 h-44 bg-emerald-100 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-amber-100 rounded-full blur-3xl pointer-events-none" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 mb-6 border-b border-slate-100 pb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 mb-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>رعاية المواهب ودعم المبدعين</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-['Cairo']">
              طلب دعم فني ونشر أعمال
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              تواصل مباشر مع إدارة ديوان السعادة – {MANAGER_NAME} ({MANAGER_PHONE})
            </p>
          </div>
        </div>

        {/* Manager Info Pill */}
        <div className="p-3.5 rounded-2xl bg-[#FFFDF7] border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">إدارة الإنتاج والجلسات:</p>
              <p className="text-sm font-black text-amber-900">{MANAGER_NAME}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`tel:${MANAGER_PHONE}`}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-slate-600" />
              <span>اتصال: 733600800</span>
            </a>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSendWhatsApp} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                اسم الفنان أو الموهبة <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="مثال: أحمد عبدالكريم"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-200 outline-none text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                نوع الموهبة الفنية
              </label>
              <select
                value={talentType}
                onChange={e => setTalentType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-200 outline-none text-xs text-slate-800"
              >
                <option value="غناء طربي وعزف عود">غناء طربي وعزف عود</option>
                <option value="عزف عود منفرد (سلطنة وتقاسيم)">عزف عود منفرد (سلطنة وتقاسيم)</option>
                <option value="إيقاع وضبط ميزان الجلسات">إيقاع وضبط ميزان الجلسات</option>
                <option value="شعر غنائي وتأليف كلمات">شعر غنائي وتأليف كلمات</option>
                <option value="تلحين وتوزيع موسيقي">تلحين وتوزيع موسيقي</option>
                <option value="عازف كمان / آلات وترية">عازف كمان / آلات وترية</option>
                <option value="موهبة صوتية ناشئة">موهبة صوتية ناشئة</option>
                <option value="أخرى">أخرى</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                المحافظة / المدينة
              </label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="مثال: صنعاء، عدن، حضرموت..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-200 outline-none text-xs text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                رقم الواتساب أو الهاتف
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="مثال: 77XXXXXXX"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-200 outline-none text-xs text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              رابط نموذج من عملك أو تسجيل صوتي (إن وجد)
            </label>
            <input
              type="text"
              value={workLink}
              onChange={e => setWorkLink(e.target.value)}
              placeholder="رابط يوتيوب، درايف، تيليجرام أو كلاود..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-200 outline-none text-xs text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              تفاصيل الرسالة ومجال الدعم المطلوب
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="اكتب نبذة عنك، وما ترغب بتقديمه في ديوان السعادة..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-200 outline-none text-xs text-slate-800 resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleCopy}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'تم نسخ الرسالة!' : 'نسخ نص الرسالة'}</span>
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
              <span>إرسال مباشرة لواتساب الأستاذ محمد قائد</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
