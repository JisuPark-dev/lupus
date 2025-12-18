import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

interface KakaoTokenResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope?: string;
  refresh_token_expires_in: number;
}

interface KakaoUserResponse {
  id: number;
  connected_at: string;
  properties?: {
    nickname?: string;
    profile_image?: string;
    thumbnail_image?: string;
  };
  kakao_account?: {
    profile_nickname_needs_agreement?: boolean;
    profile_image_needs_agreement?: boolean;
    profile?: {
      nickname?: string;
      thumbnail_image_url?: string;
      profile_image_url?: string;
      is_default_image?: boolean;
    };
    has_email?: boolean;
    email_needs_agreement?: boolean;
    is_email_valid?: boolean;
    is_email_verified?: boolean;
    email?: string;
  };
}

// 랜덤 한글 닉네임 생성
function generateRandomNickname(): string {
  const adjectives = [
    '행복한', '즐거운', '신나는', '빛나는', '멋진',
    '귀여운', '용감한', '지혜로운', '따뜻한', '시원한',
    '달콤한', '상큼한', '활발한', '차분한', '든든한',
    '반짝이는', '포근한', '씩씩한', '재빠른', '느긋한',
  ];
  const nouns = [
    '호랑이', '토끼', '여우', '곰돌이', '사자',
    '펭귄', '코알라', '판다', '강아지', '고양이',
    '다람쥐', '부엉이', '돌고래', '햄스터', '수달',
    '너구리', '사슴', '앵무새', '거북이', '고래',
  ];

  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const timestamp = Date.now().toString().slice(-4);

  return `${adj}${noun}${timestamp}`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  if (error || !code) {
    console.error('Kakao auth error:', error);
    return NextResponse.redirect(`${baseUrl}/login?error=kakao_auth_failed`);
  }

  try {
    // 1. 카카오 토큰 교환
    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.KAKAO_CLIENT_ID!,
        client_secret: process.env.KAKAO_CLIENT_SECRET || '',
        redirect_uri: `${baseUrl}/auth/kakao/callback`,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      throw new Error('Failed to exchange token');
    }

    const tokenData: KakaoTokenResponse = await tokenResponse.json();

    // 2. 카카오 사용자 정보 조회
    const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const kakaoUser: KakaoUserResponse = await userResponse.json();

    // 3. 사용자 정보 추출
    const kakaoId = kakaoUser.id.toString();
    const profileImage =
      kakaoUser.kakao_account?.profile?.profile_image_url ||
      kakaoUser.properties?.profile_image ||
      null;
    const email = kakaoUser.kakao_account?.email || null;

    // 4. Supabase 클라이언트 생성
    const cookieStore = await cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    // 5. 회원 조회 또는 생성
    const { data: existingMember } = await supabase
      .from('members')
      .select('*')
      .eq('kakao_id', kakaoId)
      .single();

    let member = existingMember;

    if (!existingMember) {
      // 신규 회원 - 회원가입 (랜덤 닉네임 생성)
      const randomNickname = generateRandomNickname();

      const { data: newMember, error: insertError } = await supabase
        .from('members')
        .insert({
          kakao_id: kakaoId,
          nickname: randomNickname,
          profile_image: profileImage,
          email,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Member insert error:', insertError);
        throw new Error('Failed to create member');
      }

      member = newMember;
      console.log('New member created:', kakaoId, 'nickname:', randomNickname);
    } else {
      // 기존 회원 - 로그인 (닉네임 변경 안함)
      member = existingMember;
      console.log('Existing member logged in:', kakaoId);
    }

    // 6. 세션 쿠키 설정 (7일 유지)
    const SEVEN_DAYS = 60 * 60 * 24 * 7;
    const sessionData = {
      member_id: member?.id,
      kakao_id: kakaoId,
      nickname: member?.nickname,
      profile_image: member?.profile_image || profileImage,
      email: member?.email || email,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: Date.now() + SEVEN_DAYS * 1000,
    };

    const response = NextResponse.redirect(baseUrl);

    response.cookies.set('kakao_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: false, // 개발 환경에서도 작동하도록
      sameSite: 'lax',
      maxAge: SEVEN_DAYS,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Kakao auth callback error:', err);
    return NextResponse.redirect(`${baseUrl}/login?error=auth_failed`);
  }
}
