CREATE TABLE IF NOT EXISTS public.pricing_options (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    tiers JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.pricing_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pricing_select_all" ON public.pricing_options FOR SELECT USING (true);
-- Using a simpler policy format since DB auth needs to be straightforward or we use server.ts api.
-- We can also just use an API route in server.ts to handle creation/updates, since Zero Trust requires verifying.
