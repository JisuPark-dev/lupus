# 루푸스 건강 기록 앱 (Lupus Health Tracker)

## 📋 프로젝트 개요

### 목적
루푸스(전신성 홍반성 루푸스, SLE) 환자가 일상적인 건강 상태, 증상, 약물 복용, 검사 결과 등을 체계적으로 기록하고 관리할 수 있는 웹 애플리케이션

### 대상 사용자
- 루푸스 환자 본인
- 환자 보호자/가족

---

## 🏗️ 시스템 아키텍처

### 페이지 구조
```
├── 📅 건강기록 (Calendar Page) - 메인 페이지
├── 💊 약물 (Medications Page)
├── 📊 보고서 (Report Page)
└── ⚙️ 설정 (Settings Page)
```

### 데이터 저장소
- `lupus-health-logs`: 건강 기록 데이터
- `lupus-medications`: 약물 정보 데이터

---

## 📱 기능 요구사항

### 1. 건강기록 페이지 (Calendar Page)

#### 1.1 달력 기능
- 월별 달력 표시
- 이전/다음 달 네비게이션
- "오늘" 버튼으로 현재 날짜 이동
- 기록이 있는 날짜에 이모티콘 표시 (최대 4개, 초과 시 "+N" 표시)
- 이모티콘 크기: 모바일 11px, 데스크톱 15px
- 약물 복용 기간을 색상 바로 표시 (주 단위 연속 바)
- 날짜 클릭 시 해당 날짜의 기록 목록 표시

#### 1.2 기록 타입 (7종 + 1 숨김)
| 타입 | 이름 | 이모티콘 | 색상 | 설명 |
|------|------|----------|------|------|
| routine | 정기기록 | 📋 | #3B82F6 | 질병 흐름을 보는 기본선 |
| lab | 검사 결과 | 🔬 | #8B5CF6 | 객관 지표 |
| flare | 이벤트성 증상 | 🔥 | #EF4444 | 평소와 다른 증상 발생 시 |
| medication | 약물 변경 | 💊 | #F59E0B | (숨김 처리됨) |
| lifestyle | 생활·트리거 | 🌿 | #10B981 | 악화 원인을 찾는 열쇠 |
| recovery | 회복 기록 | 💪 | #06B6D4 | 증상 완화 후 기록 |
| visit | 의료 방문 | 🏥 | #EC4899 | 외래/입원/응급실 후 |
| mental | 감정·심리 | 💭 | #84CC16 | 마음 상태 기록 |

#### 1.3 기록 추가 모달
- **3개 카테고리로 구분**:
  - 📝 일상 기록: 정기기록, 감정·심리
  - ⚡ 증상 관련: 이벤트성 증상, 생활·트리거, 회복 기록
  - 🏥 의료 기록: 의료 방문, 검사 결과
- 모바일에서 세로 정렬 레이아웃

#### 1.4 기록 필드 타입
| 타입 | 설명 | 예시 |
|------|------|------|
| range | 슬라이더 (1-10) | 컨디션 점수, 피로도 |
| select | 단일 선택 드롭다운 | 스테로이드 용량 변경 |
| multiselect | 다중 선택 버튼 | 통증 부위, 증상 유형 |
| textarea | 텍스트 영역 | 특이사항, 메모 |
| number | 숫자 입력 | 검사 수치 |
| text | 텍스트 입력 | 지속 시간 |
| date | 날짜 선택 | 다음 방문일 |

#### 1.5 "기타" 옵션 처리
- select/multiselect에서 "기타" 선택 시 추가 텍스트 입력창 표시
- 저장 시 `fieldId_other` 키로 저장
- 표시 시 "기타(입력내용)" 형식으로 출력

#### 1.6 모든 기록에 "특이사항" 필드 포함
- 모든 기록 타입 하단에 notes 필드 추가
- placeholder: "기타 메모할 내용"

#### 1.7 기록 상세보기/수정/삭제
- 기록 클릭 시 상세보기 모달
- 수정 버튼으로 편집 모드 전환
- 삭제 시 확인 다이얼로그

---

### 2. 약물 페이지 (Medications Page)

