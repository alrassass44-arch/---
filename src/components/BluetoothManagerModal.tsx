import {
  AlertCircle,
  Battery,
  Bluetooth,
  BluetoothConnected,
  BluetoothOff,
  BluetoothSearching,
  CheckCircle2,
  Headphones,
  Info,
  Laptop,
  Radio,
  RefreshCw,
  Smartphone,
  Sparkles,
  Speaker,
  Volume2,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { BluetoothAudioDevice, BluetoothAudioService } from '../services/bluetoothAudioService';

interface BluetoothManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAudioDeviceSelected?: (deviceId: string, deviceName: string) => void;
  currentDeviceId?: string;
}

export const BluetoothManagerModal: React.FC<BluetoothManagerModalProps> = ({
  isOpen,
  onClose,
  onAudioDeviceSelected,
  currentDeviceId,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isUnmasking, setIsUnmasking] = useState(false);
  const [devices, setDevices] = useState<BluetoothAudioDevice[]>([]);
  const [selectedId, setSelectedId] = useState<string>(
    currentDeviceId || BluetoothAudioService.getCurrentDeviceId()
  );
  const [activeTab, setActiveTab] = useState<'devices' | 'guide'>('devices');
  const [guidePlatform, setGuidePlatform] = useState<'android' | 'windows' | 'ios' | 'car'>('android');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isTestingSound, setIsTestingSound] = useState(false);
  const [hasGenericLabels, setHasGenericLabels] = useState(false);

  // Load devices on open
  useEffect(() => {
    if (!isOpen) return;

    setSelectedId(currentDeviceId || BluetoothAudioService.getCurrentDeviceId());
    refreshDeviceList();
  }, [isOpen, currentDeviceId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const refreshDeviceList = async () => {
    const list = await BluetoothAudioService.getAudioOutputDevices();
    setDevices(list);

    // Check if any device has generic name indicating masked permissions
    const generic = list.some(d => !d.isDefault && d.name.includes('جهاز صوت لاسلكي'));
    setHasGenericLabels(generic);
  };

  // 1. Search for devices using the most appropriate native mechanism
  const handleScanBluetooth = async () => {
    setIsScanning(true);
    try {
      // Step A: If Chromium selectAudioOutput is supported, trigger the native system picker
      if (BluetoothAudioService.isSelectAudioOutputSupported()) {
        const picked = await BluetoothAudioService.selectNativeAudioOutput();
        if (picked) {
          setSelectedId(picked.id);
          showToast(`تم الاتصال وتوجيه الصوت إلى: ${picked.name} 🎧`);
          await refreshDeviceList();
          if (onAudioDeviceSelected) onAudioDeviceSelected(picked.id, picked.name);
          setIsScanning(false);
          return;
        }
      }

      // Step B: If Web Bluetooth is supported, attempt direct Bluetooth requestDevice
      if (BluetoothAudioService.isWebBluetoothSupported()) {
        try {
          const btDev = await BluetoothAudioService.pairWebBluetoothDevice();
          if (btDev) {
            setSelectedId(btDev.id);
            showToast(`تم إقران جهاز البلوتوث بنجاح: ${btDev.name} ✨`);
            await refreshDeviceList();
            if (onAudioDeviceSelected) onAudioDeviceSelected(btDev.id, btDev.name);
            setIsScanning(false);
            return;
          }
        } catch (btErr: any) {
          // If user didn't cancel, log warning
          if (btErr.name !== 'NotFoundError' && btErr.name !== 'AbortError') {
            console.warn('Bluetooth pairing error:', btErr);
          }
        }
      }

      // Step C: Fallback to unlocking labels and refreshing list
      const updated = await BluetoothAudioService.unlockDeviceLabels();
      setDevices(updated);
      setHasGenericLabels(false);
      showToast('تم فحص وتحديث قائمة الأجهزة اللاسلكية المقترنة بنجاح 📡');
    } catch (e) {
      console.warn('Scan general error:', e);
      showToast('تم تحديث قائمة أجهزة الصوت المتاحة');
    } finally {
      setIsScanning(false);
    }
  };

  // 2. Unmask hardware labels (AirPods, Galaxy Buds, Sony, JBL, etc.)
  const handleUnmaskDeviceLabels = async () => {
    setIsUnmasking(true);
    try {
      const updated = await BluetoothAudioService.unlockDeviceLabels();
      setDevices(updated);
      setHasGenericLabels(false);
      showToast('تم كشف الأسماء الحقيقية لكافة السماعات والأجهزة المقترنة بنجاح ✅');
    } catch (e) {
      showToast('تعذر كشف أسماء الأجهزة، يرجى السماح بصلاحية الصوت في المتصفح');
    } finally {
      setIsUnmasking(false);
    }
  };

  // 3. Connect & Route Audio to Selected Device
  const handleSelectDevice = async (dev: BluetoothAudioDevice) => {
    setSelectedId(dev.id);
    await BluetoothAudioService.setConnectedDevice(dev.id, dev.name);

    if (onAudioDeviceSelected) {
      onAudioDeviceSelected(dev.id, dev.name);
    }

    showToast(`تم توجيه صوت الراديو إلى: ${dev.name} 🔊`);
  };

  // 4. Play Audio Test Tone
  const handleTestSound = async () => {
    setIsTestingSound(true);
    const success = await BluetoothAudioService.playTestTone();
    setIsTestingSound(false);
    if (success) {
      showToast('تم إرسال نغمة اختبار الصوت الصافية إلى السماعة المتصلة 🎵');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      dir="rtl"
    >
      <div className="bg-[#0f172a] border border-cyan-500/30 rounded-3xl max-w-lg w-full text-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-cyan-950/60 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/20">
              <Bluetooth className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black font-['Cairo'] text-white">
                  الربط اللاسلكي بأجهزة البلوتوث
                </h2>
                <span className="text-[10px] bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-bold">
                  Hi-Fi Audio
                </span>
              </div>
              <p className="text-[11px] text-cyan-200/80 font-medium">
                بث راديو ديوان السعادة على سماعاتك اللاسلكية أو راديو السيارة بجودة استوديو
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
            title="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-5 pt-3 gap-2 bg-slate-900/60">
          <button
            onClick={() => setActiveTab('devices')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'devices'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BluetoothConnected className="w-4 h-4" />
            <span>الأجهزة المتاحة ({devices.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'guide'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>إرشادات الاقتران بالسيارة والجوال</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'devices' ? (
            <>
              {/* Scan Action Bar */}
              <div className="bg-slate-900/90 border border-cyan-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
                <div className="text-center sm:text-right">
                  <p className="text-xs font-bold text-white font-['Cairo'] flex items-center gap-1.5 justify-center sm:justify-start">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>البحث والاقتران بأجهزة البلوتوث</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    تأكد من تشغيل البلوتوث في جهازك وجعل السماعة في وضع الاقتران
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleScanBluetooth}
                    disabled={isScanning}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isScanning ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                        <span>جاري البحث...</span>
                      </>
                    ) : (
                      <>
                        <BluetoothSearching className="w-4 h-4 text-slate-950" />
                        <span>البحث عن أجهزة</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleTestSound}
                    disabled={isTestingSound}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    title="فحص خروج الصوت عبر نغمة عود صافية"
                  >
                    <Volume2 className={`w-4 h-4 text-amber-400 ${isTestingSound ? 'animate-bounce' : ''}`} />
                    <span>فحص الصوت</span>
                  </button>
                </div>
              </div>

              {/* Unmasking Banner if browser masked real hardware names */}
              {hasGenericLabels && (
                <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-amber-200">
                    <Info className="w-4 h-4 flex-shrink-0 text-amber-400" />
                    <span className="text-[11px]">
                      هل ترغب بإظهار الأسماء الحقيقية لسماعاتك (AirPods، JBL، سوني، بلوتوث السيارة)؟
                    </span>
                  </div>
                  <button
                    onClick={handleUnmaskDeviceLabels}
                    disabled={isUnmasking}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] whitespace-nowrap transition cursor-pointer"
                  >
                    {isUnmasking ? 'جاري الكشف...' : 'كشف الأسماء'}
                  </button>
                </div>
              )}

              {/* Devices List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                  <span>الأجهزة المكتشفة ومخرجات الصوت:</span>
                  <span className="text-cyan-400 font-mono">{devices.length} أجهزة</span>
                </div>

                {devices.length === 0 ? (
                  <div className="text-center py-8 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
                    <BluetoothOff className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-400 font-bold">لم يتم العثور على أجهزة بلوتوث متصلة حالياً</p>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                      انقر على زر <strong>"البحث عن أجهزة"</strong> أو تأكد من تفعيل البلوتوث في جوالك واقترانه بسماعتك
                    </p>
                  </div>
                ) : (
                  devices.map(dev => {
                    const isSelected = selectedId === dev.id || (selectedId === 'default' && dev.isDefault);
                    return (
                      <div
                        key={dev.id}
                        onClick={() => handleSelectDevice(dev)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-cyan-950/50 border-cyan-400 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-400/30'
                            : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-cyan-500 text-slate-950 font-bold'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {dev.type === 'headphone' ? (
                              <Headphones className="w-5 h-5" />
                            ) : dev.type === 'car' ? (
                              <Radio className="w-5 h-5" />
                            ) : (
                              <Speaker className="w-5 h-5" />
                            )}
                          </div>

                          <div className="overflow-hidden">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-xs font-bold text-white truncate font-['Cairo']">
                                {dev.name}
                              </p>
                              {dev.isDefault && (
                                <span className="text-[9px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono border border-slate-700">
                                  افتراضي
                                </span>
                              )}
                              {dev.batteryLevel !== undefined && (
                                <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded flex items-center gap-1 font-mono">
                                  <Battery className="w-3 h-3" />
                                  <span>{dev.batteryLevel}%</span>
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                              {isSelected ? (
                                <>
                                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                  <span className="text-emerald-400 font-bold">الصوت موجه لهذا الجهاز حالياً</span>
                                  {/* Wave animation */}
                                  <span className="flex items-center gap-0.5 mr-1">
                                    <span className="w-0.5 h-2 bg-emerald-400 animate-pulse" />
                                    <span className="w-0.5 h-3 bg-emerald-400 animate-pulse delay-75" />
                                    <span className="w-0.5 h-1.5 bg-emerald-400 animate-pulse delay-150" />
                                  </span>
                                </>
                              ) : (
                                <span>انقر للاتصال وتوجيه صوت الراديو</span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex-shrink-0">
                          {isSelected ? (
                            <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                              <CheckCircle2 className="w-5 h-5" />
                            </span>
                          ) : (
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                handleSelectDevice(dev);
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 text-xs font-bold border border-cyan-400/20 transition cursor-pointer"
                            >
                              اتصال
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            /* System Quick Pairing Guide */
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => setGuidePlatform('android')}
                  className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                    guidePlatform === 'android'
                      ? 'bg-emerald-950/60 border-emerald-400 text-emerald-300 font-bold shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Smartphone className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-[10px]">أندرويد</span>
                </button>

                <button
                  onClick={() => setGuidePlatform('windows')}
                  className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                    guidePlatform === 'windows'
                      ? 'bg-blue-950/60 border-blue-400 text-blue-300 font-bold shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Laptop className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-[10px]">ويندوز</span>
                </button>

                <button
                  onClick={() => setGuidePlatform('ios')}
                  className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                    guidePlatform === 'ios'
                      ? 'bg-purple-950/60 border-purple-400 text-purple-300 font-bold shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Headphones className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-[10px]">آيفون/آيباد</span>
                </button>

                <button
                  onClick={() => setGuidePlatform('car')}
                  className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                    guidePlatform === 'car'
                      ? 'bg-amber-950/60 border-amber-400 text-amber-300 font-bold shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Radio className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-[10px]">راديو السيارة</span>
                </button>
              </div>

              {/* Guide Content Card */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-xs space-y-3 leading-relaxed shadow-inner">
                {guidePlatform === 'android' && (
                  <>
                    <h3 className="font-bold text-emerald-300 font-['Cairo'] text-sm">
                      خطوات ربط سماعة البلوتوث على نظام أندرويد (Android):
                    </h3>
                    <ol className="list-decimal list-inside space-y-2 text-slate-300">
                      <li>اسحب شريط الإشعارات من أعلى الشاشة إلى أسفل.</li>
                      <li>اضغط مطولاً على أيقونة <strong>البلوتوث</strong> لفتح قائمة الأجهزة المتاحة.</li>
                      <li>تأكد من تشغيل سماعتك أو مكبر الصوت ووضعه في وضع الاقتران (Pairing Mode).</li>
                      <li>اختر اسم سماعتك ثم انقر على <strong>«إقران / Pair»</strong>.</li>
                      <li>
                        افتح ديوان السعادة وانقر على زر <strong>«البحث عن أجهزة»</strong> لاختيارها فوراً وبث الطرب بنقاء استوديو.
                      </li>
                    </ol>
                  </>
                )}

                {guidePlatform === 'windows' && (
                  <>
                    <h3 className="font-bold text-blue-300 font-['Cairo'] text-sm">
                      خطوات ربط البلوتوث على نظام ويندوز (Windows 10 / 11):
                    </h3>
                    <ol className="list-decimal list-inside space-y-2 text-slate-300">
                      <li>
                        اضغط على زري <strong className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 font-mono">Win + K</strong> معاً على لوحة المفاتيح لفتح قائمة الصوت اللاسلكي الفورية.
                      </li>
                      <li>أو اضغط <strong className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 font-mono">Win + A</strong> ثم انقر على رمز البلوتوث.</li>
                      <li>اختر سماعتك أو جهاز المسرح المنزلي للاتصال.</li>
                      <li>سيتم بث راديو ديوان السعادة ومؤثرات الاستوديو فوراً عبر جهازك اللاسلكي.</li>
                    </ol>
                  </>
                )}

                {guidePlatform === 'ios' && (
                  <>
                    <h3 className="font-bold text-purple-300 font-['Cairo'] text-sm">
                      خطوات الربط على هواتف آيفون وأجهزة آيباد (iOS):
                    </h3>
                    <ol className="list-decimal list-inside space-y-2 text-slate-300">
                      <li>اسحب لأسفل من الزاوية العلوية لفتح <strong>مركز التحكم (Control Center)</strong>.</li>
                      <li>في بطاقة تشغيل الموسيقى، انقر على أيقونة <strong>AirPlay / البلوتوث</strong> ذات الموجات الصوتية.</li>
                      <li>اختر سماعاتك (مثل AirPods أو مكبر الصوت الخارجي).</li>
                      <li>يعمل الراديو في الخلفية وعلى شاشة القفل دون أي انقطاع.</li>
                    </ol>
                  </>
                )}

                {guidePlatform === 'car' && (
                  <>
                    <h3 className="font-bold text-amber-300 font-['Cairo'] text-sm">
                      خطوات ربط الراديو بنظام صوت وراديو السيارة (Car Audio):
                    </h3>
                    <ol className="list-decimal list-inside space-y-2 text-slate-300">
                      <li>قم بتشغيل البلوتوث في شاشة أو مسجل السيارة وفعّل وضع البحث (Bluetooth Audio).</li>
                      <li>من هاتفك، اتصل باسم مسجل السيارة (مثل BT-Car أو اسم طراز سيارتك).</li>
                      <li>
                        في ديوان السعادة، اختر وضع <strong>«استوديو ماستر»</strong> لتستمتع بجلسات الطرب اليمني عبر كافة سماعات السيارة بأعلى تجربة سمعية.
                      </li>
                    </ol>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Toast Notification inside modal */}
          {toastMessage && (
            <div className="bg-cyan-500 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[11px] font-bold">
              الجهاز الحالي: {BluetoothAudioService.getCurrentDeviceName()}
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-md"
          >
            تم
          </button>
        </div>
      </div>
    </div>
  );
};
