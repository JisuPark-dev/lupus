import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('kakao_session');

  if (!sessionCookie) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const session = JSON.parse(sessionCookie.value);

    // 세션 만료 확인
    if (session.expires_at && Date.now() > session.expires_at) {
      return NextResponse.json({ user: null, error: 'Session expired' }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        member_id: session.member_id,
        kakao_id: session.kakao_id,
        nickname: session.nickname,
        profile_image: session.profile_image,
        email: session.email,
      },
    });
  } catch {
    return NextResponse.json({ user: null, error: 'Invalid session' }, { status: 401 });
  }
}