#### 2.1 약물 카테고리 (6종)
| 카테고리 | 이름 | 색상 |
|----------|------|------|
| steroid | 스테로이드 | #EF4444 |
| immunosuppressant | 면역억제제 | #8B5CF6 |
| antimalarial | 항말라리아제 | #3B82F6 |
| painkiller | 진통제 | #F59E0B |
| supplement | 보조제/영양제 | #10B981 |
| other | 기타 | #6B7280 |

#### 2.2 약물 정보 필드
- 약물명 (필수)
- 약물 분류
- 복용량
- 복용 빈도
- 시작일 (필수)
- 종료일 (선택)
- 메모

#### 2.3 약물 목록 표시
- **현재 복용 중**: 종료일 없거나 미래인 약물
- **복용 종료**: 종료일이 과거인 약물
  - 이번 달 / 올해 / 연도별 그룹화
  - 접기/펼치기 기능

#### 2.4 약물 카드 기능
- 복용 기간 자동 계산 (일/주/개월/년)
- "종료" 버튼으로 오늘 날짜로 종료
- 수정/삭제 기능

#### 2.5 달력 연동
- 달력에서 약물 복용 기간을 색상 바로 표시
- 주 단위로 연속 바 표시 (주 시작/끝에서 라운드 처리)
- 약물 바 클릭 시 상세 정보 모달

---

### 3. 보고서 페이지 (Report Page)

#### 3.1 기간 선택
- 1주일 / 1개월 / 3개월

#### 3.2 요약 통계
- 총 기록 수
- 기록한 날 수
- 평균 컨디션 점수
- 평균 피로도
- 이벤트성 증상 발생 횟수
- 현재 복용 약물 수

#### 3.3 기록 타입별 분포
- 타입별 기록 수 및 비율 차트

#### 3.4 AI 요약 프롬프트 생성
- 클립보드에 프롬프트 복사 기능

---

### 4. 설정 페이지 (Settings Page)

#### 4.1 데이터 현황
- 총 기록 수
- 기록한 날 수
- 등록 약물 수 (복용 중 N개)
- 첫 기록 날짜


#### 4.3 데이터 내보내기
| 형식 | 파일명 | 내용 |
|------|--------|------|
| CSV (건강기록) | lupus-건강기록-YYYY-MM-DD.csv | 건강기록만 (Excel용) |
| CSV (약물) | lupus-약물정보-YYYY-MM-DD.csv | 약물정보만 (Excel용) |

#### 4.7 앱 정보
- 버전: 1.2.0
- 저장 방식: 브라우저 로컬 저장소

---

## 🎨 UI/UX 요구사항

### 1. 반응형 디자인
- 모바일 우선 (Mobile First)
- 브레이크포인트: md (768px), lg (1024px)

### 2. 모바일 최적화
- 네비게이션: 높이 h-14 (모바일), h-16 (데스크톱)
- 패딩: p-2 (모바일), p-8 (데스크톱)
- 폰트 크기: 반응형 적용
- 터치 친화적 버튼 크기
- 모달 최대 높이 90vh, 스크롤 가능

### 3. 색상 테마
- 배경: 그라데이션 (blue-50 → purple-50 → pink-50)
- 카드: 흰색 배경, 라운드 처리
- 각 기록 타입별 고유 색상

### 4. 접근성
- 충분한 색상 대비
- 터치 타겟 최소 44px
- 스크롤바 커스터마이징

---

## 📊 데이터 구조

### Logs (건강 기록)
```typescript
interface Logs {
  [dateKey: string]: LogEntry[];  // 'YYYY-MM-DD' 형식
}

interface LogEntry {
  id: string;           // 'log_' + timestamp
  type: string;         // 기록 타입 키
  data: LogData;        // 필드별 데이터
  createdAt: string;    // ISO 날짜 문자열
}

interface LogData {
  [fieldId: string]: string | number | string[] | undefined;
  // fieldId_other: "기타" 선택 시 추가 입력값
}
```

### Medications (약물)
```typescript
interface Medication {
  id: string;           // 'med_' + timestamp
  name: string;         // 약물명
  category: string;     // 카테고리 키
  dose: string;         // 복용량
  frequency: string;    // 복용 빈도
  startDate: string;    // 시작일 (YYYY-MM-DD)
  endDate?: string;     // 종료일 (선택)
  notes?: string;       // 메모
}
```

---

## 📝 기록 타입별 상세 필드

### 1. 정기기록 (routine)
| 필드 ID | 라벨 | 타입 | 옵션 |
|---------|------|------|------|
| condition | 전반 컨디션 점수 | range | 1-10 |
| fatigue | 피로도 | range | 1-10 |
| painAreas | 통증 부위 요약 | multiselect | 관절, 근육, 두통, 복부, 흉부, 피부, 기타 |
| worstSymptom | 최근 1주일 중 가장 힘들었던 증상 | textarea | - |
| steroidChange | 스테로이드 용량 | select | 유지, 증량, 감량, 중단 |
| steroidDose | 현재 용량 | number | mg |
| notes | 특이사항 | textarea | - |

### 2. 검사 결과 (lab)
| 필드 ID | 라벨 | 타입 | 단위 |
|---------|------|------|------|
| c3 | C3 | number | mg/dL |
| c4 | C4 | number | mg/dL |
| antiDsDna | anti-dsDNA | number | IU/mL |
| wbc | WBC | number | /μL |
| hgb | Hemoglobin | number | g/dL |
| plt | Platelet | number | ×10³/μL |
| esr | ESR | number | mm/hr |
| crp | CRP | number | mg/L |
| urineProtein | 요단백 | select | -, ±, +, ++, +++ |
| creatinine | Creatinine | number | mg/dL |
| notes | 특이사항 | textarea | - |

### 3. 이벤트성 증상 (flare)
| 필드 ID | 라벨 | 타입 | 옵션 |
|---------|------|------|------|
| symptomType | 증상 유형 | multiselect | 발열, 관절통, 피부발진, 부종, 극심한 피로, 호흡곤란, 두통, 기타 |
| severity | 심각도 | range | 1-10 |
| triggers | 유발 요인 추정 | multiselect | 수면부족, 스트레스, 감염, 과로, 햇빛노출, 음식, 약물, 모름, 기타 |
| duration | 지속 시간 | text | - |
| response | 대응 방법 | textarea | - |
| recoveryTime | 회복까지 걸린 시간 | text | - |
| notes | 특이사항 | textarea | - |

### 4. 생활·트리거 (lifestyle)
| 필드 ID | 라벨 | 타입 | 옵션 |
|---------|------|------|------|
| sleepHours | 수면 시간 | number | 시간 |
| sleepQuality | 수면 질 | range | 1-10 |
| stressLevel | 스트레스 수준 | range | 1-10 |
| stressEvents | 스트레스 사건 | textarea | - |
| infection | 감염 여부 | select | 없음, 감기, 독감, 요로감염, 기타 |
| sunExposure | 햇빛 노출 | select | 거의 없음, 30분 미만, 30분-1시간, 1시간 이상 |
| overwork | 과로 여부 | select | 아니오, 약간, 많이 |
| specialEvents | 특별한 일정/여행 | textarea | - |
| notes | 특이사항 | textarea | - |

### 5. 회복 기록 (recovery)
| 필드 ID | 라벨 | 타입 |
|---------|------|------|
| recoveredFrom | 회복한 증상 | text |
| recoveryDuration | 회복까지 걸린 시간 | text |
| helpfulActions | 가장 도움이 됐던 행동 | textarea |
| avoidActions | 피해야 할 행동 | textarea |
| lessonsLearned | 배운 점 | textarea |
| notes | 특이사항 | textarea |

### 6. 의료 방문 (visit)
| 필드 ID | 라벨 | 타입 | 옵션 |
|---------|------|------|------|
| visitType | 방문 유형 | select | 정기 외래, 임시 외래, 응급실, 입원, 퇴원, 기타 |
| hospital | 병원명 | text | - |
| doctor | 담당의 | text | - |
| doctorSummary | 의사 설명 요약 | textarea | - |
| planChanges | 변경된 계획 | textarea | - |
| nextGoal | 다음 목표 | textarea | - |
| nextVisit | 다음 방문일 | date | - |
| notes | 특이사항 | textarea | - |

### 7. 감정·심리 (mental)
| 필드 ID | 라벨 | 타입 |
|---------|------|------|
| mood | 전반적 기분 | range | 1-10 |
| anxiety | 불안 수준 | range | 1-10 |
| depression | 우울 수준 | range | 1-10 |
| frustration | 좌절감 | textarea |
| thoughts | 병에 대한 생각 | textarea |
| gratitude | 감사한 점 | textarea |
| support | 필요한 지원 | textarea |
| notes | 특이사항 | textarea |
