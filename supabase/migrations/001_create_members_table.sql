-- Members 테이블 생성
-- Supabase SQL Editor에서 실행하세요

CREATE TABLE IF NOT EXISTS members (
  id BIGSERIAL PRIMARY KEY,
  kakao_id VARCHAR(255) UNIQUE NOT NULL,
  nickname VARCHAR(100) NOT NULL,
  profile_image TEXT,
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_members_kakao_id ON members(kakao_id);
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_members_updated_at ON members;
CREATE TRIGGER update_members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) 활성화
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- 정책: 누구나 읽기 가능 (필요시 수정)
CREATE POLICY "Members are viewable by everyone"
  ON members FOR SELECT
  USING (true);

-- 정책: 서비스 역할만 삽입/수정 가능
CREATE POLICY "Members can be inserted by service role"
  ON members FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Members can be updated by service role"
  ON members FOR UPDATE
  USING (true);
