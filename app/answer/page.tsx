'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, Share, Home } from 'lucide-react';
import { motion } from 'framer-motion';

function AnswerClient() {
  const searchParams = useSearchParams();
  const qid = searchParams.get('qid');
  const uqid = searchParams.get('uqid');
  const token = searchParams.get('token');
  const router = useRouter();

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!qid || !uqid || !token) {
      setError('올바르지 않은 접근 세션입니다.');
      return;
    }

    const fetchAnswer = async () => {
      const uid = localStorage.getItem('amwoji_uid');
      try {
        const res = await fetch('/api/reveal-answer', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ userId: uid, userQuestionId: uqid, token })
        });
        const data = await res.json();
        
        if (res.ok) {
          setQuestion(data.question);
          setAnswer(data.answer);
        } else {
          setError(data.error || '정답을 복호화하는 데 실패했습니다.');
        }
      } catch (err) {
        setError('서버/네트워크 오류가 발생했습니다.');
      }
    };
    
    fetchAnswer();
  }, [qid, uqid, token]);

  const handleShare = async () => {
    const url = `${window.location.origin}/q/${qid}`;
    const text = `나 공부하다가 이거 알아버렸어 👀\n"${question}"\n\n- [아 뭐지?] 앱에서 정답 확인하기`;
    
    if (navigator.share) {
      try {
         await navigator.share({ title: '아 뭐지?', text, url });
      } catch(e) {}
    } else {
      navigator.clipboard.writeText(`${text}\n${url}`);
      alert('공유 링크가 클립보드에 복사되었습니다!');
    }
  };

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <p className="text-danger font-bold text-center drop-shadow-[0_0_10px_rgba(255,59,59,0.5)] bg-danger/10 px-6 py-4 rounded-xl">{error}</p>
        <button onClick={()=>router.push('/')} className="px-8 py-3 bg-white text-black font-black rounded-lg">홈으로 돌아가기</button>
      </div>
    );
  }

  if (!answer) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-success" size={40} />
        <p className="text-success font-bold animate-pulse text-sm">극비 정보 복호화 중...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center py-10 w-full">
      <div className="text-center mb-10 px-4">
        <h2 className="text-success font-black text-sm mb-3 drop-shadow-[0_0_10px_rgba(0,255,178,0.5)] border border-success/50 inline-block px-3 py-1 rounded-md">암호 해독 완료</h2>
        <h1 className="text-2xl font-black leading-snug break-keep">Q. {question}</h1>
      </div>
      
      <div className="bg-[#151515] border border-success/40 w-full p-8 pt-10 rounded-3xl shadow-[0_0_50px_rgba(0,255,178,0.15)] relative mb-12 flex-1 max-h-[300px] overflow-y-auto">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-success text-[#0A0A0A] font-black px-6 py-2 rounded-full text-sm shadow-[0_0_20px_rgba(0,255,178,1)]">
          정답 및 해설
        </div>
        <p className="text-text/90 leading-relaxed font-medium break-keep text-center text-[15px]">
          {answer}
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full mt-auto">
        <button onClick={handleShare} className="w-full bg-[#1A1A1A] text-text py-5 rounded-2xl font-bold border border-text/10 flex items-center justify-center gap-2 hover:bg-[#252525] transition active:scale-95">
          <Share size={18} /> 친구들 공부도 방해히기 (링크 복사)
        </button>
        <button onClick={()=>router.push('/')} className="w-full bg-primary text-[#0a0a0a] py-5 rounded-2xl font-black border-b-[6px] border-[#99CC00] active:scale-95 transition-transform flex items-center justify-center gap-2 mt-2 shadow-[0_0_20px_rgba(204,255,0,0.3)]">
          <Home size={18} border="currentColor" /> 홈으로 돌아가서 공부(?)하기
        </button>
      </div>
    </motion.div>
  );
}

export default function AnswerPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-success" size={32} /></div>}>
      <AnswerClient />
    </Suspense>
  );
}
