import type { LogType, FieldDefinition } from '@/types/logs';

// 기록 타입별 필드 정의
export const LOG_FIELDS: Record<LogType, FieldDefinition[]> = {
  // 정기기록
  routine: [
    { id: 'condition', label: '전반 컨디션 점수', type: 'range', min: 1, max: 10 },
    { id: 'fatigue', label: '피로도', type: 'range', min: 1, max: 10 },
    {
      id: 'painAreas',
      label: '통증 부위 요약',
      type: 'multiselect',
      options: ['관절', '근육', '두통', '복부', '흉부', '피부', '기타'],
    },
    { id: 'worstSymptom', label: '최근 1주일 중 가장 힘들었던 증상', type: 'textarea' },
    {
      id: 'steroidChange',
      label: '스테로이드 용량',
      type: 'select',
      options: ['유지', '증량', '감량', '중단'],
    },
    { id: 'steroidDose', label: '현재 용량', type: 'number', unit: 'mg' },
  ],

  // 검사 결과
  lab: [
    { id: 'c3', label: 'C3', type: 'number', unit: 'mg/dL' },
    { id: 'c4', label: 'C4', type: 'number', unit: 'mg/dL' },
    { id: 'antiDsDna', label: 'anti-dsDNA', type: 'number', unit: 'IU/mL' },
    { id: 'wbc', label: 'WBC', type: 'number', unit: '/μL' },
    { id: 'hgb', label: 'Hemoglobin', type: 'number', unit: 'g/dL' },
    { id: 'plt', label: 'Platelet', type: 'number', unit: '×10³/μL' },
    { id: 'esr', label: 'ESR', type: 'number', unit: 'mm/hr' },
    { id: 'crp', label: 'CRP', type: 'number', unit: 'mg/L' },
    {
      id: 'urineProtein',
      label: '요단백',
      type: 'select',
      options: ['-', '±', '+', '++', '+++'],
    },
    { id: 'creatinine', label: 'Creatinine', type: 'number', unit: 'mg/dL' },
  ],

  // 이벤트성 증상
  flare: [
    {
      id: 'symptomType',
      label: '증상 유형',
      type: 'multiselect',
      options: ['발열', '관절통', '피부발진', '부종', '극심한 피로', '호흡곤란', '두통', '기타'],
    },
    { id: 'severity', label: '심각도', type: 'range', min: 1, max: 10 },
    {
      id: 'triggers',
      label: '유발 요인 추정',
      type: 'multiselect',
      options: ['수면부족', '스트레스', '감염', '과로', '햇빛노출', '음식', '약물', '모름', '기타'],
    },
    { id: 'duration', label: '지속 시간', type: 'text', placeholder: '예: 3일' },
    { id: 'response', label: '대응 방법', type: 'textarea' },
    { id: 'recoveryTime', label: '회복까지 걸린 시간', type: 'text', placeholder: '예: 1주일' },
  ],

  // 약물 변경 (숨김)
  medication: [
    { id: 'medicationName', label: '약물명', type: 'text' },
    {
      id: 'changeType',
      label: '변경 유형',
      type: 'select',
      options: ['시작', '용량 증가', '용량 감소', '중단'],
    },
    { id: 'previousDose', label: '이전 용량', type: 'text' },
    { id: 'newDose', label: '변경 용량', type: 'text' },
    { id: 'reason', label: '변경 이유', type: 'textarea' },
  ],

  // 생활·트리거
  lifestyle: [
    { id: 'sleepHours', label: '수면 시간', type: 'number', unit: '시간' },
    { id: 'sleepQuality', label: '수면 질', type: 'range', min: 1, max: 10 },
    { id: 'stressLevel', label: '스트레스 수준', type: 'range', min: 1, max: 10 },
    { id: 'stressEvents', label: '스트레스 사건', type: 'textarea' },
    {
      id: 'infection',
      label: '감염 여부',
      type: 'select',
      options: ['없음', '감기', '독감', '요로감염', '기타'],
    },
    {
      id: 'sunExposure',
      label: '햇빛 노출',
      type: 'select',
      options: ['거의 없음', '30분 미만', '30분-1시간', '1시간 이상'],
    },
    {
      id: 'overwork',
      label: '과로 여부',
      type: 'select',
      options: ['아니오', '약간', '많이'],
    },
    { id: 'specialEvents', label: '특별한 일정/여행', type: 'textarea' },
  ],

  // 회복 기록
  recovery: [
    { id: 'recoveredFrom', label: '회복한 증상', type: 'text' },
    { id: 'recoveryDuration', label: '회복까지 걸린 시간', type: 'text' },
    { id: 'helpfulActions', label: '가장 도움이 됐던 행동', type: 'textarea' },
    { id: 'avoidActions', label: '피해야 할 행동', type: 'textarea' },
    { id: 'lessonsLearned', label: '배운 점', type: 'textarea' },
  ],

  // 의료 방문
  visit: [
    {
      id: 'visitType',
      label: '방문 유형',
      type: 'select',
      options: ['정기 외래', '임시 외래', '응급실', '입원', '퇴원', '기타'],
    },
    { id: 'hospital', label: '병원명', type: 'text' },
    { id: 'doctor', label: '담당의', type: 'text' },
    { id: 'doctorSummary', label: '의사 설명 요약', type: 'textarea' },
    { id: 'planChanges', label: '변경된 계획', type: 'textarea' },
    { id: 'nextGoal', label: '다음 목표', type: 'textarea' },
    { id: 'nextVisit', label: '다음 방문일', type: 'date' },
  ],

  // 감정·심리
  mental: [
    { id: 'mood', label: '전반적 기분', type: 'range', min: 1, max: 10 },
    { id: 'anxiety', label: '불안 수준', type: 'range', min: 1, max: 10 },
    { id: 'depression', label: '우울 수준', type: 'range', min: 1, max: 10 },
    { id: 'frustration', label: '좌절감', type: 'textarea' },
    { id: 'thoughts', label: '병에 대한 생각', type: 'textarea' },
    { id: 'gratitude', label: '감사한 점', type: 'textarea' },
    { id: 'support', label: '필요한 지원', type: 'textarea' },
  ],
};

// 모든 기록 타입에 공통으로 추가되는 notes 필드
export const NOTES_FIELD: FieldDefinition = {
  id: 'notes',
  label: '특이사항',
  type: 'textarea',
  placeholder: '기타 메모할 내용',
};
