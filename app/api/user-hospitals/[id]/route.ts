import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getMemberIdFromSession } from '@/lib/utils/session';
import type { UpdateHospitalRequest } from '@/types/hospitals';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT: 병원 수정
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const memberId = await getMemberIdFromSession();
  const { id } = await params;

  if (!memberId) {
    return NextResponse.json(
      { error: '로그인이 필요합니다' },
      { status: 401 }
    );
  }

  const body: UpdateHospitalRequest = await request.json();

  const updateData: Record<string, unknown> = {};
  if (body.name !== undefined) updateData.name = body.name;
  if (body.start_date !== undefined) updateData.start_date = body.start_date;
  if (body.end_date !== undefined) updateData.end_date = body.end_date;
  if (body.is_primary !== undefined) updateData.is_primary = body.is_primary;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { error: '수정할 데이터가 없습니다' },
      { status: 400 }
    );
  }

  // is_primary가 true로 변경되는 경우, 기존 주 병원을 해제
  if (body.is_primary === true) {
    await supabase
      .from('user_hospitals')
      .update({ is_primary: false })
      .eq('member_id', memberId)
      .eq('is_primary', true)
      .neq('id', id);
  }

  const { data: hospital, error } = await supabase
    .from('user_hospitals')
    .update(updateData)
    .eq('id', id)
    .eq('member_id', memberId)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json(
        { error: '병원을 찾을 수 없습니다' },
        { status: 404 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ hospital });
}

// DELETE: 병원 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const memberId = await getMemberIdFromSession();
  const { id } = await params;

  if (!memberId) {
    return NextResponse.json(
      { error: '로그인이 필요합니다' },
      { status: 401 }
    );
  }

  const { error } = await supabase
    .from('user_hospitals')
    .delete()
    .eq('id', id)
    .eq('member_id', memberId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
