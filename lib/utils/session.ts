import { cookies } from 'next/headers';

export interface KakaoSession {
  member_id: number;
  kakao_id: string;
  nickname: string;
  profile_image?: string;
  email?: string;
  expires_at: number;
}

// 세션에서 member_id 추출
export async function getMemberIdFromSession(): Promise<number | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('kakao_session');

  if (!sessionCookie) return null;

  try {
    const session: KakaoSession = JSON.parse(sessionCookie.value);
    if (session.expires_at && Date.now() > session.expires_at) {
      return null;
    }
    return session.member_id || null;
  } catch {
    return null;
  }
}

// 전체 세션 정보 추출
export async function getSession(): Promise<KakaoSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('kakao_session');

  if (!sessionCookie) return null;

  try {
    const session: KakaoSession = JSON.parse(sessionCookie.value);
    if (session.expires_at && Date.now() > session.expires_at) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}
