-- Migration: 20260614000007_portfolio_blogs_ai.sql
-- Description: Creates social_media_links, portfolio_items, blogs, ai_knowledge, and ai_training_files tables.

-- PUBLIC AGENCY SOCIAL MEDIA ACCENTS
CREATE TABLE IF NOT EXISTS public.social_media_links (
  id VARCHAR(255) PRIMARY KEY,
  platform VARCHAR(150) NOT NULL,
  url TEXT NOT NULL,
  icon VARCHAR(100) NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CASE STUDIES AND PORTFOLIO CARDS
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

-- PUBLIC AGENCY SCIENTIFIC BLOGS
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

-- AI KNOWLEDGE INGESTION BASE
CREATE TABLE IF NOT EXISTS public.ai_knowledge (
  id VARCHAR(255) PRIMARY KEY,
  category VARCHAR(150) NOT NULL, -- pricing, onboarding, generic, contract
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI COGNITIVE MODEL CALIBRATION OR FEEDBACK SPEC FILES
CREATE TABLE IF NOT EXISTS public.ai_training_files (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL, -- pdf, faq, pricing, blog, service_info, project_info
  content TEXT NOT NULL,
  uploaded_by_id VARCHAR(255) REFERENCES public.profiles(id) ON DELETE SET NULL,
  uploaded_by_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON public.blogs(slug);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_cat ON public.ai_knowledge(category);
CREATE INDEX IF NOT EXISTS idx_ai_training_files_user ON public.ai_training_files(uploaded_by_id);
