-- Migration: 20260620000000_active_plans_extras.sql
-- Description: Adds duration and notes columns to active_plans table

ALTER TABLE public.active_plans 
ADD COLUMN IF NOT EXISTS duration VARCHAR(150),
ADD COLUMN IF NOT EXISTS notes TEXT;
