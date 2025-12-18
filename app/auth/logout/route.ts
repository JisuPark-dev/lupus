import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();

  // 카카오 세션 쿠키 삭제
  cookieStore.delete('kakao_session');

  return NextResponse.json({ success: true });
}
