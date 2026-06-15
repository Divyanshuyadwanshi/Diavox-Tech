-- Migration: 20260614000009_storage_and_rls.sql
-- Description: Sets up Storage Buckets, bucket-level security policies, and enables database RLS with complete RBAC specifications.

--------------------------------------------------------------------------------
-- 1. PROVISION STORAGE BUCKETS
--------------------------------------------------------------------------------

-- Ensure the storage schema exists (default in Supabase, but safe fallback)
CREATE SCHEMA IF NOT EXISTS storage;

-- Register buckets in storage.buckets table
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('profile-images', 'profile-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml']),
  ('project-images', 'project-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('contract-files', 'contract-files', false, 15728640, ARRAY['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('invoice-files', 'invoice-files', false, 10485760, ARRAY['application/pdf', 'text/plain']),
  ('blog-images', 'blog-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('portfolio-images', 'portfolio-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('chat-files', 'chat-files', true, 26214400, NULL), -- General files
  ('ai-training-files', 'ai-training-files', false, 52428800, NULL) -- Private dataset files
ON CONFLICT (id) DO NOTHING;

--------------------------------------------------------------------------------
-- 2. STORAGE OBJECT POLICIES
--------------------------------------------------------------------------------

-- Select policies
DROP POLICY IF EXISTS "Select Public Buckets" ON storage.objects;
CREATE POLICY "Select Public Buckets" ON storage.objects FOR SELECT USInG (
  bucket_id IN ('profile-images', 'project-images', 'blog-images', 'portfolio-images', 'chat-files')
);

DROP POLICY IF EXISTS "Admins Full Storage access" ON storage.objects;
CREATE POLICY "Admins Full Storage access" ON storage.objects FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid()::text AND role IN ('secret_admin', 'primary_admin', 'secondary_admin')
  )
);

DROP POLICY IF EXISTS "Interactive User Self Management" ON storage.objects;
CREATE POLICY "Interactive User Self Management" ON storage.objects FOR ALL USING (
  auth.role() = 'authenticated'
);

--------------------------------------------------------------------------------
-- 3. ENABLE DATABASE ROW LEVEL SECURITY
--------------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestone_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_training_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

--------------------------------------------------------------------------------
-- 4. RBAC POLICIES DEFINITIONS
--------------------------------------------------------------------------------

-- Dynamic Helper to detect Master/Secret Admin bypassing scopes
CREATE OR REPLACE FUNCTION public.is_secret_admin(uid TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = uid AND role = 'secret_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dynamic Helper to detect general Administration roles
CREATE OR REPLACE FUNCTION public.is_admin(uid TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = uid AND role IN ('secret_admin', 'primary_admin', 'secondary_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dynamic Helper to detect Agency personnel
CREATE OR REPLACE FUNCTION public.is_staff(uid TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = uid AND role IN ('secret_admin', 'primary_admin', 'secondary_admin', 'team_member')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4.1 PROFILES POLICIES
DROP POLICY IF EXISTS "Public Select Profiles" ON public.profiles;
CREATE POLICY "Public Select Profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Profiles Managed By Admins Or Owners" ON public.profiles;
CREATE POLICY "Profiles Managed By Admins Or Owners" ON public.profiles FOR ALL USING (
  public.is_admin(auth.uid()::text) 
  OR auth.uid()::text = id
);


-- 4.2 PROJECTS POLICIES
DROP POLICY IF EXISTS "Projects Scope Access" ON public.projects;
CREATE POLICY "Projects Scope Access" ON public.projects FOR ALL USING (
  public.is_staff(auth.uid()::text)
  OR client_id = auth.uid()::text
);


-- 4.3 CONTRACtS POLICIES
DROP POLICY IF EXISTS "Contracts Scope Access" ON public.contracts;
CREATE POLICY "Contracts Scope Access" ON public.contracts FOR ALL USING (
  public.is_staff(auth.uid()::text)
  OR client_id = auth.uid()::text
);


-- 4.4 INVOICES POLICIES
DROP POLICY IF EXISTS "Invoices Scope Access" ON public.invoices;
CREATE POLICY "Invoices Scope Access" ON public.invoices FOR ALL USING (
  public.is_staff(auth.uid()::text)
  OR client_id = auth.uid()::text
);


-- 4.5 ACTIVE PLANS POLICIES
DROP POLICY IF EXISTS "Active Plans Scope Access" ON public.active_plans;
CREATE POLICY "Active Plans Scope Access" ON public.active_plans FOR ALL USING (
  public.is_staff(auth.uid()::text)
  OR client_id = auth.uid()::text
);


-- 4.6 PLAN APPROVALS POLICIES
DROP POLICY IF EXISTS "Plan Approvals Scope Access" ON public.plan_approvals;
CREATE POLICY "Plan Approvals Scope Access" ON public.plan_approvals FOR ALL USING (
  public.is_staff(auth.uid()::text)
  OR client_id = auth.uid()::text
);


-- 4.7 PRIVATE MESSAGES POLICIES
DROP POLICY IF EXISTS "Private Messages Scope Access" ON public.private_messages;
CREATE POLICY "Private Messages Scope Access" ON public.private_messages FOR ALL USING (
  public.is_secret_admin(auth.uid()::text)
  OR sender_id = auth.uid()::text
  OR recipient_id = auth.uid()::text
);


-- 4.8 TEAM MESSAGES POLICIES
DROP POLICY IF EXISTS "Team Messages Scope Access" ON public.team_messages;
CREATE POLICY "Team Messages Scope Access" ON public.team_messages FOR ALL USING (
  public.is_staff(auth.uid()::text)
);


-- 4.9 QUOTE REQUESTS POLICIES
DROP POLICY IF EXISTS "Quotations Scope Access" ON public.quote_requests;
CREATE POLICY "Quotations Scope Access" ON public.quote_requests FOR ALL USING (
  public.is_staff(auth.uid()::text)
  OR client_id = auth.uid()::text
);


-- 4.10 REVIEWS POLICIES
DROP POLICY IF EXISTS "Reviews Public Read" ON public.reviews;
CREATE POLICY "Reviews Public Read" ON public.reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Reviews Management" ON public.reviews;
CREATE POLICY "Reviews Management" ON public.reviews FOR ALL USING (
  public.is_staff(auth.uid()::text)
  OR client_id = auth.uid()::text
);


-- 4.11 LOGS & AUDITS - RESTRICTED ONLY FOR SECURE ADMINISTRATORS (SECRET ADMIN REMAINS OCCULTED)
DROP POLICY IF EXISTS "Activity Logs restricted select" ON public.activity_logs;
CREATE POLICY "Activity Logs restricted select" ON public.activity_logs FOR SELECT USING (
  public.is_admin(auth.uid()::text)
);

DROP POLICY IF EXISTS "Audit Logs restricted select" ON public.audit_logs;
CREATE POLICY "Audit Logs restricted select" ON public.audit_logs FOR SELECT USING (
  public.is_admin(auth.uid()::text)
);
