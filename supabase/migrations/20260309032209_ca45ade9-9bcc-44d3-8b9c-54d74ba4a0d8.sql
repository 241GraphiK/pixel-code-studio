
CREATE TABLE public.call_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  caller_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  mode TEXT NOT NULL DEFAULT 'audio',
  status TEXT NOT NULL DEFAULT 'missed',
  duration INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view call logs of own conversations"
ON public.call_logs
FOR SELECT
TO authenticated
USING (is_conversation_participant(conversation_id, auth.uid()));

CREATE POLICY "Users can insert call logs"
ON public.call_logs
FOR INSERT
TO authenticated
WITH CHECK (caller_id = auth.uid() OR receiver_id = auth.uid());
