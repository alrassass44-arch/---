import {
  Bot,
  ExternalLink,
  MessageSquare,
  Music,
  Radio,
  Send,
  Sparkles,
  User,
  Wifi,
  WifiOff,
  X,
  PhoneCall,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface ChatMessage {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  time: string;
}

interface DewanAiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRadio?: () => void;
  onOpenTalentModal?: () => void;
}

const DEFAULT_SUGGESTIONS = [
  'ما هي أحدث جلسات ديوان السعادة؟',
  'كيف يعمل الراديو بدون اتصال بالإنترنت؟',
  'كيف أقوم بتنزيل فيديو الجلسة MP4؟',
  'كيف أقدم موهبتي في الغناء أو عزف العود؟',
  'من هو المشرف العام ورقم التواصل؟',
];

export const DewanAiAssistantModal: React.FC<DewanAiAssistantModalProps> = ({
  isOpen,
  onClose,
  onOpenRadio,
  onOpenTalentModal,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: 'مرحباً بك في ديوان السعادة! أنا المساعد الذكي للمنصة. يسعدني مساعدتك في استعراض الجلسات، معرفة المقامات الموسيقية، تشغيل الراديو وميزاته، أو الاستفسار عن كيفية تنزيل الفيديوهات وتقديم المواهب الفنية. كيف يمكنني خدمتك اليوم؟',
      time: new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();
      const replyText = data.reply || 'شكراً لتواصلك مع ديوان السعادة! هل لديك استفسار آخر عن الجلسات أو الراديو؟';

      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        time: new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (e) {
      const errorMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        text: 'ديوان السعادة يرحب بك دائماً! للتواصل المباشر مع المشرف العام الأستاذ محمد قائد يمكنك مراسلته عبر واتساب: +967 733 600 800.',
        time: new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200"
      dir="rtl"
    >
      <div className="bg-[#0b172a] border-2 border-cyan-400/50 rounded-3xl max-w-lg w-full h-[620px] max-h-[92vh] flex flex-col text-right relative shadow-[0_0_40px_rgba(6,182,212,0.25)] text-white overflow-hidden">
        {/* Animated Background Luminous Glows */}
        <div className="absolute top-0 right-1/4 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 p-4 border-b border-slate-800 bg-[#0d1d36]/90 backdrop-blur-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-amber-400 p-0.5 shadow-lg shadow-cyan-500/30">
                <div className="w-full h-full bg-[#0a1424] rounded-2xl flex items-center justify-center text-cyan-300">
                  <Bot className="w-5 h-5 animate-pulse" />
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0b172a] animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black font-['Cairo'] text-white">
                  مساعد ديوان السعادة الذكي
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/40">
                  رد فوري 24/7
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                إجابات فورية عن الجلسات، الفنانين، الراديو، والتنزيل
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="إغلاق المساعد"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-3.5">
          {messages.map(msg => {
            const isAst = msg.sender === 'assistant';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${isAst ? 'justify-start' : 'justify-end'}`}
              >
                {isAst && (
                  <div className="w-7 h-7 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 flex-shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs sm:text-[13px] leading-relaxed font-['Tajawal'] shadow-md ${
                    isAst
                      ? 'bg-slate-900/90 text-slate-100 border border-slate-700/80 rounded-tr-none'
                      : 'bg-gradient-to-r from-blue-600 to-[#0D65D9] text-white rounded-tl-none font-medium'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <span className="block text-[9px] text-slate-400 text-left mt-1.5 font-mono">
                    {msg.time}
                  </span>
                </div>

                {!isAst && (
                  <div className="w-7 h-7 rounded-xl bg-blue-600 flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-cyan-300 text-xs py-2 px-3 bg-slate-900/80 rounded-2xl w-fit border border-slate-800">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-400" />
              <span>جاري صياغة الإجابة من مكتبة ديوان السعادة...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Question Chips */}
        <div className="relative z-10 px-3 py-2 border-t border-slate-800/80 bg-slate-900/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {DEFAULT_SUGGESTIONS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(s)}
              disabled={isLoading}
              className="text-[11px] font-bold text-cyan-200 hover:text-white bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 hover:border-cyan-400 rounded-full px-3 py-1 whitespace-nowrap transition cursor-pointer flex-shrink-0"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="relative z-10 p-3 border-t border-slate-800 bg-[#0d1d36]/90 backdrop-blur-xl">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="اكتب سؤالك هنا عن الأغاني، الراديو، أو الإدارة..."
              disabled={isLoading}
              className="flex-1 bg-slate-950/80 border border-slate-700 focus:border-cyan-400 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none transition"
            />

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold transition shadow-lg shadow-cyan-500/25 disabled:opacity-40 cursor-pointer flex items-center justify-center flex-shrink-0"
              title="إرسال"
            >
              <Send className="w-4 h-4 fill-slate-950 transform rotate-180" />
            </button>
          </form>

          {/* Quick Action Badges */}
          <div className="flex items-center justify-between pt-2 px-1 text-[10px] text-slate-400">
            <div className="flex items-center gap-3">
              {onOpenRadio && (
                <button
                  type="button"
                  onClick={onOpenRadio}
                  className="hover:text-amber-300 flex items-center gap-1 transition cursor-pointer"
                >
                  <Radio className="w-3 h-3 text-amber-400" />
                  <span>فتح الراديو</span>
                </button>
              )}
              {onOpenTalentModal && (
                <button
                  type="button"
                  onClick={onOpenTalentModal}
                  className="hover:text-emerald-300 flex items-center gap-1 transition cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>رعاية المواهب</span>
                </button>
              )}
            </div>

            <a
              href="https://wa.me/967733600800"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
            >
              <PhoneCall className="w-3 h-3" />
              <span>واتساب الإدارة (+967 733 600 800)</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
