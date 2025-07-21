
-- Grant permissions to anon role for content_calendar table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_calendar TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_calendar TO authenticated;

-- Ensure anon role can use the sequence for id generation
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
