import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getMemberIdFromSession } from '@/lib/utils/session';
import type { CreateHealthLogRequest, LogType } from '@/types/logs';

// GET: 건강 기록 목록 조회
export async function GET(request: NextRequest) {
  const memberId = await getMemberIdFromSession();

  if (!memberId) {
    return NextResponse.json(
      { error: '로그인이 필요합니다', logs: [] },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const logType = searchParams.get('type');

  let query = supabase
    .from('health_logs')
    .select('*')
    .eq('member_id', memberId)
    .order('log_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (startDate) {
    query = query.gte('log_date', startDate);
  }

  if (endDate) {
    query = query.lte('log_date', endDate);
  }

  if (logType) {
    query = query.eq('log_type', logType as LogType);
  }

  const { data: logs, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ logs });
}

// POST: 건강 기록 생성
export async function POST(request: NextRequest) {
  const memberId = await getMemberIdFromSession();

  if (!memberId) {
    return NextResponse.json(
      { error: '로그인이 필요합니다' },
      { status: 401 }
    );
  }

  const body: CreateHealthLogRequest = await request.json();
  const { log_date, log_type, data, notes } = body;

  if (!log_date || !log_type) {
    return NextResponse.json(
      { error: '날짜와 기록 타입은 필수입니다' },
      { status: 400 }
    );
  }

  const { data: log, error } = await supabase
    .from('health_logs')
    .insert({
      member_id: memberId,
      log_date,
      log_type,
      data: data || {},
      notes: notes || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ log }, { status: 201 });
}
