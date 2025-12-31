import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getMemberIdFromSession } from '@/lib/utils/session';
import { sendPushNotification } from '@/lib/firebase-admin';

// POST: 테스트 푸시 알림 전송
export async function POST() {
  const memberId = await getMemberIdFromSession();

  if (!memberId) {
    return NextResponse.json(
      { error: '로그인이 필요합니다' },
      { status: 401 }
    );
  }

  // 사용자의 FCM 토큰 조회
  const { data: tokens, error: fetchError } = await supabase
    .from('fcm_tokens')
    .select('token')
    .eq('member_id', memberId)
    .order('updated_at', { ascending: false })
    .limit(1);

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!tokens || tokens.length === 0) {
    return NextResponse.json(
      { error: '등록된 FCM 토큰이 없습니다' },
      { status: 404 }
    );
  }

  // 푸시 알림 전송
  const result = await sendPushNotification(
    tokens[0].token,
    'Hello World',
    '푸시 알림 테스트입니다!'
  );

  if (!result.success) {
    return NextResponse.json(
      { error: '푸시 알림 전송에 실패했습니다' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    messageId: result.messageId
  });
}
