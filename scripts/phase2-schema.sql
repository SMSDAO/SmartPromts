-- Phase 2 Database Schema for SmartPromts
-- Run this against your Supabase project

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- DATASETS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS datasets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  input_examples JSONB NOT NULL DEFAULT '[]',
  expected_outputs JSONB NOT NULL DEFAULT '[]',
  category TEXT DEFAULT 'general',
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_datasets_created_by ON datasets(created_by);
CREATE INDEX IF NOT EXISTS idx_datasets_category ON datasets(category);

ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD their own datasets" ON datasets
  FOR ALL USING (auth.uid() = created_by);

-- =====================
-- BENCHMARK RUNS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS benchmark_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dataset_id TEXT NOT NULL,
  prompt_id TEXT NOT NULL,
  score FLOAT NOT NULL DEFAULT 0,
  latency_avg FLOAT NOT NULL DEFAULT 0,
  token_cost FLOAT NOT NULL DEFAULT 0,
  success_rate FLOAT NOT NULL DEFAULT 0,
  results JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_benchmark_runs_user_id ON benchmark_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_benchmark_runs_prompt_id ON benchmark_runs(prompt_id);

ALTER TABLE benchmark_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own benchmark runs" ON benchmark_runs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own benchmark runs" ON benchmark_runs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================
-- PROMPT VARIANTS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS prompt_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_prompt_id TEXT NOT NULL,
  prompt TEXT NOT NULL,
  score FLOAT NOT NULL DEFAULT 0,
  technique TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prompt_variants_user_id ON prompt_variants(user_id);

ALTER TABLE prompt_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD their own variants" ON prompt_variants
  FOR ALL USING (auth.uid() = user_id);

-- =====================
-- EXPERIMENTS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS experiments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  prompt_a_id TEXT NOT NULL,
  prompt_b_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'cancelled')),
  winner TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_experiments_created_by ON experiments(created_by);
CREATE INDEX IF NOT EXISTS idx_experiments_status ON experiments(status);

ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD their own experiments" ON experiments
  FOR ALL USING (auth.uid() = created_by);

-- =====================
-- AGENTS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  tools JSONB NOT NULL DEFAULT '[]',
  prompts JSONB NOT NULL DEFAULT '[]',
  workflow_graph JSONB,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agents_created_by ON agents(created_by);

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD their own agents" ON agents
  FOR ALL USING (auth.uid() = created_by);

-- =====================
-- AGENT RUNS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS agent_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  input TEXT NOT NULL,
  output TEXT NOT NULL,
  steps JSONB NOT NULL DEFAULT '[]',
  tokens_used INTEGER NOT NULL DEFAULT 0,
  latency_ms INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_runs_user_id ON agent_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_agent_id ON agent_runs(agent_id);

ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own agent runs" ON agent_runs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own agent runs" ON agent_runs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================
-- MARKETPLACE PROMPTS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS marketplace_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  prompt TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  price FLOAT NOT NULL DEFAULT 0 CHECK (price >= 0),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  downloads INTEGER NOT NULL DEFAULT 0,
  rating FLOAT NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  tags JSONB NOT NULL DEFAULT '[]',
  license TEXT NOT NULL DEFAULT 'personal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_prompts_creator_id ON marketplace_prompts(creator_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_prompts_category ON marketplace_prompts(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_prompts_price ON marketplace_prompts(price);
CREATE INDEX IF NOT EXISTS idx_marketplace_prompts_downloads ON marketplace_prompts(downloads DESC);

ALTER TABLE marketplace_prompts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read marketplace prompts" ON marketplace_prompts
  FOR SELECT USING (true);
CREATE POLICY "Creators can insert their own prompts" ON marketplace_prompts
  FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update their own prompts" ON marketplace_prompts
  FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Creators can delete their own prompts" ON marketplace_prompts
  FOR DELETE USING (auth.uid() = creator_id);

-- =====================
-- PROMPT PURCHASES TABLE
-- =====================
CREATE TABLE IF NOT EXISTS prompt_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt_id UUID NOT NULL REFERENCES marketplace_prompts(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount FLOAT NOT NULL DEFAULT 0,
  creator_payout FLOAT NOT NULL DEFAULT 0,
  platform_fee FLOAT NOT NULL DEFAULT 0,
  license_type TEXT NOT NULL DEFAULT 'personal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(prompt_id, buyer_id)
);

CREATE INDEX IF NOT EXISTS idx_prompt_purchases_buyer_id ON prompt_purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_prompt_purchases_prompt_id ON prompt_purchases(prompt_id);

ALTER TABLE prompt_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Buyers can read their own purchases" ON prompt_purchases
  FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "Authenticated users can insert purchases" ON prompt_purchases
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- =====================
-- USAGE EVENTS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS usage_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  prompt_id TEXT,
  model TEXT,
  tokens INTEGER,
  cost FLOAT,
  latency_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_events_user_id ON usage_events(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_events_event_type ON usage_events(event_type);
CREATE INDEX IF NOT EXISTS idx_usage_events_created_at ON usage_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_events_prompt_id ON usage_events(prompt_id) WHERE prompt_id IS NOT NULL;

ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own usage events" ON usage_events
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own usage events" ON usage_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================
-- ANALYTICS LATENCY TABLE
-- =====================
CREATE TABLE IF NOT EXISTS analytics_latency (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model TEXT NOT NULL,
  latency_ms INTEGER NOT NULL,
  prompt_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_latency_user_id ON analytics_latency(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_latency_model ON analytics_latency(model);

ALTER TABLE analytics_latency ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD their own latency records" ON analytics_latency
  FOR ALL USING (auth.uid() = user_id);

-- =====================
-- ANALYTICS SUCCESS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS analytics_success (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_id TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT false,
  score FLOAT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_success_user_id ON analytics_success(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_success_prompt_id ON analytics_success(prompt_id);

ALTER TABLE analytics_success ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD their own success records" ON analytics_success
  FOR ALL USING (auth.uid() = user_id);
