import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getMemberIdFromSession } from '@/lib/utils/session';
import type { CreateHospitalRequest } from '@/types/hospitals';

// GET: 병원 목록 조회
export async function GET() {
  const memberId = await getMemberIdFromSession();

  if (!memberId) {
    return NextResponse.json(
      { error: '로그인이 필요합니다', hospitals: [] },
      { status: 401 }
    );
  }

  const { data: hospitals, error } = await supabase
    .from('user_hospitals')
    .select('*')
    .eq('member_id', memberId)
    .order('is_primary', { ascending: false })
    .order('start_date', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ hospitals });
}

// POST: 병원 추가
export async function POST(request: NextRequest) {
  const memberId = await getMemberIdFromSession();

  if (!memberId) {
    return NextResponse.json(
      { error: '로그인이 필요합니다' },
      { status: 401 }
    );
  }

  const body: CreateHospitalRequest = await request.json();
  const { name, start_date, end_date, is_primary } = body;

  if (!name || !start_date) {
    return NextResponse.json(
      { error: '병원명과 시작일은 필수입니다' },
      { status: 400 }
    );
  }

  // is_primary가 true인 경우, 기존 주 병원을 해제
  if (is_primary) {
    await supabase
      .from('user_hospitals')
      .update({ is_primary: false })
      .eq('member_id', memberId)
      .eq('is_primary', true);
  }

  const { data: hospital, error } = await supabase
    .from('user_hospitals')
    .insert({
      member_id: memberId,
      name,
      start_date,
      end_date: end_date || null,
      is_primary: is_primary || false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ hospital }, { status: 201 });
}
