import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getMemberIdFromSession } from '@/lib/utils/session';

// POST: FCM 토큰 저장/업데이트
export async function POST(request: NextRequest) {
  const memberId = await getMemberIdFromSession();

  if (!memberId) {
    return NextResponse.json(
      { error: '로그인이 필요합니다' },
      { status: 401 }
    );
  }

  const { token } = await request.json();

  if (!token) {
    return NextResponse.json(
      { error: 'FCM 토큰이 필요합니다' },
      { status: 400 }
    );
  }

  // 기존 토큰이 있으면 업데이트, 없으면 삽입
  const { data: existing } = await supabase
    .from('fcm_tokens')
    .select('id')
    .eq('member_id', memberId)
    .eq('token', token)
    .single();

  if (existing) {
    // 기존 토큰 업데이트 (updated_at 갱신)
    const { error } = await supabase
      .from('fcm_tokens')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', existing.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    // 새 토큰 삽입
    const { error } = await supabase
      .from('fcm_tokens')
      .insert({
        member_id: memberId,
        token,
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}

// DELETE: FCM 토큰 삭제
export async function DELETE(request: NextRequest) {
  const memberId = await getMemberIdFromSession();

  if (!memberId) {
    return NextResponse.json(
      { error: '로그인이 필요합니다' },
      { status: 401 }
    );
  }

  const { token } = await request.json();

  if (!token) {
    return NextResponse.json(
      { error: 'FCM 토큰이 필요합니다' },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from('fcm_tokens')
    .delete()
    .eq('member_id', memberId)
    .eq('token', token);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
