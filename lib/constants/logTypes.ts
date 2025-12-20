import type { LogType, LogTypeMeta } from '@/types/logs';

// 기록 타입 정의
export const LOG_TYPES: Record<LogType, LogTypeMeta> = {
  routine: {
    name: '정기기록',
    emoji: '📋',
    color: '#3B82F6',
    category: 'daily',
  },
  lab: {
    name: '검사 결과',
    emoji: '🔬',
    color: '#8B5CF6',
    category: 'medical',
  },
  flare: {
    name: '이벤트성 증상',
    emoji: '🔥',
    color: '#EF4444',
    category: 'symptom',
  },
  medication: {
    name: '약물 변경',
    emoji: '💊',
    color: '#F59E0B',
    category: 'hidden',
  },
  lifestyle: {
    name: '생활·트리거',
    emoji: '🌿',
    color: '#10B981',
    category: 'symptom',
  },
  recovery: {
    name: '회복 기록',
    emoji: '💪',
    color: '#06B6D4',
    category: 'symptom',
  },
  visit: {
    name: '의료 방문',
    emoji: '🏥',
    color: '#EC4899',
    category: 'medical',
  },
  mental: {
    name: '감정·심리',
    emoji: '💭',
    color: '#84CC16',
    category: 'daily',
  },
} as const;

// 기록 카테고리 정의
export const LOG_CATEGORIES = {
  daily: {
    name: '📝 일상 기록',
    types: ['routine', 'mental'] as LogType[],
  },
  symptom: {
    name: '⚡ 증상 관련',
    types: ['flare', 'lifestyle', 'recovery'] as LogType[],
  },
  medical: {
    name: '🏥 의료 기록',
    types: ['visit', 'lab'] as LogType[],
  },
} as const;

// 표시 가능한 기록 타입 (medication 제외)
export const VISIBLE_LOG_TYPES = Object.entries(LOG_TYPES)
  .filter(([, meta]) => meta.category !== 'hidden')
  .map(([type]) => type as LogType);

// 카테고리 키 타입
export type LogCategoryKey = keyof typeof LOG_CATEGORIES;
