'use client';

import { LOG_TYPES } from '@/lib/constants/logTypes';
import { LOG_FIELDS } from '@/lib/constants/logFields';
import type { HealthLog, LogData } from '@/types/logs';

interface LogListProps {
  logs: HealthLog[];
  onLogClick: (log: HealthLog) => void;
}

export default function LogList({ logs, onLogClick }: LogListProps) {
  if (logs.length === 0) {
    return (
      <div className="rounded-xl bg-white p-8 text-center shadow-sm">
        <p className="text-gray-500">이 날짜에 기록이 없습니다.</p>
        <p className="mt-1 text-sm text-gray-400">+ 버튼을 눌러 새 기록을 추가하세요.</p>
      </div>
    );
  }

  // 데이터에서 주요 정보 추출
  const getSummary = (log: HealthLog): string => {
    const fields = LOG_FIELDS[log.log_type] || [];
    const summaryParts: string[] = [];

    fields.slice(0, 2).forEach((field) => {
      const value = log.data[field.id];
      if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
        return;
      }

      if (field.type === 'range') {
        summaryParts.push(`${field.label}: ${value}`);
      } else if (field.type === 'multiselect' && Array.isArray(value)) {
        summaryParts.push(value.slice(0, 3).join(', '));
      } else if (typeof value === 'string' && value.length > 0) {
        summaryParts.push(value.slice(0, 30) + (value.length > 30 ? '...' : ''));
      }
    });

    return summaryParts.join(' · ') || '상세 내용 보기';
  };

  return (
    <div className="space-y-2">
      {logs.map((log) => {
        const meta = LOG_TYPES[log.log_type];
        const summary = getSummary(log);

        return (
          <button
            key={log.id}
            onClick={() => onLogClick(log)}
            className="w-full rounded-xl bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-lg text-xl"
                style={{ backgroundColor: `${meta.color}15` }}
              >
                {meta.emoji}
              </span>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{meta.name}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(log.created_at).toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-sm text-gray-500">{summary}</p>
              </div>
              <svg
                className="h-5 w-5 flex-shrink-0 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>
        );
      })}
    </div>
  );
}
