-- Add video_error_message column to track video generation errors
ALTER TABLE public.content_calendar 
ADD COLUMN IF NOT EXISTS video_error_message text;