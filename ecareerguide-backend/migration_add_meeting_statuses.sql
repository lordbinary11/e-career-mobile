-- Migration to add missing meeting status values
-- Run this script to update the existing scheduled_meetings table constraint

-- Drop the existing constraint
ALTER TABLE scheduled_meetings DROP CONSTRAINT IF EXISTS scheduled_meetings_status_check;

-- Add the new constraint with all required status values
ALTER TABLE scheduled_meetings ADD CONSTRAINT scheduled_meetings_status_check 
CHECK (status IN ('scheduled', 'accepted', 'completed', 'cancelled', 'rescheduled', 'declined')); 