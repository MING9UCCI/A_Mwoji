import { NextResponse } from 'next/server';
import { generateQuestionAndAnswer } from '@/lib/gemini';
import { encrypt } from '@/lib/crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const { question, answer } = await generateQuestionAndAnswer();
    const answerEncrypted = encrypt(answer);

    const { data: qData, error: qError } = await supabase
      .from('questions')
      .insert({ question, answer_encrypted: answerEncrypted })
      .select()
      .single();

    if (qError || !qData) throw qError;

    const { data: uqData, error: uqError } = await supabase
      .from('user_questions')
      .insert({
        user_id: userId,
        question_id: qData.id
      })
      .select()
      .single();

    if (uqError || !uqData) throw uqError;

    // 간단한 통계 업데이트
    await supabase.rpc('increment_notification_count', { uid: userId }).catch(()=>null);

    return NextResponse.json({ 
      questionId: qData.id, 
      question: qData.question, 
      userQuestionId: uqData.id 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
