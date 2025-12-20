# Lupus Health Tracker - 구현 계획서

> 작성일: 2025-12-20
> 기반 문서: REQUIREMENTS.md

---

## 1. 현재 상태 분석

### 1.1 구현 완료

| 항목 | 파일 위치 | 설명 |
|------|-----------|------|
| 카카오 로그인 | `app/auth/kakao/` | OAuth 인증 플로우 |
| 세션 관리 | `middleware.ts` | 쿠키 기반 세션 |
| members 테이블 | Supabase | 사용자 정보 저장 |
| 기본 UI | `app/page.tsx` | 메시지 샘플 (제거 예정) |

### 1.2 구현 필요

| 항목 | 우선순위 | 복잡도 |
|------|----------|--------|
| health_logs 테이블 | P0 | 중 |
| medications 테이블 | P0 | 중 |
| 건강기록 페이지 (메인) | P0 | 상 |
| 약물 페이지 | P1 | 중 |
| 보고서 페이지 | P2 | 중 |
| 설정 페이지 | P2 | 하 |

---

## 2. Supabase 테이블 SQL

### 2.1 health_logs 테이블

```sql
-- 건강 기록 테이블
CREATE TABLE public.health_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id INTEGER NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    log_type VARCHAR(20) NOT NULL CHECK (log_type IN (
        'routine',      -- 정기기록
        'lab',          -- 검사 결과
        'flare',        -- 이벤트성 증상
        'medication',   -- 약물 변경 (숨김)
        'lifestyle',    -- 생활·트리거
        'recovery',     -- 회복 기록
        'visit',        -- 의료 방문
        'mental'        -- 감정·심리
    )),
    data JSONB NOT NULL DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_health_logs_member_id ON public.health_logs(member_id);
CREATE INDEX idx_health_logs_log_date ON public.health_logs(log_date);
CREATE INDEX idx_health_logs_log_type ON public.health_logs(log_type);
CREATE INDEX idx_health_logs_member_date ON public.health_logs(member_id, log_date);
```

### 2.2 medications 테이블

```sql
-- 약물 테이블
CREATE TABLE public.medications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id INTEGER NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN (
        'steroid',           -- 스테로이드
        'immunosuppressant', -- 면역억제제
        'antimalarial',      -- 항말라리아제
        'painkiller',        -- 진통제
        'supplement',        -- 보조제/영양제
        'other'              -- 기타
    )),
    dose VARCHAR(50),
    frequency VARCHAR(50),
    start_date DATE NOT NULL,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_medications_member_id ON public.medications(member_id);
CREATE INDEX idx_medications_category ON public.medications(category);
CREATE INDEX idx_medications_active ON public.medications(member_id, end_date)
    WHERE end_date IS NULL OR end_date >= CURRENT_DATE;
```

### 2.3 updated_at 트리거

```sql
-- updated_at 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 적용
CREATE TRIGGER update_health_logs_updated_at
    BEFORE UPDATE ON public.health_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medications_updated_at
    BEFORE UPDATE ON public.medications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 3. 프로젝트 구조

```
app/
├── (main)/                      # 인증 필요 페이지 그룹
│   ├── layout.tsx               # 공통 네비게이션
│   ├── page.tsx                 # 건강기록 (Calendar) - 메인
│   ├── medications/
│   │   └── page.tsx             # 약물 페이지
│   ├── report/
│   │   └── page.tsx             # 보고서 페이지
│   └── settings/
│       └── page.tsx             # 설정 페이지
├── api/
│   ├── health-logs/
│   │   ├── route.ts             # GET, POST
│   │   └── [id]/
│   │       └── route.ts         # GET, PUT, DELETE
│   └── medications/
│       ├── route.ts             # GET, POST
│       └── [id]/
│           └── route.ts         # GET, PUT, DELETE
├── login/page.tsx
└── auth/

