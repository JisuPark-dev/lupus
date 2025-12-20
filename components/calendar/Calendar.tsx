'use client';

import { useState, useMemo, useRef } from 'react';
import {
  getCalendarDays,
  formatDate,
  isToday,
  isSameMonth,
  MONTH_NAMES,
  DAY_NAMES,
} from '@/lib/utils/dateUtils';
import { LOG_TYPES } from '@/lib/constants/logTypes';
import type { HealthLog } from '@/types/logs';
import type { Medication } from '@/types/medications';
import CalendarDay from './CalendarDay';

interface CalendarProps {
  logs: HealthLog[];
  medications: Medication[];
  onDateClick: (date: string) => void;
  selectedDate: string | null;
}

export default function Calendar({
  logs,
  medications,
  onDateClick,
  selectedDate,
}: CalendarProps) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const calendarRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);

  // 달력 날짜 생성
  const calendarDays = useMemo(
    () => getCalendarDays(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

  // 날짜별 기록 맵
  const logsByDate = useMemo(() => {
    const map: Record<string, HealthLog[]> = {};
    logs.forEach((log) => {
      if (!map[log.log_date]) {
        map[log.log_date] = [];
      }
      map[log.log_date].push(log);
    });
    return map;
  }, [logs]);

  // 이전 달로 이동
  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // 다음 달로 이동
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // 오늘로 이동
  const goToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  // 스와이프로 월 변경
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToNextMonth();
      } else {
        goToPrevMonth();
      }
    }
  };

  // 날짜의 이모티콘 목록 가져오기 (최대 4개)
  const getEmojisForDate = (dateStr: string): string[] => {
    const dayLogs = logsByDate[dateStr] || [];
    const emojis = dayLogs
      .map((log) => LOG_TYPES[log.log_type]?.emoji)
      .filter(Boolean);
    return emojis.slice(0, 4);
  };

  // 날짜에 추가 기록 수 가져오기
  const getExtraCount = (dateStr: string): number => {
    const dayLogs = logsByDate[dateStr] || [];
    return Math.max(0, dayLogs.length - 4);
  };

  return (
    <div
      ref={calendarRef}
      className="overflow-hidden rounded-2xl bg-white shadow-sm"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <button
          onClick={goToPrevMonth}
          className="flex h-11 w-11 items-center justify-center rounded-xl text-gray-500 transition-colors active:bg-gray-100"
          aria-label="이전 달"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-gray-900">
            {currentYear}년 {MONTH_NAMES[currentMonth]}
          </h2>
          <button
            onClick={goToToday}
            className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition-colors active:bg-blue-100"
          >
            오늘
          </button>
        </div>

        <button
          onClick={goToNextMonth}
          className="flex h-11 w-11 items-center justify-center rounded-xl text-gray-500 transition-colors active:bg-gray-100"
          aria-label="다음 달"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 border-b border-gray-100 px-2 pb-2">
        {DAY_NAMES.map((day, index) => (
          <div
            key={day}
            className={`py-2 text-center text-xs font-semibold ${
              index === 0 ? 'text-red-400' : index === 6 ? 'text-blue-400' : 'text-gray-400'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5 p-2">
        {calendarDays.map((date, index) => {
          const dateStr = formatDate(date);
          const isCurrentMonth = isSameMonth(date, currentYear, currentMonth);
          const isTodayDate = isToday(date);
          const isSelected = selectedDate === dateStr;
          const emojis = getEmojisForDate(dateStr);
          const extraCount = getExtraCount(dateStr);
          const dayOfWeek = date.getDay();

          return (
            <CalendarDay
              key={index}
              date={date}
              dateStr={dateStr}
              isCurrentMonth={isCurrentMonth}
              isToday={isTodayDate}
              isSelected={isSelected}
              isSunday={dayOfWeek === 0}
              isSaturday={dayOfWeek === 6}
              emojis={emojis}
              extraCount={extraCount}
              medications={medications}
              onClick={() => onDateClick(dateStr)}
            />
          );
        })}
      </div>
    </div>
  );
}
