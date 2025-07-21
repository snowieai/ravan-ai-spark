-- Create enum for content status
CREATE TYPE public.content_status AS ENUM (
  'planned',
  'approved', 
  'script_ready',
  'in_production',
  'published',
  'cancelled'
);

-- Create content topics table for storing approved ideas
CREATE TABLE public.content_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  topic_text TEXT NOT NULL,
  category TEXT,
  source TEXT DEFAULT 'manual' CHECK (source IN ('generated', 'manual')),
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create content calendar table
CREATE TABLE public.content_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  topic_id UUID REFERENCES public.content_topics(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  status public.content_status DEFAULT 'planned',
  priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 3),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on content_topics
ALTER TABLE public.content_topics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for content_topics
CREATE POLICY "Users can view their own topics" 
ON public.content_topics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own topics" 
ON public.content_topics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own topics" 
ON public.content_topics 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own topics" 
ON public.content_topics 
FOR DELETE 
USING (auth.uid() = user_id);

-- Enable RLS on content_calendar
ALTER TABLE public.content_calendar ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for content_calendar
CREATE POLICY "Users can view their own calendar" 
ON public.content_calendar 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own calendar entries" 
ON public.content_calendar 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar entries" 
ON public.content_calendar 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar entries" 
ON public.content_calendar 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_content_topics_updated_at
  BEFORE UPDATE ON public.content_topics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_calendar_updated_at
  BEFORE UPDATE ON public.content_calendar
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_content_calendar_user_date ON public.content_calendar(user_id, scheduled_date);
CREATE INDEX idx_content_calendar_status ON public.content_calendar(status);
CREATE INDEX idx_content_topics_user_approval ON public.content_topics(user_id, approval_status);