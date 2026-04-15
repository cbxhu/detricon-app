import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.detricon.messenger',
  appName: 'Detricon',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
