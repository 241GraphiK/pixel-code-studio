-- Ensure deleting a course cleans up dependent rows (progress/resources/access rules)
ALTER TABLE public.course_progress
  DROP CONSTRAINT IF EXISTS course_progress_course_id_fkey;
ALTER TABLE public.course_progress
  ADD CONSTRAINT course_progress_course_id_fkey
  FOREIGN KEY (course_id) REFERENCES public.courses(id)
  ON DELETE CASCADE;

ALTER TABLE public.resources
  DROP CONSTRAINT IF EXISTS resources_course_id_fkey;
ALTER TABLE public.resources
  ADD CONSTRAINT resources_course_id_fkey
  FOREIGN KEY (course_id) REFERENCES public.courses(id)
  ON DELETE CASCADE;

ALTER TABLE public.course_class_access
  DROP CONSTRAINT IF EXISTS course_class_access_course_id_fkey;
ALTER TABLE public.course_class_access
  ADD CONSTRAINT course_class_access_course_id_fkey
  FOREIGN KEY (course_id) REFERENCES public.courses(id)
  ON DELETE CASCADE;

-- De-dupe before adding unique indexes (if any duplicates exist)
DELETE FROM public.course_progress a
USING public.course_progress b
WHERE a.user_id = b.user_id
  AND a.course_id = b.course_id
  AND a.id < b.id;

DELETE FROM public.course_class_access a
USING public.course_class_access b
WHERE a.course_id = b.course_id
  AND a.class_id = b.class_id
  AND a.id < b.id;

-- Unique indexes to support upsert + prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS course_progress_user_course_uidx
  ON public.course_progress(user_id, course_id);

CREATE UNIQUE INDEX IF NOT EXISTS course_class_access_course_class_uidx
  ON public.course_class_access(course_id, class_id);
