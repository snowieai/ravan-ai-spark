-- Fix RLS security issues: Enable RLS on all tables and secure content_calendar

-- First, enable RLS on the content_calendar table (currently has policies but RLS disabled)
ALTER TABLE public.content_calendar ENABLE ROW LEVEL SECURITY;

-- Drop the existing public policies on content_calendar that allow anyone to access data
DROP POLICY IF EXISTS "Allow public delete from content calendar" ON public.content_calendar;
DROP POLICY IF EXISTS "Allow public insert to content calendar" ON public.content_calendar;
DROP POLICY IF EXISTS "Allow public read access to content calendar" ON public.content_calendar;
DROP POLICY IF EXISTS "Allow public update to content calendar" ON public.content_calendar;

-- Create secure policies for content_calendar that restrict access to authenticated users
CREATE POLICY "Users can view their own content calendar" 
ON public.content_calendar 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own content calendar entries" 
ON public.content_calendar 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own content calendar entries" 
ON public.content_calendar 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content calendar entries" 
ON public.content_calendar 
FOR DELETE 
USING (auth.uid() = user_id);

-- Ensure RLS is enabled on all other tables with policies
-- (Most tables already have RLS enabled, but let's make sure)

-- Enable RLS on content_topics (should already be enabled)
ALTER TABLE public.content_topics ENABLE ROW LEVEL SECURITY;

-- Enable RLS on time_logs (should already be enabled)
ALTER TABLE public.time_logs ENABLE ROW LEVEL SECURITY;

-- Enable RLS on life_expenses (should already be enabled)
ALTER TABLE public.life_expenses ENABLE ROW LEVEL SECURITY;

-- Enable RLS on tasks (should already be enabled)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Enable RLS on employees (should already be enabled)
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Enable RLS on daily_summaries (should already be enabled)
ALTER TABLE public.daily_summaries ENABLE ROW LEVEL SECURITY;

-- Enable RLS on work_entries (should already be enabled)
ALTER TABLE public.work_entries ENABLE ROW LEVEL SECURITY;

-- Enable RLS on hourly_checkins (should already be enabled)
ALTER TABLE public.hourly_checkins ENABLE ROW LEVEL SECURITY;

-- Enable RLS on health_activities (should already be enabled)
ALTER TABLE public.health_activities ENABLE ROW LEVEL SECURITY;

-- For news_articles, enable RLS and keep it publicly readable but prevent public writes
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;