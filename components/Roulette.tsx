'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Roulette({ onResult }: { onResult: (res: 'reveal'|'new_game'|'hint') => void }) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    
    // 0:reveal(30%), 1:new_game(40%), 2:hint(30%)
    const rand = Math.random();
    let targetIdx = 1;
    if (rand < 0.3) targetIdx = 0;
    else if (rand > 0.7) targetIdx = 2;

    const baseSpins = 360 * 6; // 6바퀴
    const sectionAngle = 360 / 3;
    // 화살표가 12시 방향(-90deg)이므로, 오차값을 더해 각도 계산
    const targetAngle = baseSpins - (targetIdx * sectionAngle) - (sectionAngle/2);

    setRotation(targetAngle);
    
    setTimeout(() => {
      onResult(targetIdx === 0 ? 'reveal' : (targetIdx === 1 ? 'new_game' : 'hint'));
    }, 4500);
  };

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center gap-12 p-4">
      <div className="text-center">
        <h2 className="text-3xl font-black text-danger mb-2">3회 연속 실패!</h2>
        <p className="text-text/70 text-sm">마지막 희망: 운명의 룰렛을 돌리세요</p>
      </div>
      
      <div className="relative w-72 h-72">
        {/* 화살표 (12시 방향) */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[15px] border-r-[15px] border-t-[25px] border-l-transparent border-r-transparent border-t-white z-20 drop-shadow-md" />
        
        {/* 룰렛 본체 */}
        <motion.div 
          animate={{ rotate: rotation }} // 회전
          transition={{ duration: 4.2, ease: [0.15, 0.9, 0.2, 1] }}
          className="w-full h-full rounded-full border-[6px] border-[#1A1A1A] overflow-hidden relative shadow-[0_0_40px_rgba(204,255,0,0.15)]"
        >
          {/* 3등분 시각화 */}
          <div className="absolute inset-0 w-full h-full" style={{
            background: `conic-gradient(
              from 0deg, 
              #00FFB2 0deg 120deg, 
              #FF3B3B 120deg 240deg, 
              #CCFF00 240deg 360deg
            )`
          }}/>
          
          <div className="absolute inset-0 w-full h-full text-[#0A0A0A] font-black text-sm">
            {/* 정답 공개 - 민트 (0~120) 중앙: 60deg */}
            <div className="absolute inset-0 flex items-center justify-center origin-center" style={{transform: 'rotate(60deg)'}}>
              <span className="translate-y-[-100px] text-center ml-2">정답 바로공개<br/>(30%)</span>
            </div>
            {/* 새 게임 - 레드 (120~240) 중앙: 180deg */}
            <div className="absolute inset-0 flex items-center justify-center origin-center" style={{transform: 'rotate(180deg)'}}>
              <span className="translate-y-[-100px] text-center ml-2 text-white">초면인 척 새게임<br/>(40%)</span>
            </div>
            {/* 힌트만 - 연두 (240~360) 중앙: 300deg */}
            <div className="absolute inset-0 flex items-center justify-center origin-center" style={{transform: 'rotate(300deg)'}}>
              <span className="translate-y-[-100px] text-center ml-2">찔끔 힌트만<br/>(30%)</span>
            </div>
          </div>
        </motion.div>
      </div>

      <button 
        onClick={spin}
        disabled={spinning}
        className="bg-background text-text border-2 border-primary font-black px-8 py-5 rounded-full w-full max-w-[250px] active:scale-95 disabled:opacity-50 transition-all shadow-[0_4px_0_#CCFF00]"
      >
        {spinning ? '돌아가는 중...' : '룰렛 돌리기'}
      </button>
    </div>
  );
}
