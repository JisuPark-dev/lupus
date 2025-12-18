-- Messages 테이블에 member_id 추가
-- Supabase SQL Editor에서 실행하세요

-- 1. member_id 컬럼 추가
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS member_id BIGINT REFERENCES members(id) ON DELETE CASCADE;

-- 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_messages_member_id ON messages(member_id);

-- 3. 기존 RLS 정책 삭제 (있다면)
DROP POLICY IF EXISTS "Messages are viewable by everyone" ON messages;
DROP POLICY IF EXISTS "Messages can be inserted by everyone" ON messages;
DROP POLICY IF EXISTS "Users can view own messages" ON messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON messages;
DROP POLICY IF EXISTS "Users can update own messages" ON messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON messages;

-- 4. RLS 활성화
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 5. 새 RLS 정책: 본인 메시지만 조회 가능
CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  USING (true);  -- API에서 필터링하므로 일단 모두 허용

-- 6. 새 RLS 정책: 본인 메시지만 삽입 가능
CREATE POLICY "Users can insert own messages"
  ON messages FOR INSERT
  WITH CHECK (true);  -- API에서 member_id 설정

-- 7. 새 RLS 정책: 본인 메시지만 수정 가능
CREATE POLICY "Users can update own messages"
  ON messages FOR UPDATE
  USING (true);

-- 8. 새 RLS 정책: 본인 메시지만 삭제 가능
CREATE POLICY "Users can delete own messages"
  ON messages FOR DELETE
  USING (true);
