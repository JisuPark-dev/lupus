// 사용자 병원 정보
export interface UserHospital {
  id: string;
  member_id: number;
  name: string;
  start_date: string;      // YYYY-MM-DD
  end_date: string | null; // null = 현재 다니는 병원
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

// 병원 생성 요청
export interface CreateHospitalRequest {
  name: string;
  start_date: string;
  end_date?: string | null;
  is_primary?: boolean;
}

// 병원 수정 요청
export interface UpdateHospitalRequest {
  name?: string;
  start_date?: string;
  end_date?: string | null;
  is_primary?: boolean;
}
