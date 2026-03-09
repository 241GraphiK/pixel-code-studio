-- Fonction pour notifier les étudiants d'un nouvel événement de classe
CREATE OR REPLACE FUNCTION public.notify_class_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  class_name text;
  event_type_label text;
  student_record RECORD;
BEGIN
  -- Récupérer le nom de la classe
  SELECT name INTO class_name FROM classes WHERE id = NEW.class_id;
  
  -- Convertir le type d'événement en label français
  event_type_label := CASE NEW.type
    WHEN 'qcm' THEN 'QCM'
    WHEN 'evaluation' THEN 'Évaluation'
    WHEN 'visio' THEN 'Visioconférence'
    WHEN 'cours' THEN 'Cours'
    WHEN 'deadline' THEN 'Date limite'
    WHEN 'reunion' THEN 'Réunion'
    ELSE 'Événement'
  END;
  
  -- Notifier tous les étudiants de la classe
  FOR student_record IN
    SELECT DISTINCT cm.user_id
    FROM class_members cm
    WHERE cm.class_id = NEW.class_id
  LOOP
    INSERT INTO notifications (user_id, type, title, body, link)
    VALUES (
      student_record.user_id,
      'event',
      'Nouvel événement : ' || event_type_label,
      NEW.title || ' - ' || COALESCE(class_name, 'Classe'),
      '/classes/' || NEW.class_id::text
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Trigger pour notifier automatiquement lors de la création d'un événement
DROP TRIGGER IF EXISTS trigger_notify_class_event ON class_events;
CREATE TRIGGER trigger_notify_class_event
  AFTER INSERT ON class_events
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_class_event();