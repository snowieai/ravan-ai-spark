-- Add content_type and inspiration_links columns to content_calendar table
ALTER TABLE public.content_calendar 
ADD COLUMN content_type TEXT DEFAULT 'reel' CHECK (content_type IN ('reel', 'story', 'carousel')),
ADD COLUMN inspiration_links TEXT;