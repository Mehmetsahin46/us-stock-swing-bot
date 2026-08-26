'use client';

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) {
    alert('Tarayıcınız veya cihazınız bildirimleri desteklemiyor.');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (err) {
    console.error('Bildirim izni alınırken hata:', err);
    return false;
  }
}

export function sendLocalNotification(title: string, options?: NotificationOptions): void {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return;
  }

  try {
    const defaultOptions: NotificationOptions = {
      icon: '/icon.png',
      badge: '/icon.png',
      tag: 'swingbot-alert',
      ...options
    };

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, defaultOptions);
      });
    } else {
      new Notification(title, defaultOptions);
    }
  } catch (err) {
    console.error('Bildirim gönderilirken hata:', err);
  }
}