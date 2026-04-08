'use client';
import { useState, useEffect } from 'react';

export default function MirrorClick({ onSuccess, onFail }: { onSuccess: ()=>void, onFail: ()=>void }) {
  const [timeLeft, setTimeLeft] = useState(10);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [isFlipped, setIsFlipped] = useState(false);
  
  useEffect(() => {
    setActiveIdx(Math.floor(Math.random()*4));
    const t = setInterval(()=> setTimeLeft(l => l - 1), 1000);
    const flipT = setTimeout(() => setIsFlipped(true), 3000);
    return () => { clearInterval(t); clearTimeout(flipT); };
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) onFail();
  }, [timeLeft, onFail]);

  const handleClick = (idx: number) => {
    // 0: top-left, 1: top-right, 2: bot-left, 3: bot-right
    // 반전 맵핑: 0<->3, 1<->2
    const opp = {0:3, 1:2, 2:1, 3:0}[activeIdx] as number;
    const target = isFlipped ? opp : activeIdx;
    
    if (idx === target) onSuccess();
    else onFail();
  };

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black mb-2">거울 신경 검사 <span className="text-primary font-mono">{timeLeft}s</span></h2>
        <p className="text-text/50 text-sm h-5">형광색으로 빛나는 구역을 누르세요.</p>
        <p className={`text-danger font-bold mt-2 text-sm transition-opacity duration-500 ${isFlipped ? 'opacity-100 scale-110' : 'opacity-0'}`}>
          ⚠️ 함정: 좌우 상하가 반전되었습니다! 반대구역을 누르세요!
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4 w-full max-w-[280px] aspect-square bg-[#0a0a0a] p-4 rounded-3xl border border-text/10 shadow-inner">
        {[0,1,2,3].map(i => (
          <button 
            key={i} 
            onClick={() => handleClick(i)}
            className={`rounded-2xl transition-all duration-300 active:scale-95 ${
              activeIdx === i ? 'bg-primary shadow-[0_0_30px_rgba(204,255,0,0.4)] border border-primary/50' : 'bg-[#151515] hover:bg-[#1f1f1f] border border-text/5'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
