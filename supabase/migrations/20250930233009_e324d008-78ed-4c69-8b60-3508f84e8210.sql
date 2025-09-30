-- Add 'pending_approval' status to content_status enum
ALTER TYPE content_status ADD VALUE IF NOT EXISTS 'pending_approval';