'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Message } from '@/types/database';
import LogoutButton from '@/components/auth/LogoutButton';

interface KakaoSession {
  member_id?: number;
  kakao_id: string;
  nickname: string;
  profile_image?: string;
  email?: string;
}

export default function Home() {
  const [user, setUser] = useState<KakaoSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // 세션 확인
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch {
        // 세션 없음
      } finally {
        setIsCheckingSession(false);
      }
    };
    checkSession();
  }, []);

  // 로그인 상태가 확인되면 메시지 가져오기
  useEffect(() => {
    if (!isCheckingSession && user) {
      fetchMessages();
    }
  }, [isCheckingSession, user]);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/messages');
      const data = await res.json();
      if (res.ok) {
        setMessages(data.messages || []);
        setError(null);
      } else if (res.status !== 401) {
        setError(data.error);
      }
    } catch {
      setError('Failed to fetch messages');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (!user) {
      setError('로그인이 필요합니다');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessages((prev) => [data.message, ...prev]);
        setContent('');
      } else {
        setError(data.error);
      }
    } catch {
      setError('Failed to save message');
    } finally {
      setLoading(false);
    }
  };

  // 세션 확인 중일 때는 아무것도 표시하지 않음
  if (isCheckingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col gap-8 bg-white px-8 py-16 dark:bg-black">
        {/* 헤더 */}
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">
            내 메시지
          </h1>
          {user ? (
            <div className="flex items-center gap-4">
              {user.profile_image && (
                <img
                  src={user.profile_image}
                  alt={user.nickname}
                  className="h-8 w-8 rounded-full"
                />
              )}
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {user.nickname}
              </span>
              <LogoutButton />
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-[#FEE500] px-4 py-2 text-sm font-medium text-[#000000D9] transition-colors hover:bg-[#FDD835]"
            >
              로그인
            </Link>
          )}
        </header>

        {/* 비로그인 상태 안내 */}
        {!user && (
          <div className="rounded-lg bg-zinc-100 p-6 text-center dark:bg-zinc-900">
            <p className="mb-4 text-zinc-600 dark:text-zinc-400">
              로그인하면 나만의 메시지를 저장할 수 있어요
            </p>
            <Link
              href="/login"
              className="inline-block rounded-lg bg-[#FEE500] px-6 py-3 font-medium text-[#000000D9] transition-colors hover:bg-[#FDD835]"
            >
              카카오로 시작하기
            </Link>
          </div>
        )}

        {/* 로그인 상태: 메시지 입력 폼 */}
        {user && (
          <>
            <form onSubmit={handleSubmit} className="flex gap-4">
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="메시지를 입력하세요..."
                className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-black px-6 py-2 text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                {loading ? '저장 중...' : '저장'}
              </button>
            </form>

            {/* 에러 메시지 */}
            {error && (
              <div className="rounded-lg bg-red-100 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                {error}
              </div>
            )}

            {/* 메시지 목록 */}
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-medium text-black dark:text-zinc-50">
                저장된 메시지
              </h2>
              {messages.length === 0 ? (
                <p className="text-zinc-500 dark:text-zinc-400">
                  아직 저장된 메시지가 없어요. 첫 메시지를 작성해보세요!
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {messages.map((msg) => (
                    <li
                      key={msg.id}
                      className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
                    >
                      <p className="text-black dark:text-white">{msg.content}</p>
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        {new Date(msg.created_at).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