components/
├── calendar/
│   ├── Calendar.tsx             # 월별 달력
│   ├── CalendarDay.tsx          # 일별 셀
│   ├── CalendarHeader.tsx       # 달력 헤더
│   ├── MedicationBar.tsx        # 약물 복용 바
│   └── LogEmoji.tsx             # 기록 이모티콘
├── logs/
│   ├── LogModal.tsx             # 기록 추가/수정 모달
│   ├── LogTypeSelector.tsx      # 타입 선택 UI
│   ├── LogForm.tsx              # 동적 폼
│   ├── LogDetail.tsx            # 상세보기
│   ├── LogList.tsx              # 기록 목록
│   └── fields/
│       ├── RangeField.tsx       # 슬라이더 (1-10)
│       ├── SelectField.tsx      # 단일 선택
│       ├── MultiSelectField.tsx # 다중 선택
│       ├── TextareaField.tsx    # 텍스트 영역
│       ├── NumberField.tsx      # 숫자 입력
│       ├── TextField.tsx        # 텍스트 입력
│       └── DateField.tsx        # 날짜 선택
├── medications/
│   ├── MedicationCard.tsx       # 약물 카드
│   ├── MedicationModal.tsx      # 추가/수정 모달
│   ├── MedicationList.tsx       # 목록 (현재/종료)
│   └── MedicationForm.tsx       # 입력 폼
├── report/
│   ├── StatsSummary.tsx         # 요약 통계 카드
│   ├── TypeDistribution.tsx     # 타입별 분포
│   └── AIPromptGenerator.tsx    # AI 프롬프트
├── settings/
│   ├── DataStats.tsx            # 데이터 현황
│   ├── ExportButtons.tsx        # 내보내기 버튼
│   └── AppInfo.tsx              # 앱 정보
├── ui/
│   ├── Modal.tsx
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   └── Navigation.tsx
└── auth/
    ├── KakaoLoginButton.tsx
    └── LogoutButton.tsx

lib/
├── constants/
│   ├── logTypes.ts              # 기록 타입 정의
│   ├── logFields.ts             # 필드 스키마
│   └── medicationCategories.ts  # 약물 카테고리
├── utils/
│   ├── dateUtils.ts             # 날짜 헬퍼
│   ├── formatUtils.ts           # 포맷팅
│   └── exportUtils.ts           # CSV 내보내기
├── supabase.ts
├── supabase-server.ts
└── supabase-browser.ts

hooks/
├── useHealthLogs.ts             # 건강 기록 CRUD
├── useMedications.ts            # 약물 CRUD
├── useCalendar.ts               # 달력 상태
└── useSession.ts                # 세션 관리

