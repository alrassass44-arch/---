import {
  CheckCircle2,
  Clock,
  HeartHandshake,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Phone,
  Send,
  Sparkles,
  User,
  Youtube,
} from 'lucide-react';
import React, { useState } from 'react';
import { AdminSettings } from '../types';

interface ContactViewProps {
  settings: AdminSettings;
  onOpenTalentModal?: () => void;
}

export const ContactView: React.FC<ContactViewProps> = ({ settings, onOpenTalentModal }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [messageType, setMessageType] = useState('حجز جلسة فنية وطرب');
  const [message, setMessage] = useState('');

  const MANAGER_NAME = 'الأستاذ محمد قائد';
  const MANAGER_PHONE = '+967733600800';

  const handleSendViaWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `السلام عليكم ورحمة الله وبركاته،
إدارة ديوان السعادة – نغم يجمعنا
عناية: ${MANAGER_NAME}

رسالة من المنصة:
👤 الاسم: ${name || 'زائر الديوان'}
📱 الهاتف: ${phone || 'غير محدد'}
📂 موضوع التواصل: ${messageType}

💬 نص الرسالة:
${message}`;

    const url = `https://wa.me/967733600800?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
          تواصل مباشر عبر واتساب
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 font-['Cairo']">
          تواصل مع إدارة ديوان السعادة
        </h1>
        <p className="text-sm text-slate-600">
          تواصل مباشر مع المشرف العام {MANAGER_NAME} ({MANAGER_PHONE}) لحجز الجلسات ورعاية المواهب الفنية
        </p>
      </div>

      {/* Talent Support Special Feature Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300 flex-shrink-0">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black">
                خاص بالفنانين والمبدعين
              </span>
            </div>
            <h3 className="text-lg font-bold font-['Cairo']">
              هل أنت فنان أو عازف وتبحث عن دعم فني ونشر لأعمالك؟
            </h3>
            <p className="text-xs text-emerald-100/90 mt-0.5 max-w-xl">
              يوفر ديوان السعادة الدعم والتوثيق التراثي والنشر عبر القناة الرسمية للمواهب والأصوات الواعدة.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenTalentModal}
          className="flex-shrink-0 px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg transition-all cursor-pointer flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>فتح استمارة دعم المواهب</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact Info Cards */}
        <div className="space-y-4">
          {/* Manager Direct Card */}
          <div className="p-5 rounded-3xl bg-white border border-amber-200 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-['Cairo']">المشرف العام وإدارة القناة</h3>
              <p className="text-sm font-black text-amber-900 mt-0.5">{MANAGER_NAME}</p>
              <div className="pt-2 flex flex-col gap-1.5">
                <a
                  href={`https://wa.me/967733600800?text=${encodeURIComponent('السلام عليكم الأستاذ محمد قائد، أود التواصل معك.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-bold hover:underline"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span>واتساب: {MANAGER_PHONE}</span>
                </a>
                <a
                  href={`tel:${MANAGER_PHONE}`}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>اتصال: {MANAGER_PHONE}</span>
                </a>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-amber-100 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-['Cairo']">مقر الجلسات والديوان</h3>
              <p className="text-xs text-slate-500 mt-1">صنعاء، الجمهورية اليمنية</p>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-amber-100 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
              <Youtube className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-['Cairo']">القناة الرسمية على يوتيوب</h3>
              <a
                href="https://www.youtube.com/@dewanalsaada?sub_confirmation=1"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-red-600 font-bold hover:underline mt-1 block"
              >
                @dewanalsaada (اشتراك وتفعيل الجرس)
              </a>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-amber-100 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1877F2]">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-['Cairo']">الصفحة الرسمية على فيسبوك</h3>
              <a
                href="https://www.facebook.com/dewanalsaada/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#1877F2] font-bold hover:underline mt-1 block"
              >
                facebook.com/dewanalsaada (كل جديد)
              </a>
            </div>
          </div>
        </div>

        {/* Dedicated WhatsApp Message Form */}
        <div className="md:col-span-2 bg-white border border-amber-200/80 p-6 sm:p-8 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-['Cairo']">
                نموذج مراسلة واتساب مباشر للإدارة
              </h2>
              <p className="text-xs text-slate-500">
                يتم إرسال الرسالة مباشرة إلى رقم {MANAGER_NAME} (+967 733 600 800)
              </p>
            </div>
          </div>

          <form onSubmit={handleSendViaWhatsApp} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-700 block mb-1 font-bold">الاسم الكريم <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="أدخل اسمك"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-[#FFFDF7] border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 font-medium"
                />
              </div>
              <div>
                <label className="text-slate-700 block mb-1 font-bold">رقم هاتفك / واتساب</label>
                <input
                  type="text"
                  placeholder="مثال: 77XXXXXXX"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-[#FFFDF7] border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-700 block mb-1 font-bold">نوع وموضوع التواصل</label>
              <select
                value={messageType}
                onChange={e => setMessageType(e.target.value)}
                className="w-full bg-[#FFFDF7] border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 font-medium"
              >
                <option value="طلب دعم فني ورعاية موهبة موسيقية">طلب دعم فني ورعاية موهبة موسيقية</option>
                <option value="حجز وتنسيق جلسة فنية وطرب">حجز وتنسيق جلسة فنية وطرب</option>
                <option value="توثيق عمل فني وتنزيل بالجودة الأصلية">توثيق عمل فني وتنزيل بالجودة الأصلية</option>
                <option value="اقتراح تسجيل أغنية تراثية نادرة">اقتراح تسجيل أغنية تراثية نادرة</option>
                <option value="استفسار عام للإدارة">استفسار عام للإدارة</option>
              </select>
            </div>

            <div>
              <label className="text-slate-700 block mb-1 font-bold">تفاصيل الرسالة <span className="text-rose-500">*</span></label>
              <textarea
                rows={4}
                required
                placeholder="اكتب رسالتك وتفاصيل استفسارك أو رغبتك في المشاركة..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full bg-[#FFFDF7] border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 font-medium resize-none"
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <a
                href={`https://wa.me/967733600800`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-500 hover:text-emerald-700 flex items-center gap-1 font-medium"
              >
                <span>محادثة سريعة دون تعبئة النموذج</span>
              </a>

              <button
                type="submit"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>إرسال عبر واتساب إلى الأستاذ محمد قائد</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
