import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '아 뭐지? (A Mwoji)',
  description: '공부를 방해하는 엉뚱한 호기심! 미니게임을 탈출해서 정답을 확인하세요.',
  manifest: '/manifest.json',
  icons: {
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="antialiased selection:bg-primary selection:text-background min-h-[100dvh] overflow-x-hidden flex flex-col items-center">
        <main className="w-full max-w-md min-h-[100dvh] flex flex-col relative px-4">
          {children}
        </main>
      </body>
    </html>
  );
}
