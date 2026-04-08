'use client';
import { useEffect, useState } from 'react';
import { Share, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InstallPWA() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || ('standalone' in navigator && (navigator as any).standalone === true);
    
    if (isIOS && !isStandalone) {
      // 잠깐 텀을 두고 안내 모달을 띄워서 UX 개선
      setTimeout(() => setShowPrompt(true), 2000);
    }
  }, []);

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div 
          initial={{ y: 150, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 150, opacity: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-[#1A1A1A] border border-primary/40 rounded-2xl p-4 shadow-2xl shadow-primary/10 z-[99]"
        >
          <button 
            onClick={() => setShowPrompt(false)}
            className="absolute right-3 top-3 text-text/50 hover:text-text transition"
          >
            <X size={18} />
          </button>
          
          <div className="flex flex-col gap-2 pt-1">
            <h3 className="font-bold text-primary">푸시 알림을 받으시려면 👉</h3>
            <p className="text-sm text-text/80 leading-relaxed">
              아이폰은 바탕화면에 <strong className="text-text">홈 화면에 추가</strong>를 해주셔야 어그로 푸시 알림을 받을 수 있어요!
            </p>
            <div className="mt-2 text-sm flex items-center gap-1.5 bg-background p-3 rounded-lg border border-text/10">
              <span className="shrink-0 text-text/60">1. 사파리 하단의</span>
              <Share size={18} className="text-blue-500 mx-0.5 shrink-0" /> 
              <span className="shrink-0 text-text/60">공유 누르기</span>
            </div>
            <div className="mt-1 text-sm flex items-center gap-1.5 bg-background p-3 rounded-lg border border-text/10">
              <span className="shrink-0 text-text/60">2. 스크롤을 내려</span>
              <strong className="text-text">홈 화면에 추가</strong>
              <span className="shrink-0 text-text/60">누르기</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
