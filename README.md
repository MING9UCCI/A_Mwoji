# 🤯 아 뭐지? (A Mwoji)

> 공부 따위, 아 뭐지? 당신의 집중력을 완벽하게 파괴할 엉뚱한 일상 호기심 알림 서비스

대학생들의 굳건한 공부 의지를 꺾고 딴짓을 장려하기 위해 기획된 악질 PWA 웹 애플리케이션입니다. 
지정된 시간마다 AI가 생성한 '쓸데없지만 묘하게 궁금한 질문'을 푸시 알림으로 전송하며, 정답을 확인하려면 극악무도한 미니게임 3종을 통과해야 합니다.

---

## ✨ 주요 기능

- **AI 엉뚱 질문 생성**: Google Gemini 2.5 Flash를 활용해 대학생 타겟의 킹받는 일상 호기심 자동 생성
- **짜증 유발 미니게임**: 정답을 절대 쉽게 보여주지 않는 페이크 미니게임 3종 탑재
  - 🏃‍♂️ 도망가는 버튼: 잡힐 듯 잡히지 않고 페이크를 거는 버튼 구조
  - 🪞 거울 신경 검사: 터치 3초 후 상하좌우 반전 조작 (낚시 특화)
  - 🎰 타이밍 슬롯: 성공 범위가 비정상적으로 좁고 불규칙하게 반전되는 슬롯
  - 🎯 최후의 룰렛: 3회 실패 시 최종 구제 확률망겜 판독기 등장
- **PWA 반응형 지원**: iOS 접속 감지 및 홈 화면 추가 유도 가이드를 통한 네이티브 앱 경험 제공
- **단호한 정답 스포일러 차단**:
  - DB 저장 시 AES-256 규격의 정답 이중 암호화
  - 미니게임 통과자 한정 1회용 토큰 발급 및 서버사이드 복호화 진행 (API 해킹 원천 차단)
- **공유하기**: Web Share API를 활용한 친구 대상 공부 방해 링크 생성 네트워크

## 🛠 기술 스택

- **Frontend**: Next.js 14 (App Router), TailwindCSS, Framer Motion
- **Backend / Database**: Supabase (PostgreSQL, RLS)
- **AI Model**: Google Gemini API (gemini-2.5-flash)
- **Security & Utils**: Web Push API, AES-256 Crypto, Vercel Cron

## 🚀 로컬 실행 방법

### 1. 환경 변수 설정
프로젝트 루트 폴더에 `.env.local` 파일을 생성하고 아래 값들을 채워넣습니다.
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

GEMINI_API_KEY=your_gemini_api_key

NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
ENCRYPTION_KEY=your_32byte_hex_encryption_key
```

### 2. 패키지 설치 및 실행
```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`에 접속하여 서비스를 확인합니다.

---
*개발: Mwoji Team | All rights reserved.*
