-- =============================================================================
-- DIAVOX TECH AGENCY - PLATFORM DATABASE DDL SCHEMA (CONSOLIDATED)
-- =============================================================================
-- This script contains all CREATE TABLE, ALTER TABLE, trigger, index,
-- storage bucket provisioning, and modern RLS policies. It is identical
-- to the structured split migrations in `supabase/migrations/` and can be
-- executed direct in the Supabase SQL editor.
-- =============================================================================

-- ENABLE UUID EXTENSION
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--------------------------------------------------------------------------------
-- 1. AUTHENTICATION & PROFILES SYSTEM
--------------------------------------------------------------------------------

-- Profiles Table
-- Handles both local string IDs and real Supabase Auth UUID strings
CREATE TABLE IF NOT EXISTS public.profiles (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE,
  role VARCHAR(50) NOT NULL DEFAULT 'client', -- secret_admin, primary_admin, secondary_admin, team_member, client
  avatar_url TEXT,
  phone VARCHAR(50),
  department VARCHAR(100), -- Web Dev, SEO, AI, Design, Business Growth
  bio TEXT,
  hourly_rate NUMERIC(10,2),
  status VARCHAR(50) DEFAULT 'active', -- active, suspended
  skills TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Roles Table (Detailed RBAC)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) REFERENCES public.profiles(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Permissions Table
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Role Permissions Junction
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role VARCHAR(50) NOT NULL,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role, permission_id)
);

