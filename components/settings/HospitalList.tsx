'use client';

import type { UserHospital } from '@/types/hospitals';

interface HospitalListProps {
  hospitals: UserHospital[];
  onEdit: (hospital: UserHospital) => void;
  onDelete: (hospital: UserHospital) => void;
  isDeleting: boolean;
}

export default function HospitalList({
  hospitals,
  onEdit,
  onDelete,
  isDeleting,
}: HospitalListProps) {
  const formatDate = (date: string) => {
    return date.replace(/-/g, '.');
  };

  const formatPeriod = (startDate: string, endDate: string | null) => {
    const start = formatDate(startDate).slice(0, 7); // YYYY.MM
    if (!endDate) {
      return `${start} ~ 현재`;
    }
    const end = formatDate(endDate).slice(0, 7);
    return `${start} ~ ${end}`;
  };

  if (hospitals.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
        <p className="text-sm text-gray-500">등록된 병원이 없습니다</p>
        <p className="mt-1 text-xs text-gray-400">
          자주 가는 병원을 추가해보세요
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {hospitals.map((hospital) => (
        <div
          key={hospital.id}
          className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
        >
          <div className="flex items-start gap-3">
            <span className="text-xl">🏥</span>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900">{hospital.name}</p>
                {hospital.is_primary && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                    주 병원
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">
                {formatPeriod(hospital.start_date, hospital.end_date)}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(hospital)}
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(hospital)}
              disabled={isDeleting}
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
