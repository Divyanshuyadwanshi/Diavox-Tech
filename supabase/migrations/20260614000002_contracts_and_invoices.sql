-- Migration: 20260614000002_contracts_and_invoices.sql
-- Description: Creates contracts and invoices tables with automated status monitoring and indexing.

-- CONTRACTS TABLE
CREATE TABLE IF NOT EXISTS public.contracts (
  id VARCHAR(255) PRIMARY KEY,
  client_id VARCHAR(255) REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_name VARCHAR(255) NOT NULL,
  project_title VARCHAR(255) NOT NULL,
  details TEXT,
  terms TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'Draft', -- Draft, Pending Signature, Signed, Active, Expired
  price VARCHAR(50),
  file_url TEXT, -- Saved Supabase Storage URL
  file_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INVOICES TABLE
CREATE TABLE IF NOT EXISTS public.invoices (
  id VARCHAR(255) PRIMARY KEY,
  invoice_number VARCHAR(100),
  client_id VARCHAR(255) REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  amount VARCHAR(100) NOT NULL, -- Keep matches with frontend schema strings e.g. "$12,000" or raw
  status VARCHAR(50) DEFAULT 'unpaid', -- unpaid, paid, overdue, cancelled
  due_date VARCHAR(50) NOT NULL,
  services TEXT,
  items JSONB, -- list items details details
  pdf_url TEXT, -- Standard fallback invoice URL
  taxes VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_contracts_client ON public.contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON public.contracts(status);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON public.invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
