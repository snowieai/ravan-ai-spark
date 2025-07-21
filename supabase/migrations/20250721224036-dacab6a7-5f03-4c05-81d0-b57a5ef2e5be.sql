
-- First, add the missing columns to content_calendar table
ALTER TABLE public.content_calendar 
ADD COLUMN IF NOT EXISTS script_content TEXT,
ADD COLUMN IF NOT EXISTS content_source TEXT DEFAULT 'manual' CHECK (content_source IN ('manual', 'generated')),
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Entertainment' CHECK (category IN ('Real Estate News', 'Entertainment', 'Educational'));

-- Drop all existing RLS policies for content_calendar
DROP POLICY IF EXISTS "Users can view their own calendar" ON public.content_calendar;
DROP POLICY IF EXISTS "Users can create their own calendar entries" ON public.content_calendar;
DROP POLICY IF EXISTS "Users can update their own calendar entries" ON public.content_calendar;
DROP POLICY IF EXISTS "Users can delete their own calendar entries" ON public.content_calendar;

-- Disable Row Level Security for content_calendar
ALTER TABLE public.content_calendar DISABLE ROW LEVEL SECURITY;

-- Update the user_id column to be nullable since we're removing authentication requirement
ALTER TABLE public.content_calendar ALTER COLUMN user_id DROP NOT NULL;
