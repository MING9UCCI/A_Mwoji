'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import RunawayButton from '@/components/games/RunawayButton';
import MirrorClick from '@/components/games/MirrorClick';
import SlotMachine from '@/components/games/SlotMachine';
import Roulette from '@/components/Roulette';
import FailReaction from '@/components/FailReaction';
import { Loader2 } from 'lucide-react';

const GAMES = ['runaway', 'mirror', 'slot'];

export default function GameClient() {
  const searchParams = useSearchParams();
  const qid = searchParams.get('qid');
  const uqid = searchParams.get('uqid');
  const router = useRouter();
  
  const [attempts, setAttempts] = useState(0);
  const [currentGame, setCurrentGame] = useState('');
  const [showFail, setShowFail] = useState(false);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    pickRandomGame();
  }, []);

  const pickRandomGame = () => {
    const random = GAMES[Math.floor(Math.random() * GAMES.length)];
    setCurrentGame(random);
  };

  const handleFail = () => {
    setShowFail(true);
    setAttempts(a => a + 1);
  };

  const nextAfterFail = () => {
    setShowFail(false);
    if (attempts >= 2) { // 3번째 실패 후 룰렛 (0,1,2 = 3 fail)
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
        alert('게임 통과 처리 중 오류가 발생했습니다.');
        setLoading(false);
      }
    } catch (e) {
      alert('네트워크 오류');
      setLoading(false);
    }
  };

  if (!qid || !uqid) return <div className="text-danger flex-1 flex items-center justify-center font-bold">잘못된 접근입니다. URL을 확인해주세요.</div>;

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative w-full h-full p-4 overflow-hidden">
      {showFail && <FailReaction onNext={nextAfterFail} />}
      
      {loading && (
        <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-[100] backdrop-blur-sm gap-4">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="text-primary font-bold">정답 복호화용 토큰 발급 중...</p>
        </div>
      )}

      {/* 게임 진행 화면 */}
      {!showFail && currentGame === 'runaway' && <RunawayButton onSuccess={handleSuccess} onFail={handleFail} />}
      {!showFail && currentGame === 'mirror' && <MirrorClick onSuccess={handleSuccess} onFail={handleFail} />}
      {!showFail && currentGame === 'slot' && <SlotMachine onSuccess={handleSuccess} onFail={handleFail} />}
      
      {!showFail && currentGame === 'roulette' && (
        <Roulette onResult={(res) => {
          if (res === 'reveal') {
            handleSuccess();
          } else {
            setAttempts(0); // 횟수 리셋 후 새 게임
            pickRandomGame();
          }
        }} />
      )}
    </div>
  );
}
