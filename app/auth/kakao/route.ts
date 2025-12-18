import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.KAKAO_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/kakao/callback`;

  if (!clientId) {
    return NextResponse.json(
      { error: 'KAKAO_CLIENT_ID is not configured' },
      { status: 500 }
    );
  }

  const kakaoAuthUrl = new URL('https://kauth.kakao.com/oauth/authorize');
  kakaoAuthUrl.searchParams.set('client_id', clientId);
  kakaoAuthUrl.searchParams.set('redirect_uri', redirectUri);
  kakaoAuthUrl.searchParams.set('response_type', 'code');

  return NextResponse.redirect(kakaoAuthUrl.toString());
}
