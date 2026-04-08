import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '아 뭐지? (A Mwoji)',
  description: '공부를 방해하는 엉뚱한 호기심! 미니게임을 탈출해서 정답을 확인하세요.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="antialiased selection:bg-primary selection:text-background min-h-[100dvh] overflow-x-hidden">
        {/* Desktop: 2-column layout */}
        <div className="desktop-wrapper">
          {/* Left branding panel - visible only on desktop */}
          <aside className="desktop-brand">
            <div className="brand-content">
              <div className="brand-logo">?</div>
              <h1 className="brand-title">아 뭐지?</h1>
              <p className="brand-subtitle">
                당신의 집중력을 완벽하게 파괴할<br/>
                엉뚱한 일상 호기심 알림 서비스
              </p>
              <div className="brand-features">
                <div className="brand-feature">
                  <span className="brand-feature-icon">🤖</span>
                  <span>AI가 만든 쓸데없는 질문</span>
                </div>
                <div className="brand-feature">
                  <span className="brand-feature-icon">🎮</span>
                  <span>정답 확인까지 미니게임 잠금</span>
                </div>
                <div className="brand-feature">
                  <span className="brand-feature-icon">🔔</span>
                  <span>주기적 푸시 알림으로 공부 방해</span>
                </div>
                <div className="brand-feature">
                  <span className="brand-feature-icon">🔒</span>
                  <span>AES-256 이중 암호화 보안</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Right app area */}
          <div className="app-container">
            <main className="app-main">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