types/
├── database.ts                  # Supabase 스키마
├── logs.ts                      # 건강 기록 타입
└── medications.ts               # 약물 타입
```

---

## 4. Phase별 구현 계획

### Phase 1: 데이터베이스 및 인프라 (Day 1)

#### 1.1 Supabase 테이블 생성
- [ ] health_logs 테이블 생성
- [ ] medications 테이블 생성
- [ ] 인덱스 및 트리거 설정

#### 1.2 TypeScript 타입 정의
- [ ] `types/logs.ts` 생성
- [ ] `types/medications.ts` 생성
- [ ] `types/database.ts` 확장

#### 1.3 상수 정의
- [ ] `lib/constants/logTypes.ts` - 기록 타입 정의
- [ ] `lib/constants/logFields.ts` - 필드 스키마
- [ ] `lib/constants/medicationCategories.ts` - 약물 카테고리

#### 1.4 API 라우트
- [ ] `app/api/health-logs/route.ts` (GET, POST)
- [ ] `app/api/health-logs/[id]/route.ts` (GET, PUT, DELETE)
- [ ] `app/api/medications/route.ts` (GET, POST)
- [ ] `app/api/medications/[id]/route.ts` (GET, PUT, DELETE)

---

### Phase 2: 건강기록 페이지 - 달력 (Day 2-3)

#### 2.1 레이아웃 구조
- [ ] `app/(main)/layout.tsx` - 네비게이션 포함
- [ ] `components/ui/Navigation.tsx` - 하단 네비게이션

#### 2.2 달력 컴포넌트
- [ ] `components/calendar/Calendar.tsx`
  - 월별 달력 렌더링
  - 이전/다음 달 네비게이션
  - "오늘" 버튼
- [ ] `components/calendar/CalendarHeader.tsx`
  - 년월 표시
  - 네비게이션 버튼
- [ ] `components/calendar/CalendarDay.tsx`
  - 날짜 셀
  - 기록 이모티콘 표시 (최대 4개 + "+N")
  - 약물 바 표시 영역

#### 2.3 기록 관리
- [ ] `components/logs/LogTypeSelector.tsx`
  - 3개 카테고리 (일상/증상/의료)
  - 타입별 이모티콘 및 색상
- [ ] `components/logs/LogForm.tsx`
  - 동적 필드 렌더링
  - "기타" 옵션 처리
  - 특이사항 필드
- [ ] `components/logs/LogModal.tsx`
  - 추가/수정 모드
  - 모바일 최적화 (90vh)
- [ ] `components/logs/LogDetail.tsx`
  - 기록 상세보기
  - 수정/삭제 버튼
- [ ] `components/logs/LogList.tsx`
  - 날짜별 기록 목록

#### 2.4 필드 컴포넌트
- [ ] `RangeField.tsx` - 슬라이더 (1-10)
- [ ] `SelectField.tsx` - 드롭다운
- [ ] `MultiSelectField.tsx` - 다중 선택 버튼
- [ ] `TextareaField.tsx` - 텍스트 영역
- [ ] `NumberField.tsx` - 숫자 + 단위
- [ ] `TextField.tsx` - 텍스트 입력
- [ ] `DateField.tsx` - 날짜 선택

---

### Phase 3: 약물 페이지 (Day 4)

#### 3.1 약물 관리
- [ ] `app/(main)/medications/page.tsx`
- [ ] `components/medications/MedicationList.tsx`
  - 현재 복용 중 섹션
  - 복용 종료 섹션 (그룹화)
- [ ] `components/medications/MedicationCard.tsx`
  - 카테고리별 색상
  - 복용 기간 계산
  - "종료" 버튼
- [ ] `components/medications/MedicationModal.tsx`
- [ ] `components/medications/MedicationForm.tsx`

#### 3.2 달력 연동
- [ ] `components/calendar/MedicationBar.tsx`
  - 주 단위 연속 바
  - 카테고리별 색상
  - 클릭 시 상세 정보

---

### Phase 4: 보고서 페이지 (Day 5)

#### 4.1 통계
- [ ] `app/(main)/report/page.tsx`
- [ ] `components/report/StatsSummary.tsx`
  - 총 기록 수
  - 기록한 날 수
  - 평균 컨디션/피로도
  - 플레어 발생 횟수
  - 복용 약물 수
- [ ] `components/report/TypeDistribution.tsx`
  - 타입별 분포 차트

#### 4.2 AI 프롬프트
- [ ] `components/report/AIPromptGenerator.tsx`
  - 기간별 데이터 요약
  - 클립보드 복사

---

### Phase 5: 설정 페이지 (Day 5)

- [ ] `app/(main)/settings/page.tsx`
- [ ] `components/settings/DataStats.tsx`
- [ ] `components/settings/ExportButtons.tsx`
  - CSV (건강기록)
  - CSV (약물)
- [ ] `components/settings/AppInfo.tsx`

---

## 5. 기록 타입 및 필드 스키마

### 5.1 기록 타입 상수

```typescript
// lib/constants/logTypes.ts
export const LOG_TYPES = {
  routine: {
    name: '정기기록',
    emoji: '📋',
    color: '#3B82F6',
    category: 'daily'
  },
  lab: {
    name: '검사 결과',
    emoji: '🔬',
    color: '#8B5CF6',
    category: 'medical'
  },
  flare: {
    name: '이벤트성 증상',
    emoji: '🔥',
    color: '#EF4444',
    category: 'symptom'
  },
  medication: {
    name: '약물 변경',
    emoji: '💊',
    color: '#F59E0B',
    category: 'hidden'  // UI에서 숨김
  },
  lifestyle: {
    name: '생활·트리거',
    emoji: '🌿',
    color: '#10B981',
    category: 'symptom'
  },
  recovery: {
    name: '회복 기록',
    emoji: '💪',
    color: '#06B6D4',
    category: 'symptom'
  },
  visit: {
    name: '의료 방문',
    emoji: '🏥',
    color: '#EC4899',
    category: 'medical'
  },
  mental: {
    name: '감정·심리',
    emoji: '💭',
    color: '#84CC16',
    category: 'daily'
  },
} as const;

