
-- Create message reactions table
CREATE TABLE public.message_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  emoji text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (message_id, user_id, emoji)
);

ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- Users can view reactions on messages in their conversations
CREATE POLICY "Users can view reactions" ON public.message_reactions
FOR SELECT TO authenticated
USING (
  public.is_conversation_participant(
    (SELECT conversation_id FROM messages WHERE id = message_id),
    auth.uid()
  )
);

-- Users can add reactions
CREATE POLICY "Users can add reactions" ON public.message_reactions
FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND public.is_conversation_participant(
    (SELECT conversation_id FROM messages WHERE id = message_id),
    auth.uid()
  )
);

-- Users can remove own reactions
CREATE POLICY "Users can remove own reactions" ON public.message_reactions
FOR DELETE TO authenticated
USING (user_id = auth.uid());
