import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';

// 세션에서 member_id 추출
async function getMemberIdFromSession(): Promise<number | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('kakao_session');

  if (!sessionCookie) return null;

  try {
    const session = JSON.parse(sessionCookie.value);
    if (session.expires_at && Date.now() > session.expires_at) {
      return null;
    }
    return session.member_id || null;
  } catch {
    return null;
  }
}

export async function GET() {
  const memberId = await getMemberIdFromSession();

  if (!memberId) {
    return NextResponse.json(
      { error: '로그인이 필요합니다', messages: [] },
      { status: 401 }
    );
  }

  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .eq('member_id', memberId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ messages });
}

export async function POST(request: NextRequest) {
  const memberId = await getMemberIdFromSession();

  if (!memberId) {
    return NextResponse.json(
      { error: '로그인이 필요합니다' },
      { status: 401 }
    );
  }

  const body = await request.json();
  const { content } = body;

  if (!content || typeof content !== 'string') {
    return NextResponse.json(
      { error: 'Content is required' },
      { status: 400 }
    );
  }

  const { data: message, error } = await supabase
    .from('messages')
    .insert({ content, member_id: memberId })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message }, { status: 201 });
}
