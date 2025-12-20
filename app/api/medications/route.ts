import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getMemberIdFromSession } from '@/lib/utils/session';
import type { CreateMedicationRequest } from '@/types/medications';

// GET: 약물 목록 조회
export async function GET(request: NextRequest) {
  const memberId = await getMemberIdFromSession();

  if (!memberId) {
    return NextResponse.json(
      { error: '로그인이 필요합니다', medications: [] },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const activeOnly = searchParams.get('active') === 'true';

  let query = supabase
    .from('medications')
    .select('*')
    .eq('member_id', memberId)
    .order('start_date', { ascending: false });

  if (activeOnly) {
    const today = new Date().toISOString().split('T')[0];
    query = query.or(`end_date.is.null,end_date.gte.${today}`);
  }

  const { data: medications, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ medications });
}

// POST: 약물 생성
export async function POST(request: NextRequest) {
  const memberId = await getMemberIdFromSession();

  if (!memberId) {
    return NextResponse.json(
      { error: '로그인이 필요합니다' },
      { status: 401 }
    );
  }

  const body: CreateMedicationRequest = await request.json();
  const { name, category, dose, frequency, start_date, end_date, notes } = body;

  if (!name || !category || !start_date) {
    return NextResponse.json(
      { error: '약물명, 카테고리, 시작일은 필수입니다' },
      { status: 400 }
    );
  }

  const { data: medication, error } = await supabase
    .from('medications')
    .insert({
      member_id: memberId,
      name,
      category,
      dose: dose || null,
      frequency: frequency || null,
      start_date,
      end_date: end_date || null,
      notes: notes || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ medication }, { status: 201 });
}
