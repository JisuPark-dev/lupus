'use client';

export default function KakaoLoginButton() {
  const handleLogin = () => {
    window.location.href = '/auth/kakao';
  };

  return (
    <button
      onClick={handleLogin}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FEE500] px-6 py-3 font-medium text-[#000000D9] transition-colors hover:bg-[#FDD835]"
    >
      <KakaoIcon />
      <span>카카오 로그인</span>
    </button>
  );
}

function KakaoIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 3C6.48 3 2 6.58 2 10.94c0 2.8 1.86 5.27 4.66 6.66-.2.75-.74 2.7-.85 3.12-.13.52.19.51.4.37.17-.11 2.65-1.8 3.73-2.53.68.1 1.38.15 2.06.15 5.52 0 10-3.58 10-7.94S17.52 3 12 3z"
        fill="#000000D9"
      />
    </svg>
  );
}
