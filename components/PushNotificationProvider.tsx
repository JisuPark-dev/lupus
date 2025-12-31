'use client';

import { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { requestNotificationPermission, onMessageListener } from '@/lib/firebase';

interface PushNotificationContextType {
  fcmToken: string | null;
  isSupported: boolean;
  requestPermission: () => Promise<void>;
}

const PushNotificationContext = createContext<PushNotificationContextType>({
  fcmToken: null,
  isSupported: false,
  requestPermission: async () => {},
});

export function usePushNotification() {
  return useContext(PushNotificationContext);
}

interface Props {
  children: ReactNode;
}

export function PushNotificationProvider({ children }: Props) {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const checkSupport = () => {
      const supported =
        typeof window !== 'undefined' &&
        'Notification' in window &&
        'serviceWorker' in navigator &&
        'PushManager' in window;
      setIsSupported(supported);
    };

    checkSupport();

    // PWA Service Worker 등록
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
  }, []);

  useEffect(() => {
    if (!isSupported) return;

    const unsubscribe = onMessageListener((payload) => {
      const notification = (payload as { notification?: { title?: string; body?: string } }).notification;
      if (notification && Notification.permission === 'granted') {
        new Notification(notification.title || '알림', {
          body: notification.body,
          icon: '/icons/icon-192x192.png',
        });
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isSupported]);

  const requestPermission = async () => {
    if (!isSupported) return;
    const token = await requestNotificationPermission();
    if (token) {
      setFcmToken(token);
    }
  };

  return (
    <PushNotificationContext.Provider value={{ fcmToken, isSupported, requestPermission }}>
      {children}
    </PushNotificationContext.Provider>
  );
}
