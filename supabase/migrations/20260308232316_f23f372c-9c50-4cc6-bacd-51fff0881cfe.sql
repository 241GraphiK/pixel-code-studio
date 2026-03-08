
-- Fix overly permissive INSERT on conversations: only authenticated users
DROP POLICY "Authenticated users can create conversations" ON public.conversations;
CREATE POLICY "Authenticated users can create conversations" ON public.conversations
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Fix overly permissive INSERT on conversation_participants: user can only add themselves or must be conversation creator
DROP POLICY "Authenticated users can add participants" ON public.conversation_participants;
CREATE POLICY "Users can add participants" ON public.conversation_participants
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.conversation_participants WHERE conversation_id = conversation_participants.conversation_id AND user_id = auth.uid())
  )
);
