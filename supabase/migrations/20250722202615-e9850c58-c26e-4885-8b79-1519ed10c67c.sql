
-- Enable Row Level Security on content_calendar table
ALTER TABLE public.content_calendar ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for public access since authentication is not required
-- Allow anyone to view all content calendar entries
CREATE POLICY "Allow public read access to content calendar" 
ON public.content_calendar 
FOR SELECT 
USING (true);

-- Allow anyone to create new content calendar entries
CREATE POLICY "Allow public insert to content calendar" 
ON public.content_calendar 
FOR INSERT 
WITH CHECK (true);

-- Allow anyone to update content calendar entries
CREATE POLICY "Allow public update to content calendar" 
ON public.content_calendar 
FOR UPDATE 
USING (true);

-- Allow anyone to delete content calendar entries
CREATE POLICY "Allow public delete from content calendar" 
ON public.content_calendar 
FOR DELETE 
USING (true);

-- Ensure anon and authenticated roles have proper permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_calendar TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_calendar TO authenticated;

-- Ensure sequence permissions for ID generation
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
