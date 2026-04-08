import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { userId, userQuestionId } = await req.json();

    if (!userId || !userQuestionId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // 1회용 토큰 생성 (5분 후 만료)
    const token = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('user_questions')
      .update({ 
        reveal_token: token, 
        token_expires_at: expiresAt,
        game_attempts: 1 // 예시로 시도 횟수 통계 처리용
      })
      .eq('id', userQuestionId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !data) throw error;

    // 통계 업데이트 (게임 클리어 횟수 증가) - 실패해도 무관하게 에러는 무시
    await supabase.rpc('increment_total_clears', { uid: userId }).catch(() => null);

    return NextResponse.json({ token, expiresAt });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
