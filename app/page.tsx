'use client';

import { useState, useEffect } from 'react';
import InstallPWA from '@/components/InstallPWA';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Bell, Play, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const [nickname, setNickname] = useState('');
  const [interval, setNotifyInterval] = useState('1hour');
  const [isClientReady, setIsClientReady] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800);
  const router = useRouter();

  useEffect(() => {
    const storedId = localStorage.getItem('amwoji_uid');
    if (storedId) {
      setUserId(storedId);
    }
    
    // Service Worker Registration for Push Notifications
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }
    
    // 장식용 타이머 타이킹 로직
    const timer = setInterval(() => setTimeLeft(prev => prev > 0 ? prev - 1 : 1800), 1000);
    
    setIsClientReady(true);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname) return;
    
    // Insert new user
    const { data: userData, error } = await supabase
      .from('users')
      .insert({ nickname, notify_interval: interval })
      .select()
      .single();

    if (error || !userData) {
      alert('접속에 실패했습니다. (DB 연결 확인 필요)');
      return;
    }

    localStorage.setItem('amwoji_uid', userData.id);
    setUserId(userData.id);

    // Request Notification permission
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        subscribeUser(userData.id);
      }
    }
  };

  const subscribeUser = async (uid: string) => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      });
      
      await fetch('/api/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uid, subscription })
      });
    } catch (error) {
      console.error('푸시 구독 실패:', error);
    }
  };

  const startManualGame = async () => {
    if (!userId || isGenerating) return;
    setIsGenerating(true);
    
    try {
      const res = await fetch('/api/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      
      if (data.questionId) {
        // 라우팅: /game?qid=id&uqid=id
        router.push(`/game?qid=${data.questionId}&uqid=${data.userQuestionId}`);
      } else {
        alert('질문 생성에 실패했습니다! 다시 시도해주세요.');
      }
    } catch (error) {
      console.error(error);
      alert('네트워크 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isClientReady) return <div className="flex-1 flex items-center justify-center text-primary font-bold">로딩 중...</div>;

  if (!userId) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col items-center justify-center gap-6 pb-20">
        <h1 className="text-4xl font-black text-center leading-[1.2]">
          공부 따위<br/>
          <span className="text-primary tracking-tighter">아 뭐지? 🤯</span>
        </h1>
        <p className="text-text/70 text-center text-sm font-medium">
          당신의 집중력을 완벽하게 파괴할<br/>
          엉뚱한 일상 호기심 알림 서비스
        </p>
        
        <form onSubmit={handleOnboarding} className="w-full max-w-xs space-y-4 mt-6">
          <div>
            <label className="text-xs font-semibold text-primary ml-1">사용하실 닉네임</label>
            <input 
              required
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full bg-[#1A1A1A]/80 border border-text/10 rounded-xl p-4 outline-none focus:border-primary text-text mt-2 font-medium" 
              placeholder="예: 내일의 저격수" 
            />
          </div>
          <div className="pt-2">
            <label className="text-xs font-semibold text-primary ml-1">방해 받을 주기 (푸시 알림)</label>
            <div className="relative mt-2">
              <select 
                value={interval}
                onChange={(e) => setNotifyInterval(e.target.value)}
                className="w-full bg-[#1A1A1A]/80 border border-text/10 rounded-xl p-4 outline-none focus:border-primary text-text appearance-none font-medium"
              >
                <option value="30min">30분마다 한 번씩</option>
                <option value="1hour">1시간마다 한 번씩</option>
                <option value="random">불규칙적으로 랜덤 공격</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text/50">▼</div>
            </div>
          </div>
          <button type="submit" className="w-full bg-primary text-[#0A0A0A] font-black p-4 rounded-xl mt-6 hover:scale-[1.02] active:scale-[0.98] transition shadow-[0_0_20px_rgba(204,255,0,0.3)]">
            시작하기 (알림 권한 필수)
          </button>
        </form>
        <InstallPWA />
      </motion.div>
    );
  }

  // 홈 화면 (로그인 된 상태)
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col pt-8 pb-10 gap-8">
      <header className="flex justify-between items-center px-2">
        <h1 className="font-black text-2xl tracking-tight"><span className="text-primary">아 뭐지?</span> 🧐</h1>
        <div className="w-10 h-10 bg-[#1A1A1A] rounded-full flex items-center justify-center border border-primary/30 shadow-[0_0_15px_rgba(204,255,0,0.15)]">
          <Bell size={18} className="text-primary animate-[wiggle_1s_ease-in-out_infinite]" />
        </div>
      </header>

      <section className="bg-gradient-to-br from-[#1c1c1c] to-[#0A0A0A] border border-text/10 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 py-16 relative overflow-hidden shadow-xl">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/10 rounded-full blur-[40px]"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-success/10 rounded-full blur-[30px]"></div>
        <p className="text-text/70 text-sm font-semibold z-10">다음 집중력 파괴까지 남은 시간</p>
        <div className="text-5xl font-black text-white font-mono tracking-tighter z-10 hover:scale-105 transition-transform">
          {formatTime(timeLeft)}
        </div>
        <p className="text-xs text-text/40 z-10 mt-2">* 화면 UI용 타이머입니다</p>
      </section>

      <button 
         onClick={startManualGame} 
         disabled={isGenerating}
         className="w-full bg-primary/10 text-primary border border-primary/40 p-5 rounded-2xl flex items-center justify-center gap-2 font-bold hover:bg-primary/20 transition active:scale-95 group shadow-lg"
      >
        {isGenerating ? (
          <><Loader2 className="animate-spin" size={20} /> 인공지능이 질문을 짜내고 있습니다...</>
        ) : (
          <><Play className="group-hover:fill-primary transition-all" size={20} /> 지금 바로 호기심 참교육 받기</>
        )}
      </button>
      
      <div className="mt-auto grid grid-cols-2 gap-4">
        <div className="bg-[#151515] p-5 rounded-2xl border border-text/5 flex flex-col gap-1">
          <span className="text-text/50 text-xs font-semibold">오늘의 방해 횟수</span>
          <span className="text-2xl font-black">0<span className="text-sm font-medium text-text/50 ml-1">번</span></span>
        </div>
        <div className="bg-[#151515] p-5 rounded-2xl border border-text/5 flex flex-col gap-1">
          <span className="text-text/50 text-xs font-semibold">알아낸 쓸모없는지식</span>
          <span className="text-2xl font-black text-success">0<span className="text-sm font-medium text-text/50 ml-1">개</span></span>
        </div>
      </div>
      <InstallPWA />
    </motion.div>
  );
}
