-- Migration: Fix RLS for team members and user roles
-- Ensure these tables are readable by everyone for the landing page to work

-- 1. Enable RLS for missing tables
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2. Profiles SELECT (Ensure public access)
DROP POLICY IF EXISTS "Public Select Profiles" ON public.profiles;
CREATE POLICY "Public Select Profiles" ON public.profiles FOR SELECT USING (true);

-- 3. Team Members SELECT (Ensure public access)
DROP POLICY IF EXISTS "Public Select Team Members" ON public.team_members;
CREATE POLICY "Public Select Team Members" ON public.team_members FOR SELECT USING (true);

-- 4. User Roles SELECT (Ensure public access)
DROP POLICY IF EXISTS "Public Select User Roles" ON public.user_roles;
CREATE POLICY "Public Select User Roles" ON public.user_roles FOR SELECT USING (true);

-- 5. Management policies for team_members (Admins can do everything)
DROP POLICY IF EXISTS "Admins Manage Team Members" ON public.team_members;
CREATE POLICY "Admins Manage Team Members" ON public.team_members FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid()::text AND role IN ('secret_admin', 'primary_admin', 'secondary_admin', 'developer')
  )
);

-- 6. Self management for team_members
DROP POLICY IF EXISTS "Users Manage Own Team Profile" ON public.team_members;
CREATE POLICY "Users Manage Own Team Profile" ON public.team_members FOR ALL USING (
  auth.uid()::text = profile_id
);
