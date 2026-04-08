'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, ArrowLeft, Trophy, Target, BellRing, Brain } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function StatsPage() {
  const [stats, setStats] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const uid = localStorage.getItem('amwoji_uid');
    if (uid) {
      supabase.from('user_stats').select('*').eq('user_id', uid).single().then(({data}) => {
         if(data) setStats(data);
      });
    }
  }, []);

  return (
    <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="flex-1 flex flex-col p-6 w-full max-w-sm mx-auto overflow-y-auto">
      <header className="flex items-center gap-4 mb-10 mt-4">
        <button onClick={() => router.push('/')} className="bg-[#1A1A1A] text-text p-3 rounded-full border border-text/10 active:scale-95 transition-transform"><ArrowLeft size={20}/></button>
        <h1 className="text-2xl font-black">내 <span className="text-primary">뻘짓</span> 리포트</h1>
      </header>

      {!stats ? (
         <div className="flex-1 flex flex-col items-center justify-center gap-4 text-text/50">
           <Loader2 className="animate-spin text-primary" size={30} />
           <p className="text-sm font-bold">인생 낭비 기록표 가져오는 중...</p>
         </div>
      ) : (
         <div className="grid grid-cols-2 gap-4">
           <div className="bg-[#151515] p-5 rounded-[1.5rem] border border-success/30 flex flex-col gap-2 shadow-[0_0_20px_rgba(0,255,178,0.05)]">
             <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center mb-2"><Brain size={16} className="text-success" /></div>
             <span className="text-text/60 text-xs font-bold">알아낸 쓸모없는지식</span>
             <span className="text-3xl font-black text-white">{stats.total_revealed || 0}<span className="text-sm font-medium text-text/50 ml-1">개</span></span>
           </div>

           <div className="bg-[#151515] p-5 rounded-[1.5rem] border border-text/10 flex flex-col gap-2 shadow-inner">
             <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mb-2"><BellRing size={16} className="text-white" /></div>
             <span className="text-text/60 text-xs font-bold">푸시 알림 받은 수</span>
             <span className="text-3xl font-black text-white">{stats.total_notifications || 0}<span className="text-sm font-medium text-text/50 ml-1">회</span></span>
           </div>

           <div className="col-span-2 bg-primary/5 p-6 rounded-[1.5rem] border border-primary/40 flex flex-col gap-2 shadow-[0_0_30px_rgba(204,255,0,0.1)] relative overflow-hidden">
             <div className="absolute -right-6 -bottom-6 opacity-10"><Trophy size={100} /></div>
             <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mb-1"><Target size={16} className="text-primary" /></div>
             <span className="text-primary/70 text-xs font-bold">미니게임 통과 횟수</span>
             <p className="text-4xl font-black text-primary">{stats.total_clears || 0}<span className="text-base font-medium text-primary/50 ml-1">번 탈출 성공!</span></p>
           </div>
           
           <div className="col-span-2 mt-6">
              <button 
                onClick={() => router.push('/')}
                className="w-full bg-[#1A1A1A] font-bold p-5 rounded-2xl border border-text/10 hover:bg-[#222] active:scale-95 transition"
              >
                닫기
              </button>
           </div>
         </div>
      )}
    </motion.div>
  );
}
