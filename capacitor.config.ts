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
    }
  },
};

export default config;
