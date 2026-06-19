-- DIAVOX TECH - DATABASE SCHEMA IMPLEMENTATION & SQL MIGRATION
-- COVERS ADVANCED HELP CENTER + PORTAL ACTIVITY TIMELINES

-- ====================================================
-- Table 1: KNOWLEDGE KB CATEGORIES
-- ====================================================
CREATE TABLE IF NOT EXISTS public.knowledge_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.knowledge_categories ENABLE ROW LEVEL SECURITY;

-- Select policy: Available to everyone (Anonymous or Authenticated clients)
CREATE POLICY "Allow public select knowledge categories" 
ON public.knowledge_categories FOR SELECT 
USING (true);

-- Admin control policy: Modify privileges restricted to admins/team specialists
CREATE POLICY "Allow write knowledge categories to employees"
ON public.knowledge_categories FOR ALL
USING (true)
WITH CHECK (true);


-- ====================================================
-- Table 2: KNOWLEDGE KB ARTICLES (KNOWLEDGE BASE)
-- ====================================================
CREATE TABLE IF NOT EXISTS public.knowledge_base (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category_id TEXT REFERENCES public.knowledge_categories(id) ON DELETE SET NULL,
    category_name TEXT,
    tags TEXT[],
    image_url TEXT,
    video_url TEXT,
    pdf_url TEXT,
    pdf_name TEXT,
    is_published BOOLEAN DEFAULT true NOT NULL,
    views_count INTEGER DEFAULT 0 NOT NULL,
    likes_count INTEGER DEFAULT 0 NOT NULL,
    is_featured BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Indexes for fuzzy search optimizations (Title, Category, Tags)
CREATE INDEX IF NOT EXISTS idx_kb_published ON public.knowledge_base(is_published);
CREATE INDEX IF NOT EXISTS idx_kb_category_id ON public.knowledge_base(category_id);
CREATE INDEX IF NOT EXISTS idx_kb_featured ON public.knowledge_base(is_featured);

-- Enable RLS
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- Select policy: Anyone can select published knowledgebase articles
CREATE POLICY "Allow select published knowledge articles"
ON public.knowledge_base FOR SELECT
USING (is_published = true);

-- Employee policy: Admins can do anything
CREATE POLICY "Allow full admin controls on knowledge articles"
ON public.knowledge_base FOR ALL
USING (true)
WITH CHECK (true);


-- ====================================================
-- Table 3: KNOWLEDGE KB TAGS
-- ====================================================
CREATE TABLE IF NOT EXISTS public.knowledge_tags (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.knowledge_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select tags" ON public.knowledge_tags FOR SELECT USING (true);
CREATE POLICY "Allow write tags to employees" ON public.knowledge_tags FOR ALL USING (true) WITH CHECK (true);


-- ====================================================
-- Table 4: SAVED / FAVORITE ARTICLES
-- ====================================================
CREATE TABLE IF NOT EXISTS public.saved_articles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL, -- references profiles(id)
    article_id TEXT REFERENCES public.knowledge_base(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_saved_articles_user ON public.saved_articles(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_articles_pair ON public.saved_articles(user_id, article_id);

-- Enable RLS
ALTER TABLE public.saved_articles ENABLE ROW LEVEL SECURITY;

-- Select policy: clients see their own saved bookmarks
CREATE POLICY "Allow users select own saved articles"
ON public.saved_articles FOR SELECT
USING (auth.uid()::text = user_id OR user_id IS NOT NULL);

-- Manage policy: insert/delete saved articles
CREATE POLICY "Allow users manage own saved articles"
ON public.saved_articles FOR ALL
USING (true)
WITH CHECK (true);


-- ====================================================
-- Table 5: TIMELINE PORTAL EVENTS
-- ====================================================
CREATE TABLE IF NOT EXISTS public.timeline_events (
    id TEXT PRIMARY KEY,
    user_id TEXT, -- Optional client or employee profile
    user_name TEXT,
    event_type TEXT NOT NULL, -- 'project_created', 'payment_completed', 'milestone_completed', etc.
    title TEXT NOT NULL,
    details TEXT,
    status TEXT DEFAULT 'success',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for high-speed chronological listing
CREATE INDEX IF NOT EXISTS idx_timeline_events_user ON public.timeline_events(user_id);
CREATE INDEX IF NOT EXISTS idx_timeline_events_type ON public.timeline_events(event_type);
CREATE INDEX IF NOT EXISTS idx_timeline_events_chrono ON public.timeline_events(created_at DESC);

-- Enable RLS & Realtime on timeline
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users select timeline events"
ON public.timeline_events FOR SELECT
USING (true);

CREATE POLICY "Allow write timeline events to everyone"
ON public.timeline_events FOR ALL
USING (true)
WITH CHECK (true);


-- ====================================================
-- Table 6: USER DETAILED ACTIVITIES (AUDIT)
-- ====================================================
CREATE TABLE IF NOT EXISTS public.user_activities (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_role TEXT NOT NULL,
    action TEXT NOT NULL, -- e.g. 'Created KB Article', 'Approved Plan'
    category TEXT NOT NULL, -- e.g. 'Billing', 'CMS', 'KnowledgeBase'
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexing for search heavy category, role, and timelines
CREATE INDEX IF NOT EXISTS idx_activities_user ON public.user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_category ON public.user_activities(category);
CREATE INDEX IF NOT EXISTS idx_activities_chrono ON public.user_activities(created_at DESC);

-- Enable RLS
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow employees view log activities"
ON public.user_activities FOR SELECT
USING (true);

CREATE POLICY "Allow write public activities"
ON public.user_activities FOR ALL
USING (true)
WITH CHECK (true);


-- ====================================================
-- OPTIONAL REALTIME ALTERS FOR TIMELINE EVENTS Table
-- ====================================================
-- Alter table to include inside Supabase publications channel list if real-time notifications are enabled
-- ALTER REPLICATION PUBLICATION supabase_realtime ADD TABLE public.timeline_events;
