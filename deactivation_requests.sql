-- SQL migration schema for User Deactivation Requests
-- Create the deactivation_requests table referencing profiles(id)
CREATE TABLE IF NOT EXISTS public.deactivation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  status VARCHAR(100) NOT NULL DEFAULT 'Pending Review', -- 'Pending Review' | 'Under Verification' | 'Deactivated'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.deactivation_requests ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to insert their own requests
CREATE POLICY "Allow authenticated users to insert deactivation requests" 
ON public.deactivation_requests FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid()::text);

-- Policy to allow users to select their own requests
CREATE POLICY "Allow users to view their own deactivation requests" 
ON public.deactivation_requests FOR SELECT 
TO authenticated 
USING (user_id = auth.uid()::text);

-- Policy to allow admins to perform all operations
CREATE POLICY "Allow admins full access to deactivation requests" 
ON public.deactivation_requests FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid()::text 
    AND role IN ('secret_admin', 'primary_admin', 'secondary_admin', 'third_admin')
  )
);
