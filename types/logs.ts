// 기록 타입
export type LogType =
  | 'routine'    // 정기기록
  | 'lab'        // 검사 결과
  | 'flare'      // 이벤트성 증상
  | 'medication' // 약물 변경 (숨김)
  | 'lifestyle'  // 생활·트리거
  | 'recovery'   // 회복 기록
  | 'visit'      // 의료 방문
  | 'mental';    // 감정·심리

// 기록 데이터 (JSONB)
export type LogData = Record<string, string | number | string[] | undefined>;

// 건강 기록
export interface HealthLog {
  id: string;
  member_id: number;
  log_date: string;      // YYYY-MM-DD
  log_type: LogType;
  data: LogData;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

// 기록 생성 요청
export interface CreateHealthLogRequest {
  log_date: string;
  log_type: LogType;
  data: LogData;
  notes?: string;
}

// 기록 수정 요청
export interface UpdateHealthLogRequest {
  data?: LogData;
  notes?: string;
}

// 기록 타입 메타데이터
export interface LogTypeMeta {
  name: string;
  emoji: string;
  color: string;
  category: 'daily' | 'symptom' | 'medical' | 'hidden';
}

// 필드 타입
export type FieldType = 'range' | 'select' | 'multiselect' | 'textarea' | 'number' | 'text' | 'date';

// 필드 정의
export interface FieldDefinition {
  id: string;
  label: string;
  type: FieldType;
  options?: string[];
  min?: number;
  max?: number;
  unit?: string;
  placeholder?: string;
  required?: boolean;
}
