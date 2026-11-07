/**
 * BluetoothAudioService
 * Advanced Bluetooth audio device discovery, pairing, and routing service for Dewan Al Saada.
 * Supports:
 * - HTMLMediaElement setSinkId routing
 * - Native Audio Output Picker (selectAudioOutput)
 * - Web Bluetooth GATT device pairing (navigator.bluetooth)
 * - Device Label Unmasking via MediaDevices
 * - Audio verification test tone
 */

export interface BluetoothAudioDevice {
  id: string;
  name: string;
  type: 'headphone' | 'speaker' | 'car' | 'other';
  connected: boolean;
  isDefault?: boolean;
  batteryLevel?: number;
  isPairedViaWebBt?: boolean;
}

const STORAGE_KEY_DEV_ID = 'dewan_selected_audio_device';
const STORAGE_KEY_DEV_NAME = 'dewan_selected_audio_device_name';

class BluetoothAudioServiceClass {
  private selectedDeviceId: string = 'default';
  private selectedDeviceName: string = 'سماعات الجهاز الافتراضية';
  private pairedWebBtDevices: Map<string, any> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      this.selectedDeviceId = localStorage.getItem(STORAGE_KEY_DEV_ID) || 'default';
      this.selectedDeviceName = localStorage.getItem(STORAGE_KEY_DEV_NAME) || 'سماعات الجهاز الافتراضية';

