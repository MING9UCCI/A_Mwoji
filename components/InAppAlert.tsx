'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Zap } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface InAppAlertProps {
  show: boolean;
  nickname: string;
  onDismiss: () => void;
  onStart: () => void;
}

export default function InAppAlert({ show, nickname, onDismiss, onStart }: InAppAlertProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (show) {
      // Play notification sound
      try {
        audioRef.current = new Audio('/notification.mp3');
        audioRef.current.volume = 0.8;
        audioRef.current.play().catch(() => {});
      } catch (e) {}

      // Vibrate if supported
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 200]);
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-6"
        >
          <motion.div
            initial={{ scale: 0.7, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.7, y: 30 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="bg-[#151515] border border-primary/40 rounded-3xl p-8 w-full max-w-sm shadow-[0_0_80px_rgba(204,255,0,0.2)] flex flex-col items-center gap-5"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
              <AlertTriangle size={32} className="text-primary" />
            </div>

            <h2 className="text-xl font-black text-center leading-snug">
              <span className="text-primary">{nickname}</span>님!<br/>
              집중력 파괴 시간입니다 🔥
            </h2>

            <p className="text-text/60 text-sm text-center font-medium">
              AI가 새로운 엉뚱한 질문을 준비했어요.<br/>
              슬슬 딴짓할 시간 아닌가요?
            </p>

            <button
              onClick={onStart}
              className="w-full bg-primary text-[#0A0A0A] font-black p-4 rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition shadow-[0_0_25px_rgba(204,255,0,0.3)]"
            >
              <Zap size={18} /> 지금 도전하기
            </button>

            <button
              onClick={onDismiss}
              className="text-text/30 text-xs font-medium hover:text-text/50 transition"
            >
              나중에 할게요 (집중 계속)
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
