
-- Drop the existing restrictive insert policy
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- Create a new policy allowing authenticated users to insert notifications for others
-- This is needed for features like missed call notifications
CREATE POLICY "Authenticated users can insert notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (true);
