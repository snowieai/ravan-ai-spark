-- Drop old category constraint
ALTER TABLE content_calendar 
DROP CONSTRAINT IF EXISTS content_calendar_category_check;

-- Add new constraint with 4 updated categories
ALTER TABLE content_calendar 
ADD CONSTRAINT content_calendar_category_check 
CHECK (category IN (
  'Real Estate News',
  'Real Estate Interactive',
  'Trending (Country-wise)',
  'Viral Content'
));