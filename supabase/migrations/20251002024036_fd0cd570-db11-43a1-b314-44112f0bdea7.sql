
-- Delete the duplicate video generation entry with JOB002
DELETE FROM video_generations 
WHERE job_id = 'JOB002' 
AND content_id = '8821959b-7dc0-4d93-84ad-ba970e4a1de7';
