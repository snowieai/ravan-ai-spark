-- Update the UBS Dubai script to pending approval status
UPDATE content_calendar
SET 
  approval_status = 'pending',
  submitted_for_approval_at = now()
WHERE id = 'ccdbf248-6e51-49da-97c7-b4a73343b6e3';