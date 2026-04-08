'use client';

import { useState, useEffect, useCallback } from 'react';
import InstallPWA from '@/components/InstallPWA';
import InAppAlert from '@/components/InAppAlert';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, Play, Loader2, Settings, X, ChevronDown, BarChart3 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const INTERVAL_SECONDS: Record<string, number> = {
  '30min': 30 * 60,
  '1hour': 60 * 60,
};

function getRandomInterval() {
  // Random between 15min ~ 90min
  return Math.floor(Math.random() * (90 - 15 + 1) + 15) * 60;
}

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const [nickname, setNickname] = useState('');
  const [editNickname, setEditNickname] = useState('');
  const [notifyInterval, setNotifyInterval] = useState('1hour');
  const [isClientReady, setIsClientReady] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600);
  const [showSettings, setShowSettings] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [showInAppAlert, setShowInAppAlert] = useState(false);
  const [stats, setStats] = useState({ total_notifications: 0, total_revealed: 0 });
  const router = useRouter();

  // Load user data on mount
  useEffect(() => {
    const storedId = localStorage.getItem('amwoji_uid');
    if (storedId) {
      setUserId(storedId);
      loadUserData(storedId);
      loadStats(storedId);
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }

    // Check notification permission
    if ('Notification' in window) {
      setNotifEnabled(Notification.permission === 'granted');
    }

    setIsClientReady(true);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!userId) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Timer hit zero — trigger in-app alert
          setShowInAppAlert(true);
          // Reset timer
          return notifyInterval === 'random'
            ? getRandomInterval()
            : (INTERVAL_SECONDS[notifyInterval] || 3600);
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [userId, notifyInterval]);

  const loadUserData = async (uid: string) => {
    const { data } = await supabase.from('users').select('nickname, notify_interval').eq('id', uid).single();
    if (data) {
      setNickname(data.nickname);
      setEditNickname(data.nickname);
      setNotifyInterval(data.notify_interval || '1hour');
      // Set initial timer based on interval
      if (data.notify_interval === 'random') {
        setTimeLeft(getRandomInterval());
      } else {
        setTimeLeft(INTERVAL_SECONDS[data.notify_interval] || 3600);
      }
    }
  };

  const loadStats = async (uid: string) => {
    const { data } = await supabase.from('user_stats').select('total_notifications, total_revealed').eq('user_id', uid).single();
    if (data) setStats(data);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname) return;

    const { data: userData, error } = await supabase
      .from('users')
      .insert({ nickname, notify_interval: notifyInterval })
      .select()
      .single();

    if (error || !userData) {
      alert('접속에 실패했습니다. (DB 연결 확인 필요)');
      return;
    }

    localStorage.setItem('amwoji_uid', userData.id);
    setUserId(userData.id);
    setEditNickname(nickname);

    // Set timer
    if (notifyInterval === 'random') {
      setTimeLeft(getRandomInterval());
    } else {
      setTimeLeft(INTERVAL_SECONDS[notifyInterval] || 3600);
    }

    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotifEnabled(true);
        subscribeUser(userData.id);
      }
    }

    loadStats(userData.id);
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

  const handleBellClick = async () => {
    if (!('Notification' in window)) {
      alert('이 브라우저는 알림을 지원하지 않습니다.');
      return;
    }

    if (Notification.permission === 'granted') {
      setNotifEnabled(prev => !prev);
      // TODO: Actually toggle push subscription on server
    } else if (Notification.permission === 'default') {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        setNotifEnabled(true);
        if (userId) subscribeUser(userId);
      }
    } else {
      alert('알림이 차단되어 있습니다. 브라우저 설정에서 알림을 허용해주세요.');
    }
  };

  const handleSaveSettings = async () => {
    if (!userId) return;
    await supabase.from('users').update({
      nickname: editNickname,
      notify_interval: notifyInterval
    }).eq('id', userId);

    setNickname(editNickname);

    // Reset timer on interval change
    if (notifyInterval === 'random') {
      setTimeLeft(getRandomInterval());
    } else {
      setTimeLeft(INTERVAL_SECONDS[notifyInterval] || 3600);
    }

    setShowSettings(false);
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

  // ===== ONBOARDING =====
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
                value={notifyInterval}
                onChange={(e) => setNotifyInterval(e.target.value)}
                className="w-full bg-[#1A1A1A]/80 border border-text/10 rounded-xl p-4 outline-none focus:border-primary text-text appearance-none font-medium"
              >
                <option value="30min">30분마다 한 번씩</option>
                <option value="1hour">1시간마다 한 번씩</option>
                <option value="random">불규칙적으로 랜덤 공격</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text/50"><ChevronDown size={18}/></div>
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

  // ===== HOME DASHBOARD =====
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col pt-8 pb-10 gap-6">
      {/* In-App Alert */}
      <InAppAlert
        show={showInAppAlert}
        nickname={nickname}
        onDismiss={() => setShowInAppAlert(false)}
        onStart={async () => {
          setShowInAppAlert(false);
          await startManualGame();
        }}
      />

      {/* Header with nickname */}
      <header className="flex justify-between items-center px-2">
        <div className="flex flex-col">
          <h1 className="font-black text-xl tracking-tight">
            <span className="text-primary">{nickname}</span>님, 오늘도 딴짓 중? 🧐
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-10 h-10 bg-[#1A1A1A] rounded-full flex items-center justify-center border border-text/10 active:scale-90 transition-transform"
          >
            <Settings size={17} className="text-text/60" />
          </button>
          <button
            onClick={handleBellClick}
            className={`w-10 h-10 rounded-full flex items-center justify-center border active:scale-90 transition-transform ${
              notifEnabled
                ? 'bg-[#1A1A1A] border-primary/30 shadow-[0_0_15px_rgba(204,255,0,0.15)]'
                : 'bg-[#1A1A1A] border-danger/30'
            }`}
          >
            {notifEnabled
              ? <Bell size={17} className="text-primary" style={{ animation: 'wiggle 1s ease-in-out infinite' }} />
              : <BellOff size={17} className="text-danger" />
            }
          </button>
        </div>
      </header>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-[#151515] border border-text/10 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm text-primary">⚙️ 설정</h3>
                <button onClick={() => setShowSettings(false)}><X size={16} className="text-text/40" /></button>
              </div>

              <div>
                <label className="text-xs font-semibold text-text/50 ml-1">닉네임</label>
                <input
                  value={editNickname}
                  onChange={(e) => setEditNickname(e.target.value)}
                  className="w-full bg-background border border-text/10 rounded-xl p-3 outline-none focus:border-primary text-text mt-1.5 text-sm font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text/50 ml-1">알림 주기</label>
                <div className="relative mt-1.5">
                  <select
                    value={notifyInterval}
                    onChange={(e) => setNotifyInterval(e.target.value)}
                    className="w-full bg-background border border-text/10 rounded-xl p-3 outline-none focus:border-primary text-text appearance-none text-sm font-medium"
                  >
                    <option value="30min">30분마다 한 번씩</option>
                    <option value="1hour">1시간마다 한 번씩</option>
                    <option value="random">불규칙적으로 랜덤 공격</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text/40"><ChevronDown size={14}/></div>
                </div>
              </div>

              <button
                onClick={handleSaveSettings}
                className="w-full bg-primary text-[#0A0A0A] font-bold p-3 rounded-xl text-sm hover:brightness-110 active:scale-[0.98] transition"
              >
                저장하기
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timer Card */}
      <section className="bg-gradient-to-br from-[#1c1c1c] to-[#0A0A0A] border border-text/10 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 py-14 relative overflow-hidden shadow-xl">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/10 rounded-full blur-[40px]"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-success/10 rounded-full blur-[30px]"></div>
        <p className="text-text/70 text-sm font-semibold z-10">다음 집중력 파괴까지 남은 시간</p>
        <div className="text-5xl font-black text-white font-mono tracking-tighter z-10 hover:scale-105 transition-transform">
          {notifyInterval === 'random' ? '??:??' : formatTime(timeLeft)}
        </div>
        <p className="text-xs text-text/40 z-10 mt-1">
          {notifyInterval === 'random'
            ? '🎲 랜덤 공격 모드 — 언제 올지 아무도 모릅니다'
            : `⏱ ${notifyInterval === '30min' ? '30분' : '1시간'} 간격`}
        </p>
      </section>

      {/* Action Button */}
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

      {/* Stats + Navigation */}
      <div className="mt-auto grid grid-cols-2 gap-4">
        <div className="bg-[#151515] p-5 rounded-2xl border border-text/5 flex flex-col gap-1">
          <span className="text-text/50 text-xs font-semibold">오늘의 방해 횟수</span>
          <span className="text-2xl font-black">{stats.total_notifications}<span className="text-sm font-medium text-text/50 ml-1">번</span></span>
        </div>
        <div className="bg-[#151515] p-5 rounded-2xl border border-text/5 flex flex-col gap-1">
          <span className="text-text/50 text-xs font-semibold">알아낸 쓸모없는지식</span>
          <span className="text-2xl font-black text-success">{stats.total_revealed}<span className="text-sm font-medium text-text/50 ml-1">개</span></span>
        </div>
      </div>

      {/* Stats link */}
      <button
        onClick={() => router.push('/stats')}
        className="w-full bg-[#111] text-text/50 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 border border-text/5 hover:border-text/10 transition"
      >
        <BarChart3 size={14} /> 내 뻘짓 리포트 보기
      </button>

      <InstallPWA />
    </motion.div>
  );
}
