
-- Add extra columns to class_events for enhanced event management
ALTER TABLE public.class_events
ADD COLUMN IF NOT EXISTS color text DEFAULT 'primary',
ADD COLUMN IF NOT EXISTS reminder_minutes integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS location text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS is_all_day boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS end_date timestamp with time zone DEFAULT NULL;
