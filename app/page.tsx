'use client';

import { useState, useEffect } from 'react';
import type { Message } from '@/types/database';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/messages');
      const data = await res.json();
      if (res.ok) {
        setMessages(data.messages || []);
      } else {
        setError(data.error);
      }
    } catch {
      setError('Failed to fetch messages');
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

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

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col gap-8 py-16 px-8 bg-white dark:bg-black">
        <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">
          Hello World Messages
        </h1>

        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your message..."
            className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-black px-6 py-2 text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </form>

        {error && (
          <div className="rounded-lg bg-red-100 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-medium text-black dark:text-zinc-50">
            Saved Messages
          </h2>
          {messages.length === 0 ? (
            <p className="text-zinc-500 dark:text-zinc-400">
              No messages yet. Add your first message!
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
      </main>
    </div>
  );
}
