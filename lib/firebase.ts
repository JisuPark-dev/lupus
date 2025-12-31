import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyA_azPGq1NlFwxA9YDGv5rAqZiU2y0bxkY",
  authDomain: "lupus-2a165.firebaseapp.com",
  projectId: "lupus-2a165",
  storageBucket: "lupus-2a165.firebasestorage.app",
  messagingSenderId: "241739084458",
  appId: "1:241739084458:web:8cc08d7b3ceea60aa216d3",
  measurementId: "G-HYGDG3KWNQ"
};

const VAPID_KEY = "BP2FhOdf-TtD0tiPmRsRuhVuosMcBxEPR63rU2Je25EzRrqG_F_R_Jn0qdMx7CqhMFrjh1hOdgBcM3iiJBEYv6g";

let app: FirebaseApp;
let messaging: Messaging | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  }
  return app;
}

export function getFirebaseMessaging(): Messaging | null {
  if (typeof window === 'undefined') return null;

  if (!messaging) {
    try {
      const app = getFirebaseApp();
      messaging = getMessaging(app);
    } catch (error) {
      console.error('Firebase messaging 초기화 실패:', error);
      return null;
    }
  }
  return messaging;
}

export async function requestNotificationPermission(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('알림 권한이 거부되었습니다.');
      return null;
    }

    const messaging = getFirebaseMessaging();
    if (!messaging) return null;

    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    console.log('FCM Token:', token);
    return token;
  } catch (error) {
    console.error('푸시 알림 권한 요청 실패:', error);
    return null;
  }
}

export function onMessageListener(callback: (payload: unknown) => void): (() => void) | null {
  const messaging = getFirebaseMessaging();
  if (!messaging) return null;

  return onMessage(messaging, (payload) => {
    console.log('포그라운드 메시지 수신:', payload);
    callback(payload);
  });
}
