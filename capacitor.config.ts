import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.campussetu.app',
  appName: 'CampusSetu Mobile',
  webDir: 'client/dist',
  server: {
    androidScheme: 'https',
    cleartext: false,
    hostname: 'campussetu.edu'
  },
  plugins: {
    DeepLinks: {
      customUrlScheme: 'campussetu'
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
};

export default config;
