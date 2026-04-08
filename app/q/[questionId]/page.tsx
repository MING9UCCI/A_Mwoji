import { createClient } from '@supabase/supabase-js';
import { Metadata } from 'next';
import Link from 'next/link';
import { Info } from 'lucide-react';

export async function generateMetadata({ params }: { params: { questionId: string } }): Promise<Metadata> {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data } = await supabase.from('questions').select('question').eq('id', params.questionId).single();
  
  if (!data) return { title: '아 뭐지? 질문을 찾을 수 없어요' };
  
  return {
    title: `Q. ${data.question} - 아 뭐지?`,
    description: '당장 정답이 궁금하시죠? 앱에서 확인하세요!',
  };
}

export default async function SharedQuestionPage({ params }: { params: { questionId: string } }) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data } = await supabase.from('questions').select('question').eq('id', params.questionId).single();

  if (!data) {
    return <div className="flex-1 flex items-center justify-center text-danger font-bold text-xl">존재하지 않거나 삭제된 질문입니다.</div>;
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-12 p-2 text-center py-20 pointer-events-auto">
      <div>
        <p className="text-primary font-bold text-sm mb-4 bg-primary/10 inline-block px-3 py-1 rounded-full border border-primary/30">
          친구가 공유한 엉뚱한 호기심
        </p>
        <h1 className="text-3xl font-black text-white leading-snug break-keep">Q. {data.question}</h1>
      </div>
      
      <div className="bg-[#151515] border border-text/10 p-8 rounded-[2rem] w-full shadow-2xl relative">
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#222] p-3 rounded-full border border-text/10">
          <Info className="text-text/50" size={24} />
        </div>
        <p className="text-text/70 text-[15px] font-medium leading-relaxed mb-6 mt-4">
          이 질문에 대한 <strong className="text-text">정답 해설</strong>을 보려면<br/>
          간단한(근데 화나는) <strong className="text-primary">미니게임</strong>을 통과해야 합니다.
        </p>
        <Link href="/" className="block w-full bg-primary text-[#0a0a0a] font-black py-5 rounded-2xl shadow-[0_0_30px_rgba(204,255,0,0.4)] hover:scale-105 transition-transform active:scale-95">
          앱 실행하고 정답 확인하기
        </Link>
      </div>
    </div>
  );
}
