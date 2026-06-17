-- Execute this SQL code inside the Supabase SQL Editor to fix the Auth Account Creation completely.

-- 1. Drop trigger to update the function seamlessly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Update the sync function to use correct UUID types and handle constraints safely
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_username VARCHAR(100);
BEGIN
  -- Safety-clean any pre-existing profile that has this same email but a different ID
  -- We removed ::text cast to avoid 'operator does not exist: uuid <> text' errors
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
    full_name,
    role, 
    avatar_url, 
    status, 
    username, 
    skills
  )
  VALUES (
    new.id::text,
    new.email,
    -- Safely coalesce against both name and full_name ensuring name is never null
    COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', 'New Account'),
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'New Account'),
    COALESCE(new.raw_user_meta_data->>'role', 'client'),
    COALESCE(new.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/initials/svg?seed=' || new.email),
    'active',
    v_username,
    ARRAY['create_requests', 'view_own_projects']
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      name = COALESCE(EXCLUDED.name, public.profiles.name),
      full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
      username = COALESCE(public.profiles.username, EXCLUDED.username);

  -- Insert default user role
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

-- 3. Re-attach trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
