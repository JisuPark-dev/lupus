import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import KakaoLoginButton from '@/components/auth/KakaoLoginButton';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get('kakao_session');

  // 이미 로그인된 경우 메인 페이지로 리다이렉트
  if (session) {
    redirect('/');
  }

  const params = await searchParams;
  const error = params.error;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-lg dark:bg-zinc-900">
        <h1 className="mb-2 text-center text-2xl font-bold text-black dark:text-white">
          로그인
        </h1>
        <p className="mb-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
          카카오 계정으로 간편하게 로그인하세요
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
            {error === 'kakao_auth_failed'
              ? '카카오 로그인에 실패했습니다. 다시 시도해주세요.'
              : '로그인 중 오류가 발생했습니다.'}
          </div>
        )}

        <KakaoLoginButton />

        <p className="mt-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
          로그인 시 서비스 이용약관에 동의하게 됩니다
        </p>
      </div>
    </div>
  );
}
