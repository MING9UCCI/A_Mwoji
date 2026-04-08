import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

webpush.setVapidDetails(
  'mailto:your_email@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    // Vercel Cron 등 요청 시 인증 수단으로 Authorization Header 검증 등 로직 추가 가능
    const { headers } = req;
    const authHeader = headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
       // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 푸시 정보가 있는 유저 목록 가져오기 (시간 계산은 데모 목적상 전체 발송으로 간소화)
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .not('push_subscription', 'is', null);

    if (error || !users) throw error;

    const results = [];

    // 병렬로 API 호출 및 푸시 발송 처리 (데모스케일 기준)
    for (const user of users) {
      if (!user.push_subscription) continue;

      // 여기서 원래는 질문을 생성하고 저장하는 `/api/question` 내부 로직을 호출하거나 동일하게 실행해야 합니다.
      // (단순화를 위해 외부 연동 모의)
      
      const payload = JSON.stringify({
        title: '아 뭐지? 🧐',
        body: '새로운 엉뚱한 질문이 도착했어요! 맞춰봐봐~',
        url: `/` // /q/[questionId] 구조로 연결하는 것이 이상적
      });

      try {
        await webpush.sendNotification(user.push_subscription, payload);
        results.push({ userId: user.id, status: 'success' });
      } catch (err) {
        console.error('Push failed for user', user.id, err);
        results.push({ userId: user.id, status: 'failed' });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Cron Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
