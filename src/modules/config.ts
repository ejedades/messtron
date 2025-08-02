export const CONFIG = {
  window: {
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
  },
  app: {
    name: 'Messtron',
    url: 'https://www.messenger.com',
  },
  tray: {
    tooltip: 'Messtron - Facebook Messenger',
  },
  paths: {
    icon: '../../assets/icon.png',
    preload: '../preload/preload.js',
  },
} as const;