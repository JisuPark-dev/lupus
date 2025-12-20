import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getMemberIdFromSession } from '@/lib/utils/session';
import type { UpdateHealthLogRequest } from '@/types/logs';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET: 단일 건강 기록 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  const memberId = await getMemberIdFromSession();
  const { id } = await params;

  if (!memberId) {
    return NextResponse.json(
      { error: '로그인이 필요합니다' },
      { status: 401 }
    );
  }

  const { data: log, error } = await supabase
    .from('health_logs')
    .select('*')
    .eq('id', id)
    .eq('member_id', memberId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json(
        { error: '기록을 찾을 수 없습니다' },
        { status: 404 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ log });
}

// PUT: 건강 기록 수정
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const memberId = await getMemberIdFromSession();
  const { id } = await params;

  if (!memberId) {
    return NextResponse.json(
      { error: '로그인이 필요합니다' },
      { status: 401 }
    );
  }

  const body: UpdateHealthLogRequest = await request.json();

  const updateData: Record<string, unknown> = {};
  if (body.data !== undefined) updateData.data = body.data;
  if (body.notes !== undefined) updateData.notes = body.notes;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { error: '수정할 데이터가 없습니다' },
      { status: 400 }
    );
  }

  const { data: log, error } = await supabase
    .from('health_logs')
    .update(updateData)
    .eq('id', id)
    .eq('member_id', memberId)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json(
        { error: '기록을 찾을 수 없습니다' },
        { status: 404 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ log });
}

// DELETE: 건강 기록 삭제
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
    .from('health_logs')
    .delete()
    .eq('id', id)
    .eq('member_id', memberId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
