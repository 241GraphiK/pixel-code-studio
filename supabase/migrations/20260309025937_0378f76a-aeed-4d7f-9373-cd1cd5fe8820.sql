
-- Add reply_to_id column to messages
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS reply_to_id uuid REFERENCES public.messages(id) ON DELETE SET NULL DEFAULT NULL;
