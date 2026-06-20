-- Migration: 20260614000003_plans_subscriptions_approvals.sql
-- Description: Creates plans, active_plans, subscriptions, and plan_approvals tables.

-- PLANS REFERENCE TABLE
CREATE TABLE IF NOT EXISTS public.plans (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price_monthly NUMERIC(10,2) NOT NULL,
  price_yearly NUMERIC(10,2) NOT NULL,
  features TEXT[] NOT NULL,
  is_popular BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ACTIVE PLANS (ACTIVE TENANCIES)
CREATE TABLE IF NOT EXISTS public.active_plans (
  id VARCHAR(255) PRIMARY KEY,
  client_id VARCHAR(255) REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_name VARCHAR(50) NOT NULL, -- Starter, Professional, Enterprise
  status VARCHAR(50) NOT NULL, -- Pending, Active, Expired
  billing_cycle VARCHAR(50) NOT NULL, -- Monthly, Annual
  price VARCHAR(50) NOT NULL,
  start_date VARCHAR(100) NOT NULL,
  renewal_date VARCHAR(100) NOT NULL,
  features TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUBSCRIPTIONS META
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id VARCHAR(255) PRIMARY KEY,
  client_id VARCHAR(255) REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'unverified', -- verified, unverified, active
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PLAN APPROVAL REQUESTS (PROPOSALS)
CREATE TABLE IF NOT EXISTS public.plan_approvals (
  id VARCHAR(255) PRIMARY KEY,
  client_id VARCHAR(255) REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_name VARCHAR(255) NOT NULL,
  plan_name VARCHAR(50) NOT NULL,
  billing_cycle VARCHAR(50) NOT NULL,
  price VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Pending Approval', -- Pending Approval, Approved, Rejected
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_active_plans_client ON public.active_plans(client_id);
CREATE INDEX IF NOT EXISTS idx_active_plans_status ON public.active_plans(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_client ON public.subscriptions(client_id);
CREATE INDEX IF NOT EXISTS idx_plan_approvals_client ON public.plan_approvals(client_id);
