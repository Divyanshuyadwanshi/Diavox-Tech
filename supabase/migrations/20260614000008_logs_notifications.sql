-- Migration: 20260614000008_logs_notifications.sql
-- Description: Creates activity_logs, audit_logs, and notifications tables.

-- GENERAL USER WORKSPACE ACTION LOGGING
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  previous_state TEXT,
  next_state TEXT,
  ip_address VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RIGID ADMINISTRATIVE SYSTEM AUDIT trails
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id VARCHAR(255) REFERENCES public.profiles(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DISPATCHED TARGET NOTIFICATION FEEDS
CREATE TABLE IF NOT EXISTS public.notifications (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES public.profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read);
