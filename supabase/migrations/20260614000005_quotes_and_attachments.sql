-- Migration: 20260614000005_quotes_and_attachments.sql
-- Description: Creates quote_requests, quote_replies, quote_attachments, and quote_status_history for scoping processes.

-- CUSTOM QUOTE CLIENT REQUESTS
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

-- REPLIES CORRESPONDENCE FOR QUOTATIONS
CREATE TABLE IF NOT EXISTS public.quote_replies (
  id VARCHAR(255) PRIMARY KEY,
  quote_id VARCHAR(255) REFERENCES public.quote_requests(id) ON DELETE CASCADE,
  author_id VARCHAR(255) REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name VARCHAR(255) NOT NULL,
  author_role VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ATTACHMENTS SPEC SHEETS
CREATE TABLE IF NOT EXISTS public.quote_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id VARCHAR(255) REFERENCES public.quote_requests(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STATUS LOGGING FOR QUOTE SPECIFICATIONS
CREATE TABLE IF NOT EXISTS public.quote_status_history (
  id VARCHAR(255) PRIMARY KEY,
  quote_id VARCHAR(255) REFERENCES public.quote_requests(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  changed_by VARCHAR(255) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_quote_requests_client ON public.quote_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON public.quote_requests(status);
CREATE INDEX IF NOT EXISTS idx_quote_replies_quote ON public.quote_replies(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_attachments_quote ON public.quote_attachments(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_status_history_quote ON public.quote_status_history(quote_id);
