import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.splitshare.app',
  appName: 'SplitShare',
  webDir: 'dist',
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: true,
      providers: ['google.com'],
    },
    StatusBar: {
      backgroundColor: '#044d4b',
      style: 'DARK'
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#044d4b',
      showSpinner: true,
      spinnerColor: '#ffffff'
    }
  },
};

export default config;
