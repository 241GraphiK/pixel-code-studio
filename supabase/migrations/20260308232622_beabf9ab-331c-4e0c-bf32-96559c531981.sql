
-- Notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  link text DEFAULT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
FOR SELECT USING (auth.uid() = user_id);

-- Users can update (mark read) their own notifications
CREATE POLICY "Users can update own notifications" ON public.notifications
FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications" ON public.notifications
FOR DELETE USING (auth.uid() = user_id);

-- System inserts (via triggers running as SECURITY DEFINER) need no INSERT policy for end-users
-- But we add one for edge cases where client might insert
CREATE POLICY "System can insert notifications" ON public.notifications
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Trigger: on new message, notify recipient(s)
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  participant RECORD;
  sender_name text;
BEGIN
  SELECT name INTO sender_name FROM profiles WHERE id = NEW.sender_id;
  
  FOR participant IN
    SELECT user_id FROM conversation_participants
    WHERE conversation_id = NEW.conversation_id AND user_id != NEW.sender_id
  LOOP
    INSERT INTO notifications (user_id, type, title, body, link)
    VALUES (
      participant.user_id,
      'message',
      'Nouveau message',
      COALESCE(sender_name, 'Quelqu''un') || ' : ' || LEFT(NEW.content, 80),
      '/messages'
    );
  END LOOP;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_message
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.notify_new_message();

-- Trigger: on new badge earned, notify user
CREATE OR REPLACE FUNCTION public.notify_new_badge()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  badge_name text;
BEGIN
  SELECT name INTO badge_name FROM badges WHERE id = NEW.badge_id;
  
  INSERT INTO notifications (user_id, type, title, body, link)
  VALUES (
    NEW.user_id,
    'badge',
    'Badge débloqué !',
    'Vous avez obtenu le badge "' || COALESCE(badge_name, 'Inconnu') || '"',
    '/achievements'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_badge
AFTER INSERT ON public.user_badges
FOR EACH ROW EXECUTE FUNCTION public.notify_new_badge();

-- Trigger: on new class member, notify teacher
CREATE OR REPLACE FUNCTION public.notify_class_join()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  class_rec RECORD;
  student_name text;
BEGIN
  SELECT * INTO class_rec FROM classes WHERE id = NEW.class_id;
  SELECT name INTO student_name FROM profiles WHERE id = NEW.user_id;
  
  IF class_rec.teacher_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, type, title, body, link)
    VALUES (
      class_rec.teacher_id,
      'class',
      'Nouvel étudiant',
      COALESCE(student_name, 'Un étudiant') || ' a rejoint la classe "' || class_rec.name || '"',
      '/classes'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_class_join
AFTER INSERT ON public.class_members
FOR EACH ROW EXECUTE FUNCTION public.notify_class_join();
