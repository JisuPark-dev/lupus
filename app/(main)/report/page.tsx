'use client';

import { useState, useEffect, useMemo } from 'react';
import { formatDate, daysBetween } from '@/lib/utils/dateUtils';
import { LOG_TYPES } from '@/lib/constants/logTypes';
import type { HealthLog } from '@/types/logs';
import type { Medication } from '@/types/medications';

type Period = '1week' | '1month' | '3months';

export default function ReportPage() {
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('1month');
  const [copied, setCopied] = useState(false);

  const today = new Date();

  // 기간 계산
  const dateRange = useMemo(() => {
    const end = formatDate(today);
    let start: string;

    switch (period) {
      case '1week':
        start = formatDate(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000));
        break;
      case '1month':
        start = formatDate(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000));
        break;
      case '3months':
        start = formatDate(new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000));
        break;
    }

    return { start, end };
  }, [period]);

  // 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [logsRes, medsRes] = await Promise.all([
          fetch(`/api/health-logs?startDate=${dateRange.start}&endDate=${dateRange.end}`),
          fetch('/api/medications'),
        ]);

        if (logsRes.ok) {
          const data = await logsRes.json();
          setLogs(data.logs || []);
        }

        if (medsRes.ok) {
          const data = await medsRes.json();
          setMedications(data.medications || []);
        }
      } catch {
        // 에러 처리
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  // 통계 계산
  const stats = useMemo(() => {
    const totalLogs = logs.length;
    const uniqueDays = new Set(logs.map((l) => l.log_date)).size;

    // 평균 컨디션/피로도 (routine 기록에서)
    const routineLogs = logs.filter((l) => l.log_type === 'routine');
    const avgCondition =
      routineLogs.length > 0
        ? routineLogs.reduce((sum, l) => sum + ((l.data.condition as number) || 0), 0) /
          routineLogs.length
        : 0;
    const avgFatigue =
      routineLogs.length > 0
        ? routineLogs.reduce((sum, l) => sum + ((l.data.fatigue as number) || 0), 0) /
          routineLogs.length
        : 0;

    // 플레어 횟수
    const flareCount = logs.filter((l) => l.log_type === 'flare').length;

    // 현재 복용 약물 수
    const todayStr = formatDate(today);
    const activeMeds = medications.filter(
      (m) => (!m.end_date || m.end_date >= todayStr) && m.start_date <= todayStr
    );

    // 타입별 분포
    const typeCounts: Record<string, number> = {};
    logs.forEach((l) => {
      typeCounts[l.log_type] = (typeCounts[l.log_type] || 0) + 1;
    });

    return {
      totalLogs,
      uniqueDays,
      avgCondition: avgCondition.toFixed(1),
      avgFatigue: avgFatigue.toFixed(1),
      flareCount,
      activeMedsCount: activeMeds.length,
      typeCounts,
    };
  }, [logs, medications]);

  // AI 프롬프트 생성
  const generateAIPrompt = () => {
    const periodText = period === '1week' ? '1주일' : period === '1month' ? '1개월' : '3개월';

    let prompt = `다음은 루푸스 환자의 최근 ${periodText}간 건강 기록 요약입니다. 이 데이터를 바탕으로 건강 상태 분석과 조언을 부탁드립니다.\n\n`;

    prompt += `## 기본 통계\n`;
    prompt += `- 총 기록 수: ${stats.totalLogs}건\n`;
    prompt += `- 기록한 날 수: ${stats.uniqueDays}일\n`;
    prompt += `- 평균 컨디션: ${stats.avgCondition}점 (10점 만점)\n`;
    prompt += `- 평균 피로도: ${stats.avgFatigue}점 (10점 만점)\n`;
    prompt += `- 이벤트성 증상 발생: ${stats.flareCount}회\n`;
    prompt += `- 현재 복용 약물: ${stats.activeMedsCount}종\n\n`;

    prompt += `## 기록 타입별 분포\n`;
    Object.entries(stats.typeCounts).forEach(([type, count]) => {
      const meta = LOG_TYPES[type as keyof typeof LOG_TYPES];
      if (meta) {
        prompt += `- ${meta.name}: ${count}건\n`;
      }
    });

    prompt += `\n## 주요 기록 내용\n`;
    logs.slice(0, 10).forEach((log) => {
      const meta = LOG_TYPES[log.log_type];
      prompt += `- [${log.log_date}] ${meta?.name}: `;
      const summaryParts: string[] = [];
      Object.entries(log.data).forEach(([key, value]) => {
        if (value && !key.endsWith('_other')) {
          if (Array.isArray(value)) {
            summaryParts.push(value.join(', '));
          } else {
            summaryParts.push(String(value));
          }
        }
      });
      prompt += summaryParts.slice(0, 3).join(' / ');
      if (log.notes) prompt += ` (${log.notes})`;
      prompt += '\n';
    });

    return prompt;
  };

  const handleCopyPrompt = () => {
    const prompt = generateAIPrompt();
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">보고서</h1>
      </div>

      {/* 기간 선택 */}
      <div className="flex gap-2 rounded-xl bg-white p-1 shadow-sm">
        {[
          { value: '1week', label: '1주일' },
          { value: '1month', label: '1개월' },
          { value: '3months', label: '3개월' },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setPeriod(option.value as Period)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              period === option.value
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="총 기록 수" value={`${stats.totalLogs}건`} color="#3B82F6" />
        <StatCard label="기록한 날 수" value={`${stats.uniqueDays}일`} color="#8B5CF6" />
        <StatCard label="평균 컨디션" value={`${stats.avgCondition}점`} color="#10B981" />
        <StatCard label="평균 피로도" value={`${stats.avgFatigue}점`} color="#F59E0B" />
        <StatCard label="이벤트성 증상" value={`${stats.flareCount}회`} color="#EF4444" />
        <StatCard label="복용 약물" value={`${stats.activeMedsCount}종`} color="#EC4899" />
      </div>

      {/* 타입별 분포 */}
      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">기록 타입별 분포</h2>
        {stats.totalLogs === 0 ? (
          <p className="text-center text-gray-500">기록이 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(stats.typeCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([type, count]) => {
                const meta = LOG_TYPES[type as keyof typeof LOG_TYPES];
                if (!meta) return null;
                const percentage = Math.round((count / stats.totalLogs) * 100);
                return (
                  <div key={type} className="flex items-center gap-3">
                    <span className="text-xl">{meta.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-700">{meta.name}</span>
                        <span className="text-gray-500">
                          {count}건 ({percentage}%)
                        </span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: meta.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </section>

      {/* AI 프롬프트 */}
      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-gray-900">AI 분석 요청</h2>
        <p className="mb-4 text-sm text-gray-500">
          기록 데이터를 AI에게 분석 요청할 수 있는 프롬프트를 생성합니다.
        </p>
        <button
          onClick={handleCopyPrompt}
          disabled={stats.totalLogs === 0}
          className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {copied ? '복사 완료!' : '프롬프트 복사하기'}
        </button>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold" style={{ color }}>
        {value}
      </p>
    </div>
  );
}
