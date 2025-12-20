import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getMemberIdFromSession } from '@/lib/utils/session';
import type { UpdateMedicationRequest } from '@/types/medications';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET: 단일 약물 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  const memberId = await getMemberIdFromSession();
  const { id } = await params;

  if (!memberId) {
    return NextResponse.json(
      { error: '로그인이 필요합니다' },
      { status: 401 }
    );
  }

  const { data: medication, error } = await supabase
    .from('medications')
    .select('*')
    .eq('id', id)
    .eq('member_id', memberId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json(
        { error: '약물을 찾을 수 없습니다' },
        { status: 404 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ medication });
}

// PUT: 약물 수정
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const memberId = await getMemberIdFromSession();
  const { id } = await params;

  if (!memberId) {
    return NextResponse.json(
      { error: '로그인이 필요합니다' },
      { status: 401 }
    );
  }

  const body: UpdateMedicationRequest = await request.json();

  const updateData: Record<string, unknown> = {};
  if (body.name !== undefined) updateData.name = body.name;
  if (body.category !== undefined) updateData.category = body.category;
  if (body.dose !== undefined) updateData.dose = body.dose;
  if (body.frequency !== undefined) updateData.frequency = body.frequency;
  if (body.start_date !== undefined) updateData.start_date = body.start_date;
  if (body.end_date !== undefined) updateData.end_date = body.end_date;
  if (body.notes !== undefined) updateData.notes = body.notes;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { error: '수정할 데이터가 없습니다' },
      { status: 400 }
    );
  }

  const { data: medication, error } = await supabase
    .from('medications')
    .update(updateData)
    .eq('id', id)
    .eq('member_id', memberId)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json(
        { error: '약물을 찾을 수 없습니다' },
        { status: 404 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ medication });
}

// DELETE: 약물 삭제
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
    .from('medications')
    .delete()
    .eq('id', id)
    .eq('member_id', memberId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
