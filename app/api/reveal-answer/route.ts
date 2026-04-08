import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { decrypt } from '@/lib/crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { userId, userQuestionId, token } = await req.json();

    if (!userId || !userQuestionId || !token) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // 토큰 일치 여부 및 만료 시간 확인
    const { data: uq, error: uqError } = await supabase
      .from('user_questions')
      .select('*, questions(question, answer_encrypted)')
      .eq('id', userQuestionId)
      .eq('user_id', userId)
      .single();

    if (uqError || !uq) throw uqError;

    const now = new Date();
    const expires = new Date(uq.token_expires_at);

    if (uq.reveal_token !== token || now > expires) {
      return NextResponse.json({ error: 'Token is invalid or expired' }, { status: 401 });
    }

    // 성공 시 정답 복호화
    const answerDecrypted = decrypt(uq.questions.answer_encrypted);

    // 열람됨 상태 업데이트
    if (!uq.revealed) {
      await supabase
        .from('user_questions')
        .update({ revealed: true, reveal_token: null }) // 토큰 소진
        .eq('id', uq.id);
        
      try {
        await supabase.rpc('increment_total_revealed', { uid: userId });
      } catch (err) {}
    }

    return NextResponse.json({ 
      question: uq.questions.question, 
      answer: answerDecrypted 
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
