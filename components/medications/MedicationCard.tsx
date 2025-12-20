'use client';

import { MEDICATION_CATEGORIES } from '@/lib/constants/medicationCategories';
import { formatDate, daysBetween, formatDuration } from '@/lib/utils/dateUtils';
import type { Medication } from '@/types/medications';

interface MedicationCardProps {
  medication: Medication;
  onEdit: () => void;
  onEnd: () => void;
}

export default function MedicationCard({
  medication,
  onEdit,
  onEnd,
}: MedicationCardProps) {
  const category = MEDICATION_CATEGORIES[medication.category];
  const today = formatDate(new Date());
  const isActive = !medication.end_date || medication.end_date >= today;

  // 복용 기간 계산
  const endDate = medication.end_date || today;
  const days = daysBetween(medication.start_date, endDate);
  const duration = formatDuration(days);

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        {/* 카테고리 색상 표시 */}
        <div
          className="mt-1 h-3 w-3 flex-shrink-0 rounded-full"
          style={{ backgroundColor: category.color }}
        />

        <div className="flex-1">
          {/* 약물명 */}
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{medication.name}</h3>
            <span
              className="rounded-full px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: `${category.color}15`,
                color: category.color,
              }}
            >
              {category.name}
            </span>
          </div>

          {/* 복용량 / 빈도 */}
          {(medication.dose || medication.frequency) && (
            <p className="mt-1 text-sm text-gray-600">
              {medication.dose}
              {medication.dose && medication.frequency && ' · '}
              {medication.frequency}
            </p>
          )}

          {/* 기간 */}
          <p className="mt-1 text-sm text-gray-500">
            {medication.start_date.replace(/-/g, '.')}
            {medication.end_date
              ? ` ~ ${medication.end_date.replace(/-/g, '.')}`
              : ' ~ 현재'}
            <span className="ml-2 text-gray-400">({duration})</span>
          </p>

          {/* 메모 */}
          {medication.notes && (
            <p className="mt-2 text-sm text-gray-500">{medication.notes}</p>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="flex flex-col gap-1">
          <button
            onClick={onEdit}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
          {isActive && (
            <button
              onClick={onEnd}
              className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
              title="복용 종료"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