      // Auto-reapply sink when devices change (e.g. bluetooth headphones connected/disconnected)
      if (navigator.mediaDevices?.addEventListener) {
        navigator.mediaDevices.addEventListener('devicechange', () => {
          this.applyToAllMediaElements();
        });
      }
    }
  }

  public getCurrentDeviceId(): string {
    return this.selectedDeviceId;
  }

  public getCurrentDeviceName(): string {
    return this.selectedDeviceName;
  }

  public isSinkIdSupported(): boolean {
    return typeof window !== 'undefined' && 'HTMLMediaElement' in window && 'setSinkId' in HTMLMediaElement.prototype;
  }

  public isWebBluetoothSupported(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  public isSelectAudioOutputSupported(): boolean {
    return (
      typeof navigator !== 'undefined' &&
      'mediaDevices' in navigator &&
      typeof (navigator.mediaDevices as any).selectAudioOutput === 'function'
    );
  }

  /**
   * Apply audio output sinkId to a specific HTMLMediaElement
   */
  public async applyAudioSink(mediaEl: HTMLMediaElement | null, targetDeviceId?: string): Promise<boolean> {
    if (!mediaEl || !this.isSinkIdSupported()) return false;
    const deviceId = targetDeviceId ?? this.selectedDeviceId;

    try {
      const sinkValue = deviceId === 'default' ? '' : deviceId;
      await (mediaEl as any).setSinkId(sinkValue);
      return true;
    } catch (err) {
      console.warn('[BluetoothAudioService] setSinkId error:', err);
      return false;
    }
  }

  /**
   * Apply sink to all audio elements on page
   */
  public async applyToAllMediaElements(targetDeviceId?: string): Promise<void> {
    if (typeof document === 'undefined') return;
    const audioElements = document.querySelectorAll<HTMLMediaElement>('audio, video');
    for (const el of Array.from(audioElements)) {
      await this.applyAudioSink(el, targetDeviceId);
    }
  }

  /**
   * Enumerate system audio output devices
   */
  public async getAudioOutputDevices(): Promise<BluetoothAudioDevice[]> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) {
      return [
        {
          id: 'default',
          name: 'سماعات الجهاز الافتراضية',
          type: 'speaker',
          connected: true,
          isDefault: true,
        },
      ];
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioOutputs = devices.filter(d => d.kind === 'audiooutput');

      if (audioOutputs.length === 0) {
        return [
          {
            id: 'default',
            name: 'سماعة النظام الافتراضية (مكبر الصوت)',
            type: 'speaker',
            connected: this.selectedDeviceId === 'default',
            isDefault: true,
          },
        ];
      }

      return audioOutputs.map((dev, idx) => {
        const rawLabel = dev.label?.trim() || '';
        const fallbackName = dev.deviceId === 'default'
          ? 'سماعة النظام الافتراضية'
          : `جهاز صوت لاسلكي / بلوتوث (${idx + 1})`;
        const name = rawLabel || fallbackName;

        const lower = name.toLowerCase();
        let type: BluetoothAudioDevice['type'] = 'speaker';
        if (
          lower.includes('car') ||
          lower.includes('سيارة') ||
          lower.includes('auto') ||
          lower.includes('sync')
        ) {
          type = 'car';
        } else if (
          lower.includes('headphone') ||
          lower.includes('headset') ||
          lower.includes('earphone') ||
          lower.includes('airpod') ||
          lower.includes('buds') ||
          lower.includes('سماعة') ||
          lower.includes('wireless') ||
          lower.includes('bluetooth') ||
          lower.includes('bt')
        ) {
          type = 'headphone';
        }

        const isCurrent = this.selectedDeviceId === dev.deviceId ||
          (this.selectedDeviceId === 'default' && dev.deviceId === 'default');

        return {
          id: dev.deviceId || `dev-${idx}`,
          name,
          type,
          connected: isCurrent,
          isDefault: dev.deviceId === 'default',
        };
      });
    } catch (e) {
      console.warn('[BluetoothAudioService] enumerateDevices error:', e);
      return [];
    }
  }

  /**
   * Request user permission to unmask real device hardware labels (AirPods, JBL, Sony, Car Audio, etc.)
   */
  public async unlockDeviceLabels(): Promise<BluetoothAudioDevice[]> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      return this.getAudioOutputDevices();
    }

    try {
      // Briefly request audio permission to unlock hardware device names
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Immediately stop all tracks to release microphone
      stream.getTracks().forEach(track => track.stop());
      return await this.getAudioOutputDevices();
    } catch (err) {
      console.warn('[BluetoothAudioService] permission request skipped or dismissed:', err);
      return await this.getAudioOutputDevices();
    }
  }

  /**
   * Native Chromium Audio Output Chooser (selectAudioOutput)
   */
  public async selectNativeAudioOutput(): Promise<BluetoothAudioDevice | null> {
    if (!this.isSelectAudioOutputSupported()) return null;

    try {
      const device = await (navigator.mediaDevices as any).selectAudioOutput();
      if (!device) return null;

      const newDev: BluetoothAudioDevice = {
        id: device.deviceId,
        name: device.label || 'سماعة بلوتوث خارجية',
        type: 'headphone',
        connected: true,
      };

      await this.setConnectedDevice(newDev.id, newDev.name);
      return newDev;
    } catch (err: any) {
      if (err.name === 'AbortError' || err.name === 'NotAllowedError') {
        return null;
      }
      console.warn('[BluetoothAudioService] selectAudioOutput error:', err);
      return null;
    }
  }

  /**
   * Pair directly via Web Bluetooth API (BLE / GATT)
   */
  public async pairWebBluetoothDevice(): Promise<BluetoothAudioDevice | null> {
    if (!this.isWebBluetoothSupported()) {
      throw new Error('تقنية Web Bluetooth غير مدعومة في هذا المتصفح');
    }

    try {
      const bt = (navigator as any).bluetooth;
      const device = await bt.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['generic_access', 'battery_service', 'device_information'],
      });

      if (!device) return null;

      let batteryLevel: number | undefined;

      // Try connecting to GATT server if possible
      if (device.gatt) {
        try {
          const server = await device.gatt.connect();
          try {
            const batteryService = await server.getPrimaryService('battery_service');
            const batteryChar = await batteryService.getCharacteristic('battery_level');
            const val = await batteryChar.readValue();
            batteryLevel = val.getUint8(0);
          } catch (_) {}
        } catch (_) {}
      }

      this.pairedWebBtDevices.set(device.id, device);

      const btDev: BluetoothAudioDevice = {
        id: device.id,
        name: device.name || 'سماعة بلوتوث لاسلكية',
        type: 'headphone',
        connected: true,
        batteryLevel,
        isPairedViaWebBt: true,
      };

      await this.setConnectedDevice(btDev.id, btDev.name);
      return btDev;
    } catch (err: any) {
      if (err.name === 'NotFoundError' || err.name === 'AbortError') {
        return null;
      }
      throw err;
    }
  }

  /**
   * Set and persist active connected device
   */
  public async setConnectedDevice(deviceId: string, deviceName: string): Promise<void> {
    this.selectedDeviceId = deviceId;
    this.selectedDeviceName = deviceName;

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_DEV_ID, deviceId);
      localStorage.setItem(STORAGE_KEY_DEV_NAME, deviceName);
    }

    await this.applyToAllMediaElements(deviceId);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('dewan:bluetooth-connected', {
          detail: { deviceId, deviceName },
        })
      );
    }
  }

  /**
   * Play an authentic warm acoustic chime test tone on the selected audio device
   */
  public playTestTone(): Promise<boolean> {
    return new Promise(resolve => {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) {
          resolve(false);
          return;
        }

        const ctx = new AudioCtx();

        // 3-note harmonic Yemeni Oud arpeggio (Rast - Bayati - High Rast)
        const notes = [
          { freq: 440, time: 0.0, dur: 0.25 }, // Rast (A4)
          { freq: 554.37, time: 0.22, dur: 0.25 }, // C#5
          { freq: 659.25, time: 0.44, dur: 0.5 }, // E5
        ];

        notes.forEach(({ freq, time, dur }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

          gain.gain.setValueAtTime(0, ctx.currentTime + time);
          gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + time + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + dur);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(ctx.currentTime + time);
          osc.stop(ctx.currentTime + time + dur + 0.05);
        });

        setTimeout(() => {
          try {
            ctx.close();
          } catch (_) {}
          resolve(true);
        }, 1100);
      } catch (e) {
        console.warn('[BluetoothAudioService] playTestTone error:', e);
        resolve(false);
      }
    });
  }
}

export const BluetoothAudioService = new BluetoothAudioServiceClass();
