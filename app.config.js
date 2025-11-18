export default {
  expo: {
    name: 'Pepe-Mobile',
    slug: 'Pepe-Mobile',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/PepePlace.png',
    userInterfaceStyle: 'dark',
    splash: {
      image: './assets/PepePlace.png',
      resizeMode: 'contain',
      backgroundColor: '#2c2c2c'
    },
    assetBundlePatterns: [
      '**/*'
    ],
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/PepePlace.png',
        backgroundColor: '#2c2c2c'
      },
      navigationBar: {
        backgroundColor: '#2c2c2c',
        barStyle: 'light-content'
      },
      statusBar: {
        backgroundColor: '#2c2c2c',
        barStyle: 'light-content',
        translucent: false
      }
    },
    web: {
      favicon: './assets/favicon.png'
    },
    extra: {
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_KEY: process.env.EXPO_PUBLIC_SUPABASE_KEY,
    }
  }
};