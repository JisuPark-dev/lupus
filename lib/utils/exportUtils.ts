import { LOG_TYPES } from '@/lib/constants/logTypes';
import { LOG_FIELDS } from '@/lib/constants/logFields';
import { MEDICATION_CATEGORIES } from '@/lib/constants/medicationCategories';
import type { HealthLog } from '@/types/logs';
import type { Medication } from '@/types/medications';

// 건강 기록 CSV 내보내기
export function exportLogsToCSV(logs: HealthLog[]): string {
  if (logs.length === 0) return '';

  // 모든 가능한 필드 수집
  const allFields = new Set<string>();
  logs.forEach((log) => {
    Object.keys(log.data).forEach((key) => allFields.add(key));
  });

  const headers = [
    '날짜',
    '기록 유형',
    ...Array.from(allFields),
    '특이사항',
    '생성일시',
  ];

  const rows = logs.map((log) => {
    const typeMeta = LOG_TYPES[log.log_type];
    const values = [
      log.log_date,
      typeMeta?.name || log.log_type,
      ...Array.from(allFields).map((field) => {
        const value = log.data[field];
        if (Array.isArray(value)) return value.join(', ');
        return value ?? '';
      }),
      log.notes || '',
      log.created_at,
    ];
    return values.map(escapeCSV).join(',');
  });

  return [headers.map(escapeCSV).join(','), ...rows].join('\n');
}

// 약물 CSV 내보내기
export function exportMedicationsToCSV(medications: Medication[]): string {
  if (medications.length === 0) return '';

  const headers = [
    '약물명',
    '분류',
    '복용량',
    '복용 빈도',
    '시작일',
    '종료일',
    '메모',
    '생성일시',
  ];

  const rows = medications.map((med) => {
    const categoryMeta = MEDICATION_CATEGORIES[med.category];
    const values = [
      med.name,
      categoryMeta?.name || med.category,
      med.dose || '',
      med.frequency || '',
      med.start_date,
      med.end_date || '복용 중',
      med.notes || '',
      med.created_at,
    ];
    return values.map(escapeCSV).join(',');
  });

  return [headers.map(escapeCSV).join(','), ...rows].join('\n');
}

// CSV 값 이스케이프
function escapeCSV(value: unknown): string {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// CSV 다운로드
export function downloadCSV(content: string, filename: string) {
  const BOM = '\uFEFF'; // Excel에서 한글 인코딩을 위한 BOM
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
