
-- Allow users to delete their own messages
CREATE POLICY "Users can delete own messages" ON public.messages
FOR DELETE TO authenticated
USING (sender_id = auth.uid());
