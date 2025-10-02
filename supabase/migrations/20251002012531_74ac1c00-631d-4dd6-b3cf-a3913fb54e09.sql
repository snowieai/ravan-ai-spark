-- Reset failed video generation for Dubai Rents Vs. Global Hotspots
UPDATE content_calendar 
SET 
  video_status = NULL,
  video_job_id = NULL,
  video_error_message = NULL,
  updated_at = now()
WHERE id = '0bb1604b-57e7-4c53-ac6f-3e2ed9bc49e4';