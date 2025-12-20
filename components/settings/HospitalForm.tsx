'use client';

import { useState, useEffect } from 'react';
import { formatDate } from '@/lib/utils/dateUtils';
import type { UserHospital } from '@/types/hospitals';

interface HospitalFormProps {
  hospital?: UserHospital | null;
  onSubmit: (data: {
    name: string;
    start_date: string;
    end_date: string | null;
    is_primary: boolean;
  }) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export default function HospitalForm({
  hospital,
  onSubmit,
  onCancel,
  isLoading,
}: HospitalFormProps) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isOngoing, setIsOngoing] = useState(true);
  const [isPrimary, setIsPrimary] = useState(false);

  useEffect(() => {
    if (hospital) {
      setName(hospital.name);
      setStartDate(hospital.start_date);
      setEndDate(hospital.end_date || '');
      setIsOngoing(!hospital.end_date);
      setIsPrimary(hospital.is_primary);
    } else {
      // 새 병원 추가 시 기본값
      setName('');
      setStartDate(formatDate(new Date()));
      setEndDate('');
      setIsOngoing(true);
      setIsPrimary(false);
    }
  }, [hospital]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: name.trim(),
      start_date: startDate,
      end_date: isOngoing ? null : endDate || null,
      is_primary: isPrimary,
    });
  };

  const isValid = name.trim() && startDate && (isOngoing || endDate);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 병원명 */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          병원명 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 서울대학교병원"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* 시작일 */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          시작일 <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* 현재 다니는 병원 체크박스 */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isOngoing"
          checked={isOngoing}
          onChange={(e) => setIsOngoing(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="isOngoing" className="text-sm text-gray-700">
          현재 다니는 병원
        </label>
      </div>

      {/* 종료일 (현재 다니는 병원이 아닌 경우) */}
      {!isOngoing && (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            종료일 <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      )}

      {/* 주 병원 체크박스 */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isPrimary"
          checked={isPrimary}
          onChange={(e) => setIsPrimary(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="isPrimary" className="text-sm text-gray-700">
          주 병원으로 설정
        </label>
        <span className="text-xs text-gray-400">
          (의료방문 기록 시 기본값으로 사용)
        </span>
      </div>

      {/* 버튼 */}
      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg border border-gray-300 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={!isValid || isLoading}
          className="flex-1 rounded-lg bg-blue-600 py-2.5 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-300"
        >
          {isLoading ? '저장 중...' : hospital ? '수정' : '추가'}
        </button>
      </div>
    </form>
  );
}
