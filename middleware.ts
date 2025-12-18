import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function isValidSession(sessionCookie: string | undefined): boolean {
  if (!sessionCookie) return false;

  try {
    const session = JSON.parse(sessionCookie);
    // 세션 만료 확인
    if (session.expires_at && Date.now() > session.expires_at) {
      return false;
    }
    // member_id 존재 확인
    return !!session.member_id;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('kakao_session');
  const isLoggedIn = isValidSession(sessionCookie?.value);

  // 보호된 경로 목록
  const protectedPaths = ['/dashboard', '/profile', '/settings'];
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // 보호된 경로에 비로그인 사용자 접근 시
  if (isProtectedPath && !isLoggedIn) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 이미 로그인한 사용자가 /login 접근 시
  if (request.nextUrl.pathname === '/login' && isLoggedIn) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 다음 경로 제외:
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화)
     * - favicon.ico
     * - public 폴더 파일
     * - api 경로
     * - auth 경로
     */
    '/((?!_next/static|_next/image|favicon.ico|api|auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
