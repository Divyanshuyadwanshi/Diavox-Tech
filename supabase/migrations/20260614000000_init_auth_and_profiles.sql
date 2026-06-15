-- Migration: 20260614000000_init_auth_and_profiles.sql
-- Description: Initializes UUID extension, profiles, user_roles, permissions, role_permissions, types tables, and auth triggers.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES TABLE
-- Handles both string IDs (for local fallback profiles) and standard UUIDs (from Supabase Auth)
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
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  password_hash TEXT -- kept as metadata only if needed for fallback admin logins
);

-- USER ROLES TABLE
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) REFERENCES public.profiles(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- PERMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROLE-PERMISSIONS JUNCTION
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role VARCHAR(50) NOT NULL,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role, permission_id)
);

-- SUB-ROLES DETAILED TABLES
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

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- FUNCTIONS & TRIGGERS
-- Automatic trigger to sync new Auth users from auth.users (Supabase native Auth)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, avatar_url, status)
  VALUES (
    new.id::text,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', 'New Account'),
    COALESCE(new.raw_user_meta_data->>'role', 'client'),
    COALESCE(new.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/initials/svg?seed=' || encode(new.id::bytea, 'hex')),
    'active'
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      name = COALESCE(EXCLUDED.name, public.profiles.name);

  -- Insert default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id::text, COALESCE(new.raw_user_meta_data->>'role', 'client'))
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create target trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
