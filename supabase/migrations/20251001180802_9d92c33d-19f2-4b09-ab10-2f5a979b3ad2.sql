-- Remove the default value from influencer_name column
-- This ensures any insert missing influencer_name will fail explicitly
-- instead of silently defaulting to 'kaira'
alter table public.content_calendar 
  alter column influencer_name drop default;