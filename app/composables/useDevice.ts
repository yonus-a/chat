import { reactive, onMounted, readonly } from 'vue';

export interface DevicePlatform {
  isTauri: boolean;
  isTauriAndroid: boolean;
  isTauriiOS: boolean;
  isTauriDesktop: boolean;
  isPWAInstalled: boolean; // Installed standalone or added to homescreen
  isWeb: boolean; // Running in a standard browser tab
}

export interface DeviceHardware {
  hasMicrophone: boolean;
  hasCamera: boolean;
  isChecking: boolean;
  error: string | null;
}

export function useDevice() {
  // 1. Platform Detection State
  const platform = reactive<DevicePlatform>({
    isTauri: false,
    isTauriAndroid: false,
    isTauriiOS: false,
    isTauriDesktop: false,
    isPWAInstalled: false,
    isWeb: true,
  });

  // 2. Hardware Capabilities State
  const hardware = reactive<DeviceHardware>({
    hasMicrophone: false,
    hasCamera: false,
    isChecking: true,
    error: null,
  });

  // 3. Initialize Platform (Synchronous)
  const detectPlatform = () => {
    if (typeof window === 'undefined') return; // SSR check

    const ua = navigator.userAgent;
    const isAndroid = /android/i.test(ua);
    const isIOS = /ipad|iphone|ipod/i.test(ua);

    // Check for Tauri (Tauri injects __TAURI__ or __TAURI_IPC__ into the window)
    const isTauriEnv = !!(window as any).__TAURI__ || !!(window as any).__TAURI_IPC__;
    
    // Check for PWA (Standalone mode or iOS homescreen)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         !!(navigator as any).standalone;

    platform.isTauri = isTauriEnv;
    platform.isTauriAndroid = isTauriEnv && isAndroid;
    platform.isTauriiOS = isTauriEnv && isIOS;
    platform.isTauriDesktop = isTauriEnv && !isAndroid && !isIOS;
    
    platform.isPWAInstalled = !isTauriEnv && isStandalone;
    platform.isWeb = !isTauriEnv && !isStandalone;
  };

  // 4. Initialize Hardware (Asynchronous)
  const detectHardware = async () => {
    if (typeof window === 'undefined') {
      hardware.isChecking = false;
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      hardware.error = 'MediaDevices API not supported on this browser/platform.';
      hardware.isChecking = false;
      return;
    }

    try {
      // enumerateDevices tells us what physical hardware is plugged in/available
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      hardware.hasMicrophone = devices.some(device => device.kind === 'audioinput');
      hardware.hasCamera = devices.some(device => device.kind === 'videoinput');
    } catch (err: any) {
      console.error('Failed to enumerate devices:', err);
      hardware.error = err.message || 'Failed to detect hardware';
    } finally {
      hardware.isChecking = false;
    }
  };

  // Run detections on client-side mount
  onMounted(() => {
    detectPlatform();
    detectHardware();
  });

  return {
    platform: readonly(platform),
    hardware: readonly(hardware),
    // Expose methods if you need to re-trigger checks manually
    refreshHardwareCheck: detectHardware 
  };
}