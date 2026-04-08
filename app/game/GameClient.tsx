'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import RunawayButton from '@/components/games/RunawayButton';
import MirrorClick from '@/components/games/MirrorClick';
import SlotMachine from '@/components/games/SlotMachine';
import Roulette from '@/components/Roulette';
import FailReaction from '@/components/FailReaction';
import { Loader2, Gamepad2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const GAMES = ['runaway', 'mirror', 'slot'];

export default function GameClient() {
  const searchParams = useSearchParams();
  const qid = searchParams.get('qid');
  const uqid = searchParams.get('uqid');
  const router = useRouter();
  
  const [mode, setMode] = useState<'choose' | 'game' | 'wait'>('choose');
  const [attempts, setAttempts] = useState(0);
  const [currentGame, setCurrentGame] = useState('');
  const [showFail, setShowFail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [waitTimer, setWaitTimer] = useState(30);

  // 30s wait timer
  useEffect(() => {
    if (mode !== 'wait') return;
    if (waitTimer <= 0) {
      handleSuccess();
      return;
    }
    const t = setTimeout(() => setWaitTimer(w => w - 1), 1000);
    return () => clearTimeout(t);
  }, [mode, waitTimer]);

  const pickRandomGame = () => {
    const random = GAMES[Math.floor(Math.random() * GAMES.length)];
    setCurrentGame(random);
  };

  const startGame = () => {
    pickRandomGame();
    setMode('game');
  };

  const startWait = () => {
    setWaitTimer(30);
    setMode('wait');
  };

  const handleFail = () => {
    setShowFail(true);
    setAttempts(a => a + 1);
  };

  const nextAfterFail = () => {
    setShowFail(false);
    if (attempts >= 2) {
      setCurrentGame('roulette');
    } else {
      pickRandomGame();
    }
  };

  const handleSuccess = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const uid = localStorage.getItem('amwoji_uid');
      const res = await fetch('/api/game-clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uid, userQuestionId: uqid })
      });
      const data = await res.json();
      if (data.token) {
        router.push(`/answer?qid=${qid}&uqid=${uqid}&token=${data.token}`);
      } else {
        alert('처리 중 오류가 발생했습니다.');
        setLoading(false);
      }
    } catch (e) {
      alert('네트워크 오류');
      setLoading(false);
    }
  };

  if (!qid || !uqid) return <div className="text-danger flex-1 flex items-center justify-center font-bold">잘못된 접근입니다.</div>;

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative w-full h-full p-4 overflow-hidden">
      {showFail && <FailReaction onNext={nextAfterFail} />}
      
      {loading && (
        <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-[100] backdrop-blur-sm gap-4">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="text-primary font-bold">정답 복호화용 토큰 발급 중...</p>
        </div>
      )}

      {/* ===== MODE: CHOOSE ===== */}
      {mode === 'choose' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-6 w-full max-w-sm"
        >
          <div className="text-5xl mb-2">🔐</div>
          <h2 className="text-xl font-black text-center">정답을 확인하려면?</h2>
          <p className="text-text/50 text-sm text-center font-medium">
            아래 두 가지 방법 중 하나를 선택하세요
          </p>

          <button
            onClick={startGame}
            className="w-full bg-primary/10 border-2 border-primary/40 text-primary p-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-primary/20 active:scale-95 transition group"
          >
            <Gamepad2 size={22} className="group-hover:rotate-12 transition-transform" />
            <div className="text-left">
              <div className="font-black">미니게임 도전</div>
              <div className="text-xs text-primary/60 font-medium mt-0.5">통과하면 바로 정답 확인!</div>
            </div>
          </button>

          <div className="text-text/20 text-xs font-bold">또는</div>

          <button
            onClick={startWait}
            className="w-full bg-[#1A1A1A] border border-text/10 text-text/70 p-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-[#222] active:scale-95 transition group"
          >
            <Clock size={22} className="text-text/40 group-hover:text-text/60 transition" />
            <div className="text-left">
              <div className="font-bold text-text/80">30초 기다리기</div>
              <div className="text-xs text-text/40 font-medium mt-0.5">참을성 테스트 (광고 대체)</div>
            </div>
          </button>
        </motion.div>
      )}

      {/* ===== MODE: 30s WAIT ===== */}
      {mode === 'wait' && !loading && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="relative w-32 h-32">
            {/* Circular progress */}
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(240,240,240,0.06)" strokeWidth="8" />
              <circle 
                cx="60" cy="60" r="52" fill="none" 
                stroke="#CCFF00" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 52}`}
                strokeDashoffset={`${2 * Math.PI * 52 * (waitTimer / 30)}`}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-black text-primary font-mono">{waitTimer}</span>
            </div>
          </div>
          <p className="text-text/50 text-sm font-semibold text-center">
            조금만 참으세요...<br/>
            <span className="text-text/30 text-xs">이 시간에 공부를 하면 안 될까요?</span>
          </p>

          <button
            onClick={() => { setMode('choose'); setWaitTimer(30); }}
            className="text-text/20 text-xs font-medium hover:text-text/40 transition mt-4"
          >
            역시 게임으로 할래요
          </button>
        </motion.div>
      )}

      {/* ===== MODE: GAME ===== */}
      {mode === 'game' && !showFail && currentGame === 'runaway' && <RunawayButton onSuccess={handleSuccess} onFail={handleFail} />}
      {mode === 'game' && !showFail && currentGame === 'mirror' && <MirrorClick onSuccess={handleSuccess} onFail={handleFail} />}
      {mode === 'game' && !showFail && currentGame === 'slot' && <SlotMachine onSuccess={handleSuccess} onFail={handleFail} />}
      
      {mode === 'game' && !showFail && currentGame === 'roulette' && (
        <Roulette onResult={(res) => {
          if (res === 'reveal') {
            handleSuccess();
          } else {
            setAttempts(0);
            pickRandomGame();
          }
        }} />
      )}
    </div>
  );
}
