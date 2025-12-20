'use client';

import { useMemo } from 'react';
import { formatDate, isDateInRange, daysBetween, formatDuration } from '@/lib/utils/dateUtils';
import { MEDICATION_CATEGORIES } from '@/lib/constants/medicationCategories';
import type { Medication } from '@/types/medications';

interface MedicationSummaryProps {
  medications: Medication[];
  selectedDate: string;
}

export default function MedicationSummary({
  medications,
  selectedDate,
}: MedicationSummaryProps) {
  const today = formatDate(new Date());

  // 선택된 날짜에 복용 중인 약물
  const activeMedications = useMemo(() => {
    const date = new Date(selectedDate);
    return medications.filter((med) =>
      isDateInRange(date, med.start_date, med.end_date)
    );
  }, [medications, selectedDate]);

  if (activeMedications.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
          <span>💊</span>
          복용 약물
        </h3>
        <p className="text-center text-sm text-gray-400 py-4">
          이 날짜에 복용 중인 약물이 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
        <span>💊</span>
        복용 약물
        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600">
          {activeMedications.length}
        </span>
      </h3>

      <div className="space-y-2">
        {activeMedications.map((med) => {
          const category = MEDICATION_CATEGORIES[med.category];
          const days = daysBetween(med.start_date, selectedDate > today ? today : selectedDate);
          const duration = formatDuration(days + 1);

          return (
            <div
              key={med.id}
              className="flex items-center gap-3 rounded-xl bg-gray-50 p-3"
            >
              {/* 카테고리 색상 */}
              <div
                className="h-8 w-1 flex-shrink-0 rounded-full"
                style={{ backgroundColor: category.color }}
              />

              <div className="min-w-0 flex-1">
                {/* 약물명 */}
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 truncate">
                    {med.name}
                  </span>
                  <span
                    className="flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium"
                    style={{
                      backgroundColor: `${category.color}15`,
                      color: category.color,
                    }}
                  >
                    {category.name}
                  </span>
                </div>

                {/* 복용 정보 */}
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-gray-500">
                  {med.dose && <span>{med.dose}</span>}
                  {med.dose && med.frequency && <span>·</span>}
                  {med.frequency && <span>{med.frequency}</span>}
                  <span className="text-gray-400">({duration}째)</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
