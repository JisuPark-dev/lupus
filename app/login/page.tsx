import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import KakaoLoginButton from '@/components/auth/KakaoLoginButton';

const features = [
  {
    icon: '📅',
    title: '건강 기록',
    description: '일상의 컨디션, 증상, 의료 방문 등을 쉽게 기록하고 관리하세요.',
  },
  {
    icon: '💊',
    title: '약물 관리',
    description: '복용 중인 약물과 변경 이력을 한눈에 확인할 수 있어요.',
  },
  {
    icon: '📊',
    title: '건강 보고서',
    description: '기록을 바탕으로 나만의 건강 흐름을 파악해보세요.',
  },
];

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
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* 메인 콘텐츠 */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        {/* 로고 & 환영 메시지 */}
        <div className="mb-10 text-center">
          <div className="mb-4 text-6xl">🦋</div>
          <h1 className="mb-3 text-3xl font-bold text-gray-900">
            Lupus Diary
          </h1>
          <p className="text-lg text-gray-600">
            오늘도 당신의 하루를 응원합니다
          </p>
          <p className="mt-2 text-sm text-gray-500">
            작은 기록이 큰 변화를 만들어요
          </p>
        </div>

        {/* 기능 소개 카드 */}
        <div className="mb-10 w-full max-w-sm space-y-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex items-start gap-4 rounded-2xl bg-white/80 p-4 shadow-sm backdrop-blur-sm"
            >
              <span className="text-3xl">{feature.icon}</span>
              <div>
                <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 로그인 섹션 */}
        <div className="w-full max-w-sm">
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 p-4 text-center text-sm text-red-600">
              {error === 'kakao_auth_failed'
                ? '카카오 로그인에 실패했습니다. 다시 시도해주세요.'
                : '로그인 중 오류가 발생했습니다.'}
            </div>
          )}

          <KakaoLoginButton />

          <p className="mt-4 text-center text-xs text-gray-400">
            로그인 시 서비스 이용약관에 동의하게 됩니다
          </p>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="py-6 text-center text-xs text-gray-400">
        루푸스 환우들을 위한 건강 기록 앱
      </footer>
    </div>
  );
}
