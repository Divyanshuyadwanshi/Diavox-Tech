-- Migration: 20260614000001_projects_and_assignments.sql
-- Description: Creates projects, project_progress, project_milestones, and project_assignments with optimized indexing.

-- PROJECTS TABLE
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

-- PROJECT PROGRESS UPDATES
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

-- PROJECT MILESTONES
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

-- PROJECT ASSIGNMENTS JUNCTION
CREATE TABLE IF NOT EXISTS public.project_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id VARCHAR(255) REFERENCES public.projects(id) ON DELETE CASCADE,
  profile_id VARCHAR(255) REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, profile_id)
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_project_progress_project ON public.project_progress(project_id);
CREATE INDEX IF NOT EXISTS idx_project_milestones_project ON public.project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_project_assignments_profile ON public.project_assignments(profile_id);
