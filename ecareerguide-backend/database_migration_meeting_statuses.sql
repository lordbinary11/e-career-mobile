-- Migration script to update scheduled_meetings table status constraint
-- Run this in your PostgreSQL database

-- First, drop the existing constraint
ALTER TABLE scheduled_meetings DROP CONSTRAINT IF EXISTS scheduled_meetings_status_check;

-- Add the new constraint with all status values
ALTER TABLE scheduled_meetings ADD CONSTRAINT scheduled_meetings_status_check 
CHECK (status IN ('scheduled', 'accepted', 'completed', 'cancelled', 'rescheduled', 'declined'));

-- Update any existing meetings with 'scheduled' status to 'accepted' if they're in the past
UPDATE scheduled_meetings 
SET status = 'completed' 
WHERE status = 'scheduled' 
AND (schedule_date < CURRENT_DATE OR (schedule_date = CURRENT_DATE AND schedule_time < CURRENT_TIME));

-- Verify the constraint
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'scheduled_meetings_status_check'; 