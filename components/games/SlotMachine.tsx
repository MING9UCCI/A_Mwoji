'use client';
import { useState, useEffect, useRef } from 'react';

export default function SlotMachine({ onSuccess, onFail }: { onSuccess: ()=>void, onFail: ()=>void }) {
  const [pos, setPos] = useState(0);
  const [running, setRunning] = useState(true);
  const speed = useRef(15); // 속도 (난이도)
  
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setPos(p => {
        let next = p + speed.current;
        if (next >= 100 || next <= 0) {
          speed.current *= -1; // 방향 전환
          // 벽 부딪힐 때 가끔 가속되는 페이크
          if (Math.random() < 0.4) {
            speed.current = Math.sign(speed.current) * (Math.abs(speed.current) + Math.random()*5);
          }
          next = p + speed.current;
        }
        return next;
     });
    }, 40);
    return () => clearInterval(t);
  }, [running]);

  const handleStop = () => {
    setRunning(false);
    // 중앙 당첨 구역: 위치 40 ~ 60 (오차범위 20%)
    if (pos >= 40 && pos <= 60) {
      setTimeout(onSuccess, 1000);
    } else {
      setTimeout(onFail, 1000);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center gap-12 p-4">
      <div className="text-center">
        <h2 className="text-2xl font-black mb-2 text-primary">타이밍 슬롯 🎰</h2>
        <p className="text-text/70 text-sm">바가 중앙 형광 구역에 왔을 때 멈추세요!</p>
      </div>
      
      <div className="w-full max-w-[300px] h-14 bg-[#111] rounded-full border border-text/20 relative overflow-hidden shadow-inner">
        {/* 당첨 영역 (중앙 40% ~ 60%) */}
        <div className="absolute top-0 bottom-0 left-[40%] right-[40%] bg-success/20 border-l border-r border-success shadow-[0_0_15px_rgba(0,255,178,0.3)] z-0" />
        
        {/* 움직이는 바 */}
        <div 
           className="absolute top-1 bottom-1 w-6 bg-primary rounded-full shadow-[0_0_15px_rgba(204,255,0,0.8)] z-10"
           style={{ left: `calc(${Math.min(93, Math.max(0, pos))}%)`, transition: running ? 'all 0.04s linear' : 'none' }}
        />
      </div>

      <button 
        onClick={handleStop} 
        disabled={!running}
        className={`w-full max-w-[250px] h-20 font-black rounded-full active:scale-95 transition-all text-xl border-b-8 ${
          running ? 'bg-danger text-white border-red-900 shadow-[0_0_20px_rgba(255,59,59,0.4)]' : 'bg-[#333] text-text/50 border-[#111]'
        }`}
      >
        {running ? 'STOP!' : (pos >= 40 && pos <= 60 ? '통과!' : '실패...')}
      </button>
    </div>
  );
}
