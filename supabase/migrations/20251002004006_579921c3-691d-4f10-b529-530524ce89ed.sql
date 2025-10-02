-- Create video_generations table to store N8N generated assets
CREATE TABLE IF NOT EXISTS video_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid REFERENCES content_calendar(id) ON DELETE CASCADE,
  job_id text UNIQUE NOT NULL,
  status text DEFAULT 'processing',
  
  -- Generated assets from N8N
  broll_images text[],
  broll_videos text[],
  lipsync_images text[],
  lipsync_videos text[],
  full_audio text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE video_generations ENABLE ROW LEVEL SECURITY;

-- Users can view their own video generations
CREATE POLICY "Users can view their own video generations"
  ON video_generations FOR SELECT
  USING (
    content_id IN (
      SELECT id FROM content_calendar WHERE user_id = auth.uid()
    )
  );

-- Admins can view all video generations
CREATE POLICY "Admins can view all video generations"
  ON video_generations FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Create updated_at trigger
CREATE TRIGGER update_video_generations_updated_at
  BEFORE UPDATE ON video_generations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();