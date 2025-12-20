// 약물 카테고리
export type MedicationCategory =
  | 'steroid'           // 스테로이드
  | 'immunosuppressant' // 면역억제제
  | 'antimalarial'      // 항말라리아제
  | 'painkiller'        // 진통제
  | 'supplement'        // 보조제/영양제
  | 'other';            // 기타

// 약물 정보
export interface Medication {
  id: string;
  member_id: number;
  name: string;
  category: MedicationCategory;
  dose?: string | null;
  frequency?: string | null;
  start_date: string;    // YYYY-MM-DD
  end_date?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

// 약물 생성 요청
export interface CreateMedicationRequest {
  name: string;
  category: MedicationCategory;
  dose?: string;
  frequency?: string;
  start_date: string;
  end_date?: string;
  notes?: string;
}

// 약물 수정 요청
export interface UpdateMedicationRequest {
  name?: string;
  category?: MedicationCategory;
  dose?: string;
  frequency?: string;
  start_date?: string;
  end_date?: string | null;
  notes?: string;
}

// 약물 카테고리 메타데이터
export interface MedicationCategoryMeta {
  name: string;
  color: string;
}
