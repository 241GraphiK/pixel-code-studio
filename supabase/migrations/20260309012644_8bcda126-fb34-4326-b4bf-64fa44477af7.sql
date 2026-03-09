-- 1) Force role assignment at signup to student only
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, institution, field, level)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    'student'::app_role,
    COALESCE(NEW.raw_user_meta_data->>'institution', ''),
    COALESCE(NEW.raw_user_meta_data->>'field', ''),
    COALESCE(NEW.raw_user_meta_data->>'level', '')
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

-- 2) Tighten teacher-management policies with explicit role checks
-- classes
DROP POLICY IF EXISTS "Teachers can create classes" ON public.classes;
CREATE POLICY "Teachers can create classes"
ON public.classes
FOR INSERT
WITH CHECK (
  auth.uid() = teacher_id
  AND (
    public.has_role(auth.uid(), 'teacher'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
);

DROP POLICY IF EXISTS "Teachers can update own classes" ON public.classes;
CREATE POLICY "Teachers can update own classes"
ON public.classes
FOR UPDATE
USING (
  auth.uid() = teacher_id
  AND (
    public.has_role(auth.uid(), 'teacher'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
)
WITH CHECK (
  auth.uid() = teacher_id
  AND (
    public.has_role(auth.uid(), 'teacher'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
);

-- modules
DROP POLICY IF EXISTS "Teachers can create modules" ON public.modules;
CREATE POLICY "Teachers can create modules"
ON public.modules
FOR INSERT
WITH CHECK (
  auth.uid() = teacher_id
  AND (
    public.has_role(auth.uid(), 'teacher'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
);

DROP POLICY IF EXISTS "Teachers can update own modules" ON public.modules;
CREATE POLICY "Teachers can update own modules"
ON public.modules
FOR UPDATE
USING (
  auth.uid() = teacher_id
  AND (
    public.has_role(auth.uid(), 'teacher'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
)
WITH CHECK (
  auth.uid() = teacher_id
  AND (
    public.has_role(auth.uid(), 'teacher'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
);

DROP POLICY IF EXISTS "Teachers can delete own modules" ON public.modules;
CREATE POLICY "Teachers can delete own modules"
ON public.modules
FOR DELETE
USING (
  auth.uid() = teacher_id
  AND (
    public.has_role(auth.uid(), 'teacher'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
);

-- class_modules
DROP POLICY IF EXISTS "Teachers can manage class modules" ON public.class_modules;
CREATE POLICY "Teachers can manage class modules"
ON public.class_modules
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.classes c
    WHERE c.id = class_modules.class_id
      AND c.teacher_id = auth.uid()
  )
  AND (
    public.has_role(auth.uid(), 'teacher'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.classes c
    WHERE c.id = class_modules.class_id
      AND c.teacher_id = auth.uid()
  )
  AND (
    public.has_role(auth.uid(), 'teacher'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
);

-- class_events
DROP POLICY IF EXISTS "Teachers can manage events" ON public.class_events;
CREATE POLICY "Teachers can manage events"
ON public.class_events
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.classes c
    WHERE c.id = class_events.class_id
      AND c.teacher_id = auth.uid()
  )
  AND (
    public.has_role(auth.uid(), 'teacher'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.classes c
    WHERE c.id = class_events.class_id
      AND c.teacher_id = auth.uid()
  )
  AND (
    public.has_role(auth.uid(), 'teacher'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
);

-- student_groups
DROP POLICY IF EXISTS "Teachers can manage groups" ON public.student_groups;
CREATE POLICY "Teachers can manage groups"
ON public.student_groups
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.classes c
    WHERE c.id = student_groups.class_id
      AND c.teacher_id = auth.uid()
  )
  AND (
    public.has_role(auth.uid(), 'teacher'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.classes c
    WHERE c.id = student_groups.class_id
      AND c.teacher_id = auth.uid()
  )
  AND (
    public.has_role(auth.uid(), 'teacher'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
);

-- group_members
DROP POLICY IF EXISTS "Teachers can manage group members" ON public.group_members;
CREATE POLICY "Teachers can manage group members"
ON public.group_members
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.student_groups sg
    JOIN public.classes c ON c.id = sg.class_id
    WHERE sg.id = group_members.group_id
      AND c.teacher_id = auth.uid()
  )
  AND (
    public.has_role(auth.uid(), 'teacher'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.student_groups sg
    JOIN public.classes c ON c.id = sg.class_id
    WHERE sg.id = group_members.group_id
      AND c.teacher_id = auth.uid()
  )
  AND (
    public.has_role(auth.uid(), 'teacher'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
);

-- courses
DROP POLICY IF EXISTS "Teachers can manage courses" ON public.courses;
CREATE POLICY "Teachers can manage courses"
ON public.courses
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.modules m
    WHERE m.id = courses.module_id
      AND m.teacher_id = auth.uid()
  )
  AND (
    public.has_role(auth.uid(), 'teacher'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.modules m
    WHERE m.id = courses.module_id
      AND m.teacher_id = auth.uid()
  )
  AND (
    public.has_role(auth.uid(), 'teacher'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
);

-- quizzes
DROP POLICY IF EXISTS "Teachers can manage quizzes" ON public.quizzes;
CREATE POLICY "Teachers can manage quizzes"
ON public.quizzes
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.modules m
    WHERE m.id = quizzes.module_id
      AND m.teacher_id = auth.uid()
  )
  AND (
    public.has_role(auth.uid(), 'teacher'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.modules m
    WHERE m.id = quizzes.module_id
      AND m.teacher_id = auth.uid()
  )
  AND (
    public.has_role(auth.uid(), 'teacher'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
);

-- questions
DROP POLICY IF EXISTS "Teachers can insert questions" ON public.questions;
CREATE POLICY "Teachers can insert questions"
ON public.questions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.quizzes q
    JOIN public.modules m ON q.module_id = m.id
    WHERE q.id = questions.quiz_id
      AND m.teacher_id = auth.uid()
  )
  AND (
    public.has_role(auth.uid(), 'teacher'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
);

DROP POLICY IF EXISTS "Teachers can update questions" ON public.questions;
CREATE POLICY "Teachers can update questions"
ON public.questions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.quizzes q
    JOIN public.modules m ON q.module_id = m.id
    WHERE q.id = questions.quiz_id
      AND m.teacher_id = auth.uid()
  )
  AND (
    public.has_role(auth.uid(), 'teacher'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.quizzes q
    JOIN public.modules m ON q.module_id = m.id
    WHERE q.id = questions.quiz_id
      AND m.teacher_id = auth.uid()
  )
  AND (
    public.has_role(auth.uid(), 'teacher'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
);

DROP POLICY IF EXISTS "Teachers can delete questions" ON public.questions;
CREATE POLICY "Teachers can delete questions"
ON public.questions
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.quizzes q
    JOIN public.modules m ON q.module_id = m.id
    WHERE q.id = questions.quiz_id
      AND m.teacher_id = auth.uid()
  )
  AND (
    public.has_role(auth.uid(), 'teacher'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
);

-- course_class_access
DROP POLICY IF EXISTS "Teachers can manage course class access" ON public.course_class_access;
CREATE POLICY "Teachers can manage course class access"
ON public.course_class_access
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.courses c
    JOIN public.modules m ON m.id = c.module_id
    WHERE c.id = course_class_access.course_id
      AND m.teacher_id = auth.uid()
  )
  AND (
    public.has_role(auth.uid(), 'teacher'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.courses c
    JOIN public.modules m ON m.id = c.module_id
    WHERE c.id = course_class_access.course_id
      AND m.teacher_id = auth.uid()
  )
  AND (
    public.has_role(auth.uid(), 'teacher'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
);