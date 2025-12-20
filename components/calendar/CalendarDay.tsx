'use client';

import { useMemo } from 'react';
import { isDateInRange } from '@/lib/utils/dateUtils';
import { MEDICATION_CATEGORIES } from '@/lib/constants/medicationCategories';
import type { Medication } from '@/types/medications';

interface CalendarDayProps {
  date: Date;
  dateStr: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isSunday: boolean;
  isSaturday: boolean;
  emojis: string[];
  extraCount: number;
  medications: Medication[];
  onClick: () => void;
}

export default function CalendarDay({
  date,
  dateStr,
  isCurrentMonth,
  isToday,
  isSelected,
  isSunday,
  isSaturday,
  emojis,
  extraCount,
  medications,
  onClick,
}: CalendarDayProps) {
  // 해당 날짜에 복용 중인 약물 필터링
  const activeMedications = useMemo(() => {
    return medications.filter((med) =>
      isDateInRange(date, med.start_date, med.end_date)
    );
  }, [medications, date]);

  // 날짜 텍스트 색상
  const getDateTextColor = () => {
    if (!isCurrentMonth) return 'text-gray-300';
    if (isSunday) return 'text-red-500';
    if (isSaturday) return 'text-blue-500';
    return 'text-gray-900';
  };

  return (
    <button
      onClick={onClick}
      className={`relative flex min-h-[56px] flex-col items-center rounded-xl p-1 transition-all active:scale-95 sm:min-h-[72px] ${
        isSelected
          ? 'bg-blue-50 ring-2 ring-blue-500 ring-inset'
          : isToday
          ? 'bg-gradient-to-b from-blue-50 to-transparent'
          : 'hover:bg-gray-50 active:bg-gray-100'
      }`}
    >
      {/* 날짜 */}
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${getDateTextColor()} ${
          isToday ? 'bg-blue-600 text-white' : ''
        }`}
      >
        {date.getDate()}
      </span>

      {/* 이모티콘 */}
      {emojis.length > 0 && (
        <div className="mt-0.5 flex flex-wrap justify-center gap-px">
          {emojis.slice(0, 2).map((emoji, idx) => (
            <span
              key={idx}
              className="text-[10px] leading-none sm:text-sm"
            >
              {emoji}
            </span>
          ))}
          {(emojis.length > 2 || extraCount > 0) && (
            <span className="text-[9px] font-medium text-gray-400 sm:text-[10px]">
              +{emojis.length > 2 ? emojis.length - 2 + extraCount : extraCount}
            </span>
          )}
        </div>
      )}

      {/* 약물 바 */}
      {activeMedications.length > 0 && (
        <div className="absolute bottom-0.5 left-1 right-1 flex flex-col gap-px">
          {activeMedications.slice(0, 2).map((med) => (
            <div
              key={med.id}
              className="h-1 w-full rounded-full opacity-80"
              style={{ backgroundColor: MEDICATION_CATEGORIES[med.category].color }}
            />
          ))}
          {activeMedications.length > 2 && (
            <div className="h-1 w-full rounded-full bg-gray-300" />
          )}
        </div>
      )}
    </button>
  );
}
