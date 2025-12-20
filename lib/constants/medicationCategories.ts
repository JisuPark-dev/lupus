import type { MedicationCategory, MedicationCategoryMeta } from '@/types/medications';

// 약물 카테고리 정의
export const MEDICATION_CATEGORIES: Record<MedicationCategory, MedicationCategoryMeta> = {
  steroid: {
    name: '스테로이드',
    color: '#EF4444',
  },
  immunosuppressant: {
    name: '면역억제제',
    color: '#8B5CF6',
  },
  antimalarial: {
    name: '항말라리아제',
    color: '#3B82F6',
  },
  painkiller: {
    name: '진통제',
    color: '#F59E0B',
  },
  supplement: {
    name: '보조제/영양제',
    color: '#10B981',
  },
  other: {
    name: '기타',
    color: '#6B7280',
  },
} as const;

// 카테고리 목록 (select용)
export const MEDICATION_CATEGORY_OPTIONS = Object.entries(MEDICATION_CATEGORIES).map(
  ([value, meta]) => ({
    value: value as MedicationCategory,
    label: meta.name,
  })
);

// 복용 빈도 옵션
export const FREQUENCY_OPTIONS = [
  '1일 1회',
  '1일 2회',
  '1일 3회',
  '1일 4회',
  '격일',
  '주 1회',
  '주 2회',
  '월 1회',
  '필요시',
  '기타',
] as const;
