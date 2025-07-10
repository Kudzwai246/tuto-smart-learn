
import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'com.tuto.smartlearn',
  appName: 'Tuto Smart Learn',
  webDir: 'dist',
  server: {
    url: 'https://8bc352a7-cc3b-44b7-9318-b107c46135ad.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: '#ff6b35',
      showSpinner: false,
      androidSpinnerStyle: 'large',
      spinnerColor: '#ffffff'
    },
    StatusBar: {
      backgroundColor: '#ff6b35',
      style: 'light'
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false
  }
};

export default config;
