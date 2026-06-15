-- Migration: 20260614000004_payments_and_transactions.sql
-- Description: Creates transactions, payment_history, payment_links, milestone_payments, and client reviews.

-- TRANSACTIONS LAYER (FOR INTEGRATED RAZORPAY / STRIPE / STABLECOINS)
CREATE TABLE IF NOT EXISTS public.transactions (
  id VARCHAR(255) PRIMARY KEY,
  client_id VARCHAR(255) REFERENCES public.profiles(id) ON DELETE SET NULL,
  invoice_id VARCHAR(255) REFERENCES public.invoices(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  status VARCHAR(50) NOT NULL, -- Pending, Completed, Cancelled, Failed
  payment_method VARCHAR(50),
  reference_no VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- HISTORICAL PAYMENTS LEDGER
CREATE TABLE IF NOT EXISTS public.payment_history (
  id VARCHAR(255) PRIMARY KEY,
  client_id VARCHAR(255) REFERENCES public.profiles(id) ON DELETE SET NULL,
  amount VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL, -- Pending, Completed, Cancelled, Overdue, Incoming
  plan_or_project VARCHAR(255) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  date VARCHAR(100) NOT NULL,
  invoice_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INSTANT PAYMENT REQUEST LINKS
CREATE TABLE IF NOT EXISTS public.payment_links (
  id VARCHAR(255) PRIMARY KEY,
  invoice_id VARCHAR(255) REFERENCES public.invoices(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MILESTOnE PAYMENTS RELEASE STATUSES
CREATE TABLE IF NOT EXISTS public.milestone_payments (
  id VARCHAR(255) PRIMARY KEY,
  project_id VARCHAR(255) REFERENCES public.projects(id) ON DELETE CASCADE,
  milestone_title VARCHAR(255) NOT NULL,
  amount VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'unpaid', -- unpaid, paid, request_sent
  client_id VARCHAR(255) REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- REVIEWS (TESTIMONIALS MODERATION BOARD)
CREATE TABLE IF NOT EXISTS public.reviews (
  id VARCHAR(255) PRIMARY KEY,
  client_id VARCHAR(255) REFERENCES public.profiles(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  role VARCHAR(100),
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  avatar_url TEXT,
  date TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'Pending', -- Pending, Approved, Rejected, Hidden
  featured BOOLEAN DEFAULT FALSE,
  admin_reply TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_transactions_client ON public.transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_client ON public.payment_history(client_id);
CREATE INDEX IF NOT EXISTS idx_payment_links_invoice ON public.payment_links(invoice_id);
CREATE INDEX IF NOT EXISTS idx_milestone_payments_project ON public.milestone_payments(project_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(status);
