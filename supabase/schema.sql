-- 사용자
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  nickname text not null,
  push_subscription jsonb,
  notify_interval text default '1hour', -- '30min' | '1hour' | 'random'
  created_at timestamptz default now()
);

-- 질문
create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer_encrypted text not null, -- 정답 AES-256 암호화 저장
  created_at timestamptz default now()
);

-- 사용자별 질문 기록
create table if not exists user_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  question_id uuid references questions(id) on delete cascade,
  game_attempts int default 0,
  revealed boolean default false,
  reveal_token text,              -- 1회용 게임 통과 토큰
  token_expires_at timestamptz,
  created_at timestamptz default now()
);

-- 게임 통계
create table if not exists user_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  total_notifications int default 0,
  total_game_attempts int default 0,
  total_clears int default 0,
  total_revealed int default 0,
  updated_at timestamptz default now()
);

-- RLS (Row Level Security) 설정
alter table users enable row level security;
alter table questions enable row level security;
alter table user_questions enable row level security;
alter table user_stats enable row level security;

-- 정책 (단순화를 위해 클라이언트에서는 읽기/쓰기를 본인 세션키 등으로 관리하거나, 
-- 익명 허용 정책 후 애플리케이션 레벨(UUID 로컬스토리지 저장)에서 인증하는 방식으로 사용)
create policy "Anyone can insert users" on users for insert with check (true);
create policy "Users can view own data" on users for select using (true);
create policy "Users can update own data" on users for update using (true);

create policy "Anyone can view questions" on questions for select using (true);
-- questions 테이블의 생성/수정은 API 단에서 Service Role 로만 진행할 예정 (정책 불필요)

create policy "Anyone can insert user_questions" on user_questions for insert with check (true);
create policy "Users can view own user_questions" on user_questions for select using (true);
create policy "Users can update own user_questions" on user_questions for update using (true);

create policy "Anyone can insert user_stats" on user_stats for insert with check (true);
create policy "Users can view own user_stats" on user_stats for select using (true);
create policy "Users can update own user_stats" on user_stats for update using (true);

-- 트리거: 새로운 유저가 생성될 때 자동으로 user_stats 레코드를 생성
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_stats (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_user_created on public.users;
create trigger on_user_created
  after insert on public.users
  for each row execute procedure public.handle_new_user();