-- USER TYPES DETAILED SUB-TABLES (Optional Extension structures)
CREATE TABLE IF NOT EXISTS public.admins (
  profile_id VARCHAR(255) PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  super_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.team_members (
  profile_id VARCHAR(255) PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  position VARCHAR(100),
  department VARCHAR(100),
  hourly_rate NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.clients (
  profile_id VARCHAR(255) PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name VARCHAR(255),
  industry VARCHAR(100),
  website VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

--------------------------------------------------------------------------------
-- 2. PROJECTS & SUB-ENTITIES
--------------------------------------------------------------------------------

-- Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL, -- Website Development, Website Design, SEO, AI Automation
  technologies TEXT[],
  image_url TEXT,
  completion_date VARCHAR(100),
  live_url TEXT,
  status VARCHAR(50) DEFAULT 'ongoing', -- ongoing, completed, backlog
  client_id VARCHAR(255) REFERENCES public.profiles(id) ON DELETE SET NULL,
  client_name VARCHAR(255),
  progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  delivery_date TIMESTAMPTZ,
  assigned_to TEXT[], -- Array of Profile IDs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Progress Logs
CREATE TABLE IF NOT EXISTS public.project_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id VARCHAR(255) REFERENCES public.projects(id) ON DELETE CASCADE,
  author_id VARCHAR(255) REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name VARCHAR(255) NOT NULL,
  update_text TEXT NOT NULL,
  file_url TEXT,
  file_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Milestone Schedules
CREATE TABLE IF NOT EXISTS public.project_milestones (
  id VARCHAR(255) PRIMARY KEY,
  project_id VARCHAR(255) REFERENCES public.projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  amount TEXT,
  percentage INT DEFAULT 0,
  due_date VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending', -- pending, waiting_approval, released
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Assignments Junction (For resource allocations)
CREATE TABLE IF NOT EXISTS public.project_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id VARCHAR(255) REFERENCES public.projects(id) ON DELETE CASCADE,
  profile_id VARCHAR(255) REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, profile_id)
);

--------------------------------------------------------------------------------
-- 3. CONTRACTS
--------------------------------------------------------------------------------

-- Service Level Contracts
CREATE TABLE IF NOT EXISTS public.contracts (
  id VARCHAR(255) PRIMARY KEY,
  client_id VARCHAR(255) REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_name VARCHAR(255) NOT NULL,
  project_title VARCHAR(255) NOT NULL,
  details TEXT,
  terms TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'Draft', -- Draft, Pending Signature, Signed, Active, Expired
  price VARCHAR(50),
  file_url TEXT, -- Saved Supabase Storage URL
  file_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

--------------------------------------------------------------------------------
-- 4. INVOICES
--------------------------------------------------------------------------------

-- Invoices Table
CREATE TABLE IF NOT EXISTS public.invoices (
  id VARCHAR(255) PRIMARY KEY,
  invoice_number VARCHAR(100),
  client_id VARCHAR(255) REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  amount VARCHAR(100) NOT NULL, -- Matched with client UI dollar fields
  status VARCHAR(50) DEFAULT 'unpaid', -- unpaid, paid, overdue, cancelled
  due_date VARCHAR(50) NOT NULL,
  services TEXT,
  items JSONB, -- Array of items details
  pdf_url TEXT, -- Invoices attachments
  taxes VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

--------------------------------------------------------------------------------
-- 5. PLANS & SUBSCRIPTIONS
--------------------------------------------------------------------------------

-- Subscription Plans Directory
CREATE TABLE IF NOT EXISTS public.plans (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price_monthly NUMERIC(10,2) NOT NULL,
  price_yearly NUMERIC(10,2) NOT NULL,
  features TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Active Client Plans (Active Tenancies)
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

-- Subscriptions Meta
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id VARCHAR(255) PRIMARY KEY,
  client_id VARCHAR(255) REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'unverified', -- verified, unverified, active
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Upgrade / Switch Approval Requests
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

--------------------------------------------------------------------------------
-- 6. CLIENT REVIEWS & REPUTATION
--------------------------------------------------------------------------------

-- Reviews (Testimonials) Table
CREATE TABLE IF NOT EXISTS public.reviews (
  id VARCHAR(255) PRIMARY KEY,
  client_id VARCHAR(255) REFERENCES public.profiles(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  role VARCHAR(100),
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  avatar_url TEXT,
  date TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'Pending', -- Pending, Approved, Rejected, Hidden
  featured BOOLEAN DEFAULT FALSE,
  admin_reply TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agency Social Media Display Links
CREATE TABLE IF NOT EXISTS public.social_media_links (
  id VARCHAR(255) PRIMARY KEY,
  platform VARCHAR(150) NOT NULL,
  url TEXT NOT NULL,
  icon VARCHAR(100) NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio Items
CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  cover_image TEXT,
  tags TEXT[],
  demo_url TEXT,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scientific / General Blogs
CREATE TABLE IF NOT EXISTS public.blogs (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(150) NOT NULL,
  image_url TEXT,
  author_name VARCHAR(150) NOT NULL,
  read_time VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

--------------------------------------------------------------------------------
-- 7. TRANSACTIONS & PAYMENTS
--------------------------------------------------------------------------------

-- Transactions Registry
CREATE TABLE IF NOT EXISTS public.transactions (
  id VARCHAR(255) PRIMARY KEY,
  client_id VARCHAR(255) REFERENCES public.profiles(id) ON DELETE SET NULL,
  invoice_id VARCHAR(255) REFERENCES public.invoices(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  status VARCHAR(50) NOT NULL, -- Pending, Completed, Cancelled, Failed
  payment_method VARCHAR(50),
  reference_no VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Historical Payments Ledger
CREATE TABLE IF NOT EXISTS public.payment_history (
  id VARCHAR(255) PRIMARY KEY,
  client_id VARCHAR(255) REFERENCES public.profiles(id) ON DELETE SET NULL,
  amount VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL, -- Pending, Completed, Cancelled, Overdue, Incoming
  plan_or_project VARCHAR(255) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  date VARCHAR(100) NOT NULL,
  invoice_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Real-Time Payment Links
CREATE TABLE IF NOT EXISTS public.payment_links (
  id VARCHAR(255) PRIMARY KEY,
  invoice_id VARCHAR(255) REFERENCES public.invoices(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Milestone Release Logs
CREATE TABLE IF NOT EXISTS public.milestone_payments (
  id VARCHAR(255) PRIMARY KEY,
  project_id VARCHAR(255) REFERENCES public.projects(id) ON DELETE CASCADE,
  milestone_title VARCHAR(255) NOT NULL,
  amount VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'unpaid', -- unpaid, paid, request_sent
  client_id VARCHAR(255) REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

--------------------------------------------------------------------------------
-- 8. QUOTES & bespoke SERVICE REQUESTS
--------------------------------------------------------------------------------

-- Custom Quotation Inquiries
CREATE TABLE IF NOT EXISTS public.quote_requests (
  id VARCHAR(255) PRIMARY KEY,
  client_id VARCHAR(255) REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  service_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  budget VARCHAR(100),
  status VARCHAR(50) DEFAULT 'Pending', -- Pending, In Progress, Quoted, Approved, Rejected
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quote Replies Correspondence
CREATE TABLE IF NOT EXISTS public.quote_replies (
  id VARCHAR(255) PRIMARY KEY,
  quote_id VARCHAR(255) REFERENCES public.quote_requests(id) ON DELETE CASCADE,
  author_id VARCHAR(255) REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name VARCHAR(255) NOT NULL,
  author_role VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quote Specification Attachments
CREATE TABLE IF NOT EXISTS public.quote_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id VARCHAR(255) REFERENCES public.quote_requests(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scope status evolution
CREATE TABLE IF NOT EXISTS public.quote_status_history (
  id VARCHAR(255) PRIMARY KEY,
  quote_id VARCHAR(255) REFERENCES public.quote_requests(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  changed_by VARCHAR(255) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

--------------------------------------------------------------------------------
-- 9. COMMUNICATIOns (CHATS & PRIVATE MESSAGING)
--------------------------------------------------------------------------------

-- Conversations System Directory
CREATE TABLE IF NOT EXISTS public.conversations (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255),
  is_group BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- General Lobby Stream
CREATE TABLE IF NOT EXISTS public.messages (
  id VARCHAR(255) PRIMARY KEY,
  sender_id VARCHAR(255) REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_name VARCHAR(255) NOT NULL,
  sender_role VARCHAR(100) NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team Channels / Department rooms
CREATE TABLE IF NOT EXISTS public.team_groups (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ongoing Project Secure Rooms
CREATE TABLE IF NOT EXISTS public.project_groups (
  id VARCHAR(255) PRIMARY KEY,
  project_id VARCHAR(255) REFERENCES public.projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  assigned_members TEXT[], -- Array of Profile IDs
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Specific / Team messages Feed
CREATE TABLE IF NOT EXISTS public.team_messages (
  id VARCHAR(255) PRIMARY KEY,
  group_id VARCHAR(255) NOT NULL, -- references team_groups or project_groups ID
  sender_id VARCHAR(255) REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_name VARCHAR(255) NOT NULL,
  sender_role VARCHAR(150),
  text TEXT NOT NULL,
  file_url TEXT,
  file_name TEXT,
  is_image BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Absolute Encrypted / Private direct messaging
CREATE TABLE IF NOT EXISTS public.private_messages (
  id VARCHAR(255) PRIMARY KEY,
  sender_id VARCHAR(255) REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_name VARCHAR(255) NOT NULL,
  recipient_id VARCHAR(255) REFERENCES public.profiles(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

--------------------------------------------------------------------------------
-- 10. NOTIFICATIONS, AUDITING, & LOGS
--------------------------------------------------------------------------------

-- User notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES public.profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Member Actions Tracer
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  previous_state TEXT,
  next_state TEXT,
  ip_address VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Security Audit Ledger
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id VARCHAR(255) REFERENCES public.profiles(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

--------------------------------------------------------------------------------
-- 11. AI COGNITIVE MODEL MODULES
--------------------------------------------------------------------------------

-- Q&A Training Ingestion Library
CREATE TABLE IF NOT EXISTS public.ai_knowledge (
  id VARCHAR(255) PRIMARY KEY,
  category VARCHAR(150) NOT NULL, -- pricing, onboarding, generic, contract
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Knowledge / Calibration Training files
CREATE TABLE IF NOT EXISTS public.ai_training_files (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL, -- pdf, faq, pricing, blog, service_info, project_info
  content TEXT NOT NULL,
  uploaded_by_id VARCHAR(255) REFERENCES public.profiles(id) ON DELETE SET NULL,
  uploaded_by_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

--------------------------------------------------------------------------------
-- 12. DATABASE INDEXES
--------------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_project_progress_project ON public.project_progress(project_id);
CREATE INDEX IF NOT EXISTS idx_project_milestones_project ON public.project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_project_assignments_profile ON public.project_assignments(profile_id);
CREATE INDEX IF NOT EXISTS idx_contracts_client ON public.contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON public.contracts(status);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON public.invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_active_plans_client ON public.active_plans(client_id);
CREATE INDEX IF NOT EXISTS idx_active_plans_status ON public.active_plans(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_client ON public.subscriptions(client_id);
CREATE INDEX IF NOT EXISTS idx_plan_approvals_client ON public.plan_approvals(client_id);
CREATE INDEX IF NOT EXISTS idx_transactions_client ON public.transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_client ON public.payment_history(client_id);
CREATE INDEX IF NOT EXISTS idx_payment_links_invoice ON public.payment_links(invoice_id);
CREATE INDEX IF NOT EXISTS idx_milestone_payments_project ON public.milestone_payments(project_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(status);
CREATE INDEX IF NOT EXISTS idx_quote_requests_client ON public.quote_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON public.quote_requests(status);
CREATE INDEX IF NOT EXISTS idx_quote_replies_quote ON public.quote_replies(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_attachments_quote ON public.quote_attachments(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_status_history_quote ON public.quote_status_history(quote_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_team_messages_group ON public.team_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_team_messages_sender ON public.team_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_private_messages_pair ON public.private_messages(sender_id, recipient_id);
CREATE INDEX IF NOT EXISTS idx_private_messages_recipient ON public.private_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON public.blogs(slug);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_cat ON public.ai_knowledge(category);
CREATE INDEX IF NOT EXISTS idx_ai_training_files_user ON public.ai_training_files(uploaded_by_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read);

--------------------------------------------------------------------------------
-- 13. TRIGGERS (AUTOMATED AUTHENTICATION USER SYNCING)
--------------------------------------------------------------------------------

-- Trigger to automatic insert public profile logs when new account signs up to Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_username VARCHAR(100);
BEGIN
  -- First, safety-clean/delete any pre-existing profile that has this same email but a different ID
  -- (e.g. from initial team seeds, metadata stubs, or transient login-bypass accounts)
  -- to avoid violating the unique constraint on email.
  DELETE FROM public.profiles WHERE email = new.email AND id <> new.id::text;

  v_username := COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1));
  
  -- ensure username uniqueness in public.profiles
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = v_username AND id <> new.id::text) THEN
    v_username := v_username || '_' || substring(md5(random()::text) from 1 for 6);
  END IF;

  INSERT INTO public.profiles (
    id, 
    email, 
    name, 
    role, 
    avatar_url, 
    status, 
    username, 
    skills
  )
  VALUES (
    new.id::text,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', 'New Account'),
    COALESCE(new.raw_user_meta_data->>'role', 'client'),
    COALESCE(new.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/initials/svg?seed=' || new.email),
    'active',
    v_username,
    ARRAY['create_requests', 'view_own_projects']
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      name = COALESCE(EXCLUDED.name, public.profiles.name),
      username = COALESCE(public.profiles.username, EXCLUDED.username),
      skills = COALESCE(public.profiles.skills, EXCLUDED.skills);

  -- Insert default rbac user roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id::text, COALESCE(new.raw_user_meta_data->>'role', 'client'))
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Insert/upsert into team_members table for team profiles
  IF COALESCE(new.raw_user_meta_data->>'role', 'client') != 'client' THEN
    INSERT INTO public.team_members (profile_id, position, department)
    VALUES (
      new.id::text,
      COALESCE(new.raw_user_meta_data->>'position', 'Specialist'),
      COALESCE(new.raw_user_meta_data->>'department', 'Operations')
    )
    ON CONFLICT (profile_id) DO UPDATE
    SET position = COALESCE(EXCLUDED.position, public.team_members.position),
        department = COALESCE(EXCLUDED.department, public.team_members.department);
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

--------------------------------------------------------------------------------
-- 14. ROW LEVEL SECURITY (RLS) & FINE-GRAIN RBAC
--------------------------------------------------------------------------------

-- Enable database levels RLS
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

-- Helper RBAC Functions
CREATE OR REPLACE FUNCTION public.is_secret_admin(uid TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = uid AND role = 'secret_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin(uid TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = uid AND role IN ('secret_admin', 'primary_admin', 'secondary_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_staff(uid TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = uid AND role IN ('secret_admin', 'primary_admin', 'secondary_admin', 'team_member')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
DROP POLICY IF EXISTS "Public Select Profiles" ON public.profiles;
CREATE POLICY "Public Select Profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Profiles Managed By Admins Or Owners" ON public.profiles;
CREATE POLICY "Profiles Managed By Admins Or Owners" ON public.profiles FOR ALL USING (
  public.is_admin(auth.uid()::text) 
  OR auth.uid()::text = id
);

-- Projects Policies
DROP POLICY IF EXISTS "Projects Scope Access" ON public.projects;
CREATE POLICY "Projects Scope Access" ON public.projects FOR ALL USING (
  public.is_staff(auth.uid()::text)
  OR client_id = auth.uid()::text
);

-- Contracts Policies
DROP POLICY IF EXISTS "Contracts Scope Access" ON public.contracts;
CREATE POLICY "Contracts Scope Access" ON public.contracts FOR ALL USING (
  public.is_staff(auth.uid()::text)
  OR client_id = auth.uid()::text
);

-- Invoices Policies
DROP POLICY IF EXISTS "Invoices Scope Access" ON public.invoices;
CREATE POLICY "Invoices Scope Access" ON public.invoices FOR ALL USING (
  public.is_staff(auth.uid()::text)
  OR client_id = auth.uid()::text
);

-- Active Plans System Policies
DROP POLICY IF EXISTS "Active Plans Scope Access" ON public.active_plans;
CREATE POLICY "Active Plans Scope Access" ON public.active_plans FOR ALL USING (
  public.is_staff(auth.uid()::text)
  OR client_id = auth.uid()::text
);

-- Upgrade Approvals Policies
DROP POLICY IF EXISTS "Plan Approvals Scope Access" ON public.plan_approvals;
CREATE POLICY "Plan Approvals Scope Access" ON public.plan_approvals FOR ALL USING (
  public.is_staff(auth.uid()::text)
  OR client_id = auth.uid()::text
);

-- Direct Messages Policies (Secret Admin can review if urgent, else direct actors)
DROP POLICY IF EXISTS "Private Messages Scope Access" ON public.private_messages;
CREATE POLICY "Private Messages Scope Access" ON public.private_messages FOR ALL USING (
  public.is_secret_admin(auth.uid()::text)
  OR sender_id = auth.uid()::text
  OR recipient_id = auth.uid()::text
);

-- Team Messages Policies
DROP POLICY IF EXISTS "Team Messages Scope Access" ON public.team_messages;
CREATE POLICY "Team Messages Scope Access" ON public.team_messages FOR ALL USING (
  public.is_staff(auth.uid()::text)
);

-- Bespoke RFQs Policies
DROP POLICY IF EXISTS "Quotations Scope Access" ON public.quote_requests;
CREATE POLICY "Quotations Scope Access" ON public.quote_requests FOR ALL USING (
  public.is_staff(auth.uid()::text)
  OR client_id = auth.uid()::text
);

-- Testimonials Policies
DROP POLICY IF EXISTS "Reviews Public Read" ON public.reviews;
CREATE POLICY "Reviews Public Read" ON public.reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Reviews Management" ON public.reviews;
CREATE POLICY "Reviews Management" ON public.reviews FOR ALL USING (
  public.is_staff(auth.uid()::text)
  OR client_id = auth.uid()::text
);

-- Logs Policies (Strictly Administration)
DROP POLICY IF EXISTS "Activity Logs restricted select" ON public.activity_logs;
CREATE POLICY "Activity Logs restricted select" ON public.activity_logs FOR SELECT USING (
  public.is_admin(auth.uid()::text)
);

DROP POLICY IF EXISTS "Audit Logs restricted select" ON public.audit_logs;
CREATE POLICY "Audit Logs restricted select" ON public.audit_logs FOR SELECT USING (
  public.is_admin(auth.uid()::text)
);

--------------------------------------------------------------------------------
-- 15. PROVISION BUCKETS AND FILES SYSTEM IN STORAGE SCHEMAS
--------------------------------------------------------------------------------

-- Storage selector roles
DROP POLICY IF EXISTS "Select Public Buckets" ON storage.objects;
CREATE POLICY "Select Public Buckets" ON storage.objects FOR SELECT USING (
  bucket_id IN ('profile-images', 'project-images', 'blog-images', 'portfolio-images', 'chat-files')
);

DROP POLICY IF EXISTS "Public Buckets Full Access" ON storage.objects;
CREATE POLICY "Public Buckets Full Access" ON storage.objects FOR ALL USING (
  bucket_id IN ('profile-images', 'project-images', 'blog-images', 'portfolio-images', 'chat-files')
) WITH CHECK (
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

-- Provision buckets in storage.buckets registry
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('profile-images', 'profile-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml']),
  ('project-images', 'project-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('contract-files', 'contract-files', false, 15728640, ARRAY['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('invoice-files', 'invoice-files', false, 10485760, ARRAY['application/pdf', 'text/plain']),
  ('blog-images', 'blog-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('portfolio-images', 'portfolio-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('chat-files', 'chat-files', true, 26214400, NULL),
  ('ai-training-files', 'ai-training-files', false, 52428800, NULL)
ON CONFLICT (id) DO NOTHING;
