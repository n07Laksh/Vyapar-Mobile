import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.com',
  appName: 'Bill Wala',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  }
};

export default config;
