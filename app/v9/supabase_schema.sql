-- ============================================================
-- 经方学习系统 v9 · Supabase 建表 SQL
-- 适用：Supabase SQL Editor (PostgreSQL)
-- 说明：一次性全量建表，含 RLS 策略
-- 创建日期：2026-07-16
-- ============================================================

-- 0. 扩展（UUID 生成）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. profiles — 用户资料
-- 由 auth.register() 自动创建
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS: 用户只能读写自己的资料
CREATE POLICY "users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================
-- 2. mastery_state — 掌握度
-- 唯一约束: (user_id, card_id, vector)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.mastery_state (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id         TEXT NOT NULL,
  vector          TEXT NOT NULL,
  level           INT DEFAULT 0,
  status          TEXT DEFAULT '未知',
  streak_right    INT DEFAULT 0,
  streak_wrong    INT DEFAULT 0,
  total_rights    INT DEFAULT 0,
  total_wrongs    INT DEFAULT 0,
  last_result     TEXT,
  last_review     TIMESTAMPTZ,
  "next_review"   BIGINT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  -- 唯一约束：每张卡片每个向量一条
  CONSTRAINT mastery_unique UNIQUE (user_id, card_id, vector)
);

-- 索引：按用户查询
CREATE INDEX IF NOT EXISTS idx_mastery_user ON public.mastery_state(user_id);
-- 索引：按卡片查询
CREATE INDEX IF NOT EXISTS idx_mastery_card ON public.mastery_state(user_id, card_id);

ALTER TABLE public.mastery_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can read own mastery"
  ON public.mastery_state FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users can insert own mastery"
  ON public.mastery_state FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can update own mastery"
  ON public.mastery_state FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "users can delete own mastery"
  ON public.mastery_state FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- 3. notes — 笔记（统一笔记存储）
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type            TEXT NOT NULL DEFAULT 'study',       -- study | clinical | annotation
  card_id         TEXT,                                 -- 关联卡片 ID
  source_id       TEXT,                                 -- 原文/来源 ID
  content         TEXT DEFAULT '',
  tags            JSONB DEFAULT '[]'::jsonb,
  vector          TEXT,                                 -- 掌握度向量
  vector_label    TEXT,
  diagnosis       TEXT,                                 -- 诊断标签
  diagnosis_label TEXT,
  question        TEXT,
  selected        TEXT,
  correct         TEXT,
  prompt          TEXT,
  review_schedule JSONB,                                -- 间隔重复时间戳数组
  source_title    TEXT,
  source_chapter  TEXT,
  source_text     TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notes_user ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_type ON public.notes(user_id, type);
CREATE INDEX IF NOT EXISTS idx_notes_card ON public.notes(user_id, card_id);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can read own notes"
  ON public.notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users can insert own notes"
  ON public.notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can update own notes"
  ON public.notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "users can delete own notes"
  ON public.notes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- 4. clinical_records — 临床档案
-- ============================================================
CREATE TABLE IF NOT EXISTS public.clinical_records (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_name     TEXT DEFAULT '匿名',
  symptoms         JSONB DEFAULT '[]'::jsonb,
  input_text       TEXT DEFAULT '',
  note             TEXT DEFAULT '',
  related_person_id TEXT,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clinical_user ON public.clinical_records(user_id);
CREATE INDEX IF NOT EXISTS idx_clinical_name ON public.clinical_records(user_id, patient_name);

ALTER TABLE public.clinical_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can read own clinical records"
  ON public.clinical_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users can insert own clinical records"
  ON public.clinical_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can update own clinical records"
  ON public.clinical_records FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "users can delete own clinical records"
  ON public.clinical_records FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- 5. answer_history — 答题历史
-- ============================================================
CREATE TABLE IF NOT EXISTS public.answer_history (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id         TEXT NOT NULL,
  card_name       TEXT DEFAULT '',
  vector          TEXT DEFAULT '',
  vector_label    TEXT DEFAULT '',
  is_correct      BOOLEAN DEFAULT true,
  mode            TEXT DEFAULT '',    -- test | review | exam
  selected_label  TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_answer_user ON public.answer_history(user_id);
CREATE INDEX IF NOT EXISTS idx_answer_card ON public.answer_history(user_id, card_id);
CREATE INDEX IF NOT EXISTS idx_answer_date ON public.answer_history(user_id, created_at);

ALTER TABLE public.answer_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can read own answers"
  ON public.answer_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users can insert own answers"
  ON public.answer_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 6. card_stats — 卡片统计
-- ============================================================
CREATE TABLE IF NOT EXISTS public.card_stats (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id           TEXT NOT NULL,
  card_name         TEXT DEFAULT '',
  total_attempts    INT DEFAULT 0,
  total_errors      INT DEFAULT 0,
  vector_errors     JSONB DEFAULT '{}'::jsonb,
  option_choices    JSONB DEFAULT '{}'::jsonb,
  last_error        TIMESTAMPTZ,
  consecutive_errors INT DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT card_stats_unique UNIQUE (user_id, card_id)
);

CREATE INDEX IF NOT EXISTS idx_card_stats_user ON public.card_stats(user_id);

ALTER TABLE public.card_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can read own card stats"
  ON public.card_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users can insert own card stats"
  ON public.card_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can update own card stats"
  ON public.card_stats FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- 7. daily_stats — 每日统计
-- ============================================================
CREATE TABLE IF NOT EXISTS public.daily_stats (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date      DATE NOT NULL,
  total     INT DEFAULT 0,
  "right"   INT DEFAULT 0,
  "wrong"   INT DEFAULT 0,
  card_ids  JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT daily_stats_unique UNIQUE (user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_user ON public.daily_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_date ON public.daily_stats(user_id, date);

ALTER TABLE public.daily_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can read own daily stats"
  ON public.daily_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users can insert own daily stats"
  ON public.daily_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can update own daily stats"
  ON public.daily_stats FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- 8. 自动更新 updated_at 触发器
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为所有含 updated_at 的表创建触发器
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY['profiles', 'mastery_state', 'notes', 'clinical_records', 'card_stats', 'daily_stats'])
  LOOP
    EXECUTE format(
      'CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();',
      tbl, tbl
    );
  END LOOP;
END;
$$;
