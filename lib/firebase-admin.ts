import admin from 'firebase-admin';

let firebaseAdminApp: admin.app.App | null = null;

const getFirebaseAdmin = (): admin.app.App | null => {
  if (firebaseAdminApp) {
    return firebaseAdminApp;
  }

  if (admin.apps.length > 0) {
    firebaseAdminApp = admin.apps[0]!;
    return firebaseAdminApp;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // .env에서 따옴표로 감싸져 있을 수 있으므로 제거하고, \n을 실제 줄바꿈으로 변환
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (privateKey) {
    privateKey = privateKey.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');
  }

  // 환경 변수가 없으면 null 반환
  if (!projectId || !clientEmail || !privateKey) {
    console.warn('Firebase Admin SDK 환경 변수가 설정되지 않았습니다.');
    return null;
  }

  firebaseAdminApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  return firebaseAdminApp;
};

export const getMessaging = () => {
  const app = getFirebaseAdmin();
  if (!app) return null;
  return admin.messaging(app);
};

export async function sendPushNotification(
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>
) {
  const messaging = getMessaging();
  if (!messaging) {
    return { success: false, error: 'Firebase Admin SDK가 초기화되지 않았습니다.' };
  }

  try {
    const message = {
      token,
      notification: {
        title,
        body,
      },
      data,
      webpush: {
        fcmOptions: {
          link: '/',
        },
      },
    };

    const response = await messaging.send(message);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('푸시 알림 전송 실패:', error);
    return { success: false, error };
  }
}

export async function sendPushToMultiple(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
) {
  if (tokens.length === 0) return { success: true, successCount: 0 };

  const messaging = getMessaging();
  if (!messaging) {
    return { success: false, error: 'Firebase Admin SDK가 초기화되지 않았습니다.' };
  }

  try {
    const message = {
      tokens,
      notification: {
        title,
        body,
      },
      data,
      webpush: {
        fcmOptions: {
          link: '/',
        },
      },
    };

    const response = await messaging.sendEachForMulticast(message);
    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  } catch (error) {
    console.error('다중 푸시 알림 전송 실패:', error);
    return { success: false, error };
  }
}
