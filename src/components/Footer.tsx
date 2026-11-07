import { ArrowUp, Disc, Heart, Layers, Lock, Mail, Mic2, Music, ShieldCheck, Video, Youtube } from 'lucide-react';
import React, { useState } from 'react';
import { ActiveTab, AdminSettings } from '../types';

interface FooterProps {
  settings: AdminSettings;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, setActiveTab }) => {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white border-t border-amber-200/80 pt-12 pb-8 text-right mt-16 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-slate-100">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={settings.channelLogoUrl}
                alt={settings.channelName}
                className="w-12 h-12 rounded-full border-2 border-amber-400 object-cover shadow-sm"
                onError={e => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=120&q=80';
                }}
              />
              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-['Cairo']">{settings.channelName}</h3>
                <span className="text-xs text-teal-800 font-bold">إحياء الأغنية اليمنية بطابع شبابي فرائحي جديد</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
              المكتبة الرقمية الرسمية لقناة ديوان السعادة بصنعاء. توثيق وتسجيل جلسات الطرب الصنعاني واللحجي والحضرمي والخليجي وتقاسيم العود الحصرية بنقاء استوديو فائق.
            </p>

            <div className="flex items-center gap-2.5 pt-1">
              <a
                href="https://www.youtube.com/@dewanalsaada?sub_confirmation=1"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors"
                title="اشترك في قناة اليوتيوب الرسمية"
              >
                <Youtube className="w-4 h-4" />
              </a>

              <a
                href="https://www.facebook.com/dewanalsaada/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-blue-50 text-[#1877F2] hover:bg-blue-100 border border-blue-200 transition-colors"
                title="صفحة فيسبوك ديوان السعادة الرسمية"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              <a
                href="https://wa.me/967733600800"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                title="واتساب ديوان السعادة (+967 733 600 800)"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                </svg>
              </a>

              <button
                onClick={() => setActiveTab('contact')}
                className="p-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                title="تواصل معنا"
              >
                <Mail className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 font-['Cairo'] tracking-wider uppercase">أقسام المنصة</h4>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li>
                <button onClick={() => setActiveTab('home')} className="hover:text-teal-700 transition-colors">
                  الرئيسية
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('videos')} className="hover:text-teal-700 transition-colors">
                  جميع الفيديوهات
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('songs')} className="hover:text-teal-700 transition-colors">
                  المكتبة الغنائية
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('artists')} className="hover:text-teal-700 transition-colors">
                  الفنانين والمطربين
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('albums')} className="hover:text-teal-700 transition-colors">
                  الألبومات والجلسات
                </button>
              </li>
            </ul>
          </div>

          {/* Categories Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 font-['Cairo'] tracking-wider uppercase">الألوان التراثية</h4>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li>
                <button onClick={() => setActiveTab('categories')} className="hover:text-teal-700 transition-colors">
                  الأغاني الصنعانية
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('categories')} className="hover:text-teal-700 transition-colors">
                  الدان والأغاني الحضرمية
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('categories')} className="hover:text-teal-700 transition-colors">
                  الشرح اللحجي والعدني
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('categories')} className="hover:text-teal-700 transition-colors">
                  جلسات العود والتقاسيم
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('categories')} className="hover:text-teal-700 transition-colors">
                  كافة الـ 19 تصنيفاً
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 font-['Cairo'] tracking-wider uppercase">الحقوق والمعلومات</h4>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li>
                <button onClick={() => setShowPrivacyModal(true)} className="hover:text-teal-700 transition-colors">
                  سياسة الخصوصية
                </button>
              </li>
              <li>
                <button onClick={() => setShowTermsModal(true)} className="hover:text-teal-700 transition-colors">
                  شروط الاستخدام والتنزيل
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('contact')} className="hover:text-teal-700 transition-colors">
                  حجز جلسة وتوثيق فني
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('admin')} className="hover:text-teal-700 transition-colors flex items-center gap-1 font-bold">
                  <Lock className="w-3 h-3 text-amber-600" />
                  <span>دخول الإدارة</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Bar & Developer Badge */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <p>© {new Date().getFullYear()} ديوان السعادة – نغم يجمعنا | جميع الحقوق محفوظة لجهة الإنتاج والتوثيق.</p>
            {/* Developer Button */}
            <a
              href={`https://wa.me/967774632249?text=${encodeURIComponent('السلام عليكم ارغب في التواصل معكم لطلب موقع الكتروني او اعلان ممول')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold transition-all shadow-xs"
              title="تواصل مباشر مع مصمم ومطور الموقع: تصميم ALRASSASS"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>تصميم ALRASSASS</span>
              <span className="text-[10px] text-amber-700">واتساب ⇗</span>
            </a>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[11px] text-slate-400">صنعاء، اليمن</span>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 text-teal-700 hover:underline font-bold"
            >
              <span>إلى الأعلى</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 text-right space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 font-['Cairo']">سياسة الخصوصية</h3>
            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>
                نلتزم في منصة "ديوان السعادة – نغم يجمعنا" بحماية خصوصية زوارنا. لا نجمع أي بيانات شخصية حساسة أو نبيعها لأي جهة.
              </p>
              <p>
                التخزين المؤقت المحلي (Local Storage) يُستخدم فقط لحفظ تفضيلات التصفح، الأغاني المفضلة، وسجلات المشاهدات محلياً على جهاز المستخدم.
              </p>
              <p>
                يتم استدعاء مقاطع الفيديو والتكامل مع YouTube بموجب شروط خدمة Google وYouTube الرسمية.
              </p>
            </div>
            <button
              onClick={() => setShowPrivacyModal(false)}
              className="w-full py-2 bg-[#13B8A6] text-white text-xs font-bold rounded-xl"
            >
              فهمت وأوافق
            </button>
          </div>
        </div>
      )}

      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 text-right space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 font-['Cairo']">شروط الاستخدام والتنزيل</h3>
            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>
                كافة التسجيلات والمصنفات الفنية وجلسات الطرب المنشورة على هذا الموقع مسجلة وموثقة لصالح قناة "ديوان السعادة" أو مرخص بنشرها من قبل الفنانين والشعراء أصحاب الحقوق.
              </p>
              <p>
                وظيفة تنزيل الملفات واستخراج MP3 مخصصة للاستماع الشخصي غير التجاري. يُحظر إعادة رفع المحتوى على منصات أخرى لتحقيق أرباح بدون إذن خطي مسبق من إدارة ديوان السعادة.
              </p>
            </div>
            <button
              onClick={() => setShowTermsModal(false)}
              className="w-full py-2 bg-[#13B8A6] text-white text-xs font-bold rounded-xl"
            >
              موافق على الشروط
            </button>
          </div>
        </div>
      )}
    </footer>
  );
};
