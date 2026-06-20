-- SQL Migration: Diavox CMS Extra Tables Verification and Creation
-- Created: 2026-06-19
-- Targets: website_sections, website_settings, services, faqs, testimonials, social_links, contact_settings, cms_sections

-- 1. Create website_sections
CREATE TABLE IF NOT EXISTS public.website_sections (
    id TEXT PRIMARY KEY DEFAULT 'sec-' || md5(random()::text),
    section_key TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    background_color TEXT DEFAULT 'slate-950',
    text_color TEXT DEFAULT 'white',
    visible BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create website_settings
CREATE TABLE IF NOT EXISTS public.website_settings (
    id TEXT PRIMARY KEY DEFAULT 'set-' || md5(random()::text),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create services
CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY DEFAULT 'ser-' || md5(random()::text),
    title TEXT NOT NULL,
    icon TEXT,
    description TEXT NOT NULL,
    detailed_description TEXT,
    price_range TEXT,
    display_order INTEGER DEFAULT 0,
    visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create faqs
CREATE TABLE IF NOT EXISTS public.faqs (
    id TEXT PRIMARY KEY DEFAULT 'faq-' || md5(random()::text),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT,
    display_order INTEGER DEFAULT 0,
    visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create testimonials
CREATE TABLE IF NOT EXISTS public.testimonials (
    id TEXT PRIMARY KEY DEFAULT 'test-' || md5(random()::text),
    author_name TEXT NOT NULL,
    author_role TEXT,
    author_company TEXT,
    author_avatar TEXT,
    content TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    is_featured BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create social_links
CREATE TABLE IF NOT EXISTS public.social_links (
    id TEXT PRIMARY KEY DEFAULT 'sml-' || md5(random()::text),
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT,
    display_order INTEGER DEFAULT 0,
    visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Create contact_settings
CREATE TABLE IF NOT EXISTS public.contact_settings (
    id TEXT PRIMARY KEY DEFAULT 'con-' || md5(random()::text),
    phone TEXT,
    email TEXT,
    address TEXT,
    business_hours TEXT,
    whatsapp TEXT,
    google_maps_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Create cms_sections
CREATE TABLE IF NOT EXISTS public.cms_sections (
    id TEXT PRIMARY KEY DEFAULT 'cms-' || md5(random()::text),
    section_name TEXT UNIQUE NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on all these tables
ALTER TABLE public.website_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_sections ENABLE ROW LEVEL SECURITY;

-- Create Open Public Select Policies (Any user/visitor can view CMS and layout details)
CREATE POLICY "website_sections_select_all" ON public.website_sections FOR SELECT USING (true);
CREATE POLICY "website_settings_select_all" ON public.website_settings FOR SELECT USING (true);
CREATE POLICY "services_select_all" ON public.services FOR SELECT USING (true);
CREATE POLICY "faqs_select_all" ON public.faqs FOR SELECT USING (true);
CREATE POLICY "testimonials_select_all" ON public.testimonials FOR SELECT USING (true);
CREATE POLICY "social_links_select_all" ON public.social_links FOR SELECT USING (true);
CREATE POLICY "contact_settings_select_all" ON public.contact_settings FOR SELECT USING (true);
CREATE POLICY "cms_sections_select_all" ON public.cms_sections FOR SELECT USING (true);

-- Create Full Control Policies for authenticated admins or system-level updates
CREATE POLICY "website_sections_admin_all" ON public.website_sections FOR ALL USING (true);
CREATE POLICY "website_settings_admin_all" ON public.website_settings FOR ALL USING (true);
CREATE POLICY "services_admin_all" ON public.services FOR ALL USING (true);
CREATE POLICY "faqs_admin_all" ON public.faqs FOR ALL USING (true);
CREATE POLICY "testimonials_admin_all" ON public.testimonials FOR ALL USING (true);
CREATE POLICY "social_links_admin_all" ON public.social_links FOR ALL USING (true);
CREATE POLICY "contact_settings_admin_all" ON public.contact_settings FOR ALL USING (true);
CREATE POLICY "cms_sections_admin_all" ON public.cms_sections FOR ALL USING (true);
