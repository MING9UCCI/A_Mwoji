'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const MENTS = [
  "진심으로 이게 어려웠나요?",
  "휴, 공부나 다시 하러 가시는 게...",
  "AI도 당신의 순발력에 한숨을 쉽니다.",
  "이걸 놓치네 ㅋㅋㅋ",
  "다시 해봐요 쫌!",
  "오늘 안엔 풀 수 있죠?",
  "이게 무슨 반응속도?",
  "손가락이 떨리시나요? 😏",
];

export default function FailReaction({ onNext }: { onNext: ()=>void }) {
  const [ment] = useState(MENTS[Math.floor(Math.random() * MENTS.length)]);
  const [cooldown, setCooldown] = useState(5);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  return (
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }} 
      animate={{ scale: 1, opacity: 1, x: [-5, 5, -5, 5, 0] }} 
      transition={{ duration: 0.3 }}
      className="absolute inset-0 flex flex-col items-center justify-center bg-danger/10 backdrop-blur-md z-50 p-6"
    >
      <div className="bg-[#151515] border border-danger/50 p-8 rounded-[2rem] flex flex-col items-center shadow-[0_0_50px_rgba(255,59,59,0.2)] w-full max-w-xs">
        <div className="text-5xl mb-6">🤦‍♂️</div>
        <h2 className="text-2xl font-black text-danger mb-4">어이쿠!</h2>
        <p className="text-text/90 mb-8 text-center font-medium leading-relaxed">"{ment}"</p>
        
        <button 
          onClick={onNext} 
          disabled={cooldown > 0}
          className={`w-full py-4 rounded-2xl font-black transition-all border-b-4 ${
            cooldown > 0 
              ? 'bg-[#333] text-text/40 border-[#222] cursor-not-allowed' 
              : 'bg-danger text-white border-red-900 hover:bg-red-600 active:scale-95'
          }`}
        >
          {cooldown > 0 
            ? `${cooldown}초 후 재도전 가능...` 
            : '다시 도전하기 💪'
          }
        </button>
      </div>
    </motion.div>
  );
}
