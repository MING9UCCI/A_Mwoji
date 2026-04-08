'use client';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function RunawayButton({ onSuccess, onFail }: { onSuccess: ()=>void, onFail: ()=>void }) {
  const [timeLeft, setTimeLeft] = useState(5.0);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          clearInterval(t);
          onFail();
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);
    return () => clearInterval(t);
  }, [onFail]);

  const moveButton = () => {
    // 가끔 멈추는 페이크 (15% 확률)
    if (Math.random() < 0.15) return;
    
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      const nx = (Math.random() - 0.5) * (clientWidth - 120);
      const ny = (Math.random() - 0.5) * (clientHeight - 100);
      setPos({ x: nx, y: ny });
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full min-h-[400px] flex flex-col items-center justify-center relative touch-none">
      <div className="absolute top-0 flex flex-col items-center gap-2">
        <h2 className="text-xl font-bold">도망가는 버튼 🏃‍♂️</h2>
        <div className="text-primary font-mono text-2xl font-black">{timeLeft.toFixed(1)}s</div>
      </div>
      <motion.button
        animate={{ x: pos.x, y: pos.y }}
        transition={{ type: 'spring', bounce: 0.6 }}
        onMouseEnter={moveButton}
        onTouchStart={moveButton}
        onClick={onSuccess}
        className="bg-success text-background font-black px-8 py-4 rounded-full shadow-[0_0_20px_rgba(0,255,178,0.5)] cursor-pointer absolute"
      >
        정답 확인
      </motion.button>
    </div>
  );
}