export const LOG_CATEGORIES = {
  daily: {
    name: '📝 일상 기록',
    types: ['routine', 'mental']
  },
  symptom: {
    name: '⚡ 증상 관련',
    types: ['flare', 'lifestyle', 'recovery']
  },
  medical: {
    name: '🏥 의료 기록',
    types: ['visit', 'lab']
  },
} as const;
```

### 5.2 필드 스키마 (예: 정기기록)

```typescript
// lib/constants/logFields.ts
export const LOG_FIELDS = {
  routine: [
    { id: 'condition', label: '전반 컨디션 점수', type: 'range', min: 1, max: 10 },
    { id: 'fatigue', label: '피로도', type: 'range', min: 1, max: 10 },
    {
      id: 'painAreas',
      label: '통증 부위 요약',
      type: 'multiselect',
      options: ['관절', '근육', '두통', '복부', '흉부', '피부', '기타']
    },
    { id: 'worstSymptom', label: '가장 힘들었던 증상', type: 'textarea' },
    {
      id: 'steroidChange',
      label: '스테로이드 용량',
      type: 'select',
      options: ['유지', '증량', '감량', '중단']
    },
    { id: 'steroidDose', label: '현재 용량', type: 'number', unit: 'mg' },
  ],
  // ... 다른 타입들
} as const;
```

---

## 6. API 스펙

### 6.1 Health Logs API

#### GET /api/health-logs
```typescript
// Query params
{
  startDate?: string;  // YYYY-MM-DD
  endDate?: string;    // YYYY-MM-DD
  type?: LogType;
}

// Response
{
  logs: HealthLog[];
}
```

#### POST /api/health-logs
```typescript
// Request body
{
  log_date: string;
  log_type: LogType;
  data: Record<string, any>;
  notes?: string;
}

// Response
{
  log: HealthLog;
}
```

#### PUT /api/health-logs/[id]
```typescript
// Request body
{
  data?: Record<string, any>;
  notes?: string;
}

// Response
{
  log: HealthLog;
}
```

#### DELETE /api/health-logs/[id]
```typescript
// Response
{
  success: true;
}
```

### 6.2 Medications API

#### GET /api/medications
```typescript
// Query params
{
  active?: boolean;  // true = 현재 복용 중만
}

// Response
{
  medications: Medication[];
}
```

#### POST /api/medications
```typescript
// Request body
{
  name: string;
  category: MedicationCategory;
  dose?: string;
  frequency?: string;
  start_date: string;
  end_date?: string;
  notes?: string;
}

// Response
{
  medication: Medication;
}
```

---

## 7. UI/UX 가이드라인

### 7.1 반응형 브레이크포인트
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### 7.2 색상 팔레트
```css
/* 배경 그라데이션 */
background: linear-gradient(to bottom right, #EFF6FF, #F5F3FF, #FDF2F8);

/* 기록 타입 색상 */
--routine: #3B82F6;
--lab: #8B5CF6;
--flare: #EF4444;
--medication: #F59E0B;
--lifestyle: #10B981;
--recovery: #06B6D4;
--visit: #EC4899;
--mental: #84CC16;

/* 약물 카테고리 색상 */
--steroid: #EF4444;
--immunosuppressant: #8B5CF6;
--antimalarial: #3B82F6;
--painkiller: #F59E0B;
--supplement: #10B981;
--other: #6B7280;
```

### 7.3 터치 타겟
- 최소 크기: 44px x 44px
- 버튼 패딩: px-4 py-2 (최소)

### 7.4 모달
- 최대 높이: 90vh
- 스크롤: overflow-y-auto
- 배경: backdrop-blur

---

## 8. 체크리스트

### 배포 전 확인사항
- [ ] Vercel 환경 변수 설정
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `KAKAO_CLIENT_ID`
  - `KAKAO_CLIENT_SECRET`
- [ ] Supabase 테이블 생성 완료
- [ ] 모바일 반응형 테스트
- [ ] 에러 핸들링 확인
- [ ] 로딩 상태 UI 확인

---

## 9. 참고 사항

### 9.1 messages 테이블 정리
현재 샘플용 `messages` 테이블과 관련 코드는 Phase 1 완료 후 제거 예정

### 9.2 RLS 정책
카카오 세션 기반 인증이므로 Supabase RLS 대신 API 레벨에서 `member_id` 필터링 적용

### 9.3 데이터 백업
설정 페이지에서 CSV 내보내기 기능 제공 (로컬 백업용)
