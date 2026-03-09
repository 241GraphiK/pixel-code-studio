
-- ============================================
-- Allow admin to manage ALL modules (bypass teacher_id ownership)
-- ============================================

-- Drop existing teacher-only policies on modules
DROP POLICY IF EXISTS "Teachers can create modules" ON public.modules;
DROP POLICY IF EXISTS "Teachers can update own modules" ON public.modules;
DROP POLICY IF EXISTS "Teachers can delete own modules" ON public.modules;

-- Admin can do everything, teacher only own
CREATE POLICY "Teachers and admins can create modules"
ON public.modules FOR INSERT TO authenticated
WITH CHECK (
  (auth.uid() = teacher_id AND has_role(auth.uid(), 'teacher'))
  OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Teachers and admins can update modules"
ON public.modules FOR UPDATE TO authenticated
USING (
  (auth.uid() = teacher_id AND has_role(auth.uid(), 'teacher'))
  OR has_role(auth.uid(), 'admin')
)
WITH CHECK (
  (auth.uid() = teacher_id AND has_role(auth.uid(), 'teacher'))
  OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Teachers and admins can delete modules"
ON public.modules FOR DELETE TO authenticated
USING (
  (auth.uid() = teacher_id AND has_role(auth.uid(), 'teacher'))
  OR has_role(auth.uid(), 'admin')
);

-- ============================================
-- Allow admin to manage ALL courses
-- ============================================
DROP POLICY IF EXISTS "Teachers can manage courses" ON public.courses;

CREATE POLICY "Teachers and admins can manage courses"
ON public.courses FOR ALL TO authenticated
USING (
  (EXISTS (SELECT 1 FROM modules m WHERE m.id = courses.module_id AND m.teacher_id = auth.uid()) AND has_role(auth.uid(), 'teacher'))
  OR has_role(auth.uid(), 'admin')
)
WITH CHECK (
  (EXISTS (SELECT 1 FROM modules m WHERE m.id = courses.module_id AND m.teacher_id = auth.uid()) AND has_role(auth.uid(), 'teacher'))
  OR has_role(auth.uid(), 'admin')
);

-- ============================================
-- Allow admin to manage ALL quizzes
-- ============================================
DROP POLICY IF EXISTS "Teachers can manage quizzes" ON public.quizzes;

CREATE POLICY "Teachers and admins can manage quizzes"
ON public.quizzes FOR ALL TO authenticated
USING (
  (EXISTS (SELECT 1 FROM modules m WHERE m.id = quizzes.module_id AND m.teacher_id = auth.uid()) AND has_role(auth.uid(), 'teacher'))
  OR has_role(auth.uid(), 'admin')
)
WITH CHECK (
  (EXISTS (SELECT 1 FROM modules m WHERE m.id = quizzes.module_id AND m.teacher_id = auth.uid()) AND has_role(auth.uid(), 'teacher'))
  OR has_role(auth.uid(), 'admin')
);

-- ============================================
-- Allow admin to manage ALL questions
-- ============================================
DROP POLICY IF EXISTS "Teachers can insert questions" ON public.questions;
DROP POLICY IF EXISTS "Teachers can update questions" ON public.questions;
DROP POLICY IF EXISTS "Teachers can delete questions" ON public.questions;

CREATE POLICY "Teachers and admins can insert questions"
ON public.questions FOR INSERT TO authenticated
WITH CHECK (
  (EXISTS (SELECT 1 FROM quizzes q JOIN modules m ON q.module_id = m.id WHERE q.id = questions.quiz_id AND m.teacher_id = auth.uid()) AND has_role(auth.uid(), 'teacher'))
  OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Teachers and admins can update questions"
ON public.questions FOR UPDATE TO authenticated
USING (
  (EXISTS (SELECT 1 FROM quizzes q JOIN modules m ON q.module_id = m.id WHERE q.id = questions.quiz_id AND m.teacher_id = auth.uid()) AND has_role(auth.uid(), 'teacher'))
  OR has_role(auth.uid(), 'admin')
)
WITH CHECK (
  (EXISTS (SELECT 1 FROM quizzes q JOIN modules m ON q.module_id = m.id WHERE q.id = questions.quiz_id AND m.teacher_id = auth.uid()) AND has_role(auth.uid(), 'teacher'))
  OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Teachers and admins can delete questions"
ON public.questions FOR DELETE TO authenticated
USING (
  (EXISTS (SELECT 1 FROM quizzes q JOIN modules m ON q.module_id = m.id WHERE q.id = questions.quiz_id AND m.teacher_id = auth.uid()) AND has_role(auth.uid(), 'teacher'))
  OR has_role(auth.uid(), 'admin')
);

-- ============================================
-- Allow admin to manage ALL resources
-- ============================================
DROP POLICY IF EXISTS "Teachers can insert resources" ON public.resources;
DROP POLICY IF EXISTS "Teachers can update resources" ON public.resources;
DROP POLICY IF EXISTS "Teachers can delete resources" ON public.resources;

CREATE POLICY "Teachers and admins can insert resources"
ON public.resources FOR INSERT TO authenticated
WITH CHECK (
  (EXISTS (SELECT 1 FROM courses c JOIN modules m ON c.module_id = m.id WHERE c.id = resources.course_id AND m.teacher_id = auth.uid()))
  OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Teachers and admins can update resources"
ON public.resources FOR UPDATE TO authenticated
USING (
  (EXISTS (SELECT 1 FROM courses c JOIN modules m ON c.module_id = m.id WHERE c.id = resources.course_id AND m.teacher_id = auth.uid()))
  OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Teachers and admins can delete resources"
ON public.resources FOR DELETE TO authenticated
USING (
  (EXISTS (SELECT 1 FROM courses c JOIN modules m ON c.module_id = m.id WHERE c.id = resources.course_id AND m.teacher_id = auth.uid()))
  OR has_role(auth.uid(), 'admin')
);

-- ============================================
-- Allow admin to manage ALL classes (create/delete)
-- ============================================
DROP POLICY IF EXISTS "Teachers can create classes" ON public.classes;
DROP POLICY IF EXISTS "Teachers can update own classes" ON public.classes;

CREATE POLICY "Teachers and admins can create classes"
ON public.classes FOR INSERT TO authenticated
WITH CHECK (
  (auth.uid() = teacher_id AND has_role(auth.uid(), 'teacher'))
  OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Teachers and admins can update classes"
ON public.classes FOR UPDATE TO authenticated
USING (
  (auth.uid() = teacher_id AND has_role(auth.uid(), 'teacher'))
  OR has_role(auth.uid(), 'admin')
)
WITH CHECK (
  (auth.uid() = teacher_id AND has_role(auth.uid(), 'teacher'))
  OR has_role(auth.uid(), 'admin')
);

-- ============================================
-- Allow admin to manage class_modules, class_events, course_class_access
-- ============================================
DROP POLICY IF EXISTS "Teachers can manage class modules" ON public.class_modules;

CREATE POLICY "Teachers and admins can manage class modules"
ON public.class_modules FOR ALL TO authenticated
USING (
  (EXISTS (SELECT 1 FROM classes c WHERE c.id = class_modules.class_id AND c.teacher_id = auth.uid()) AND has_role(auth.uid(), 'teacher'))
  OR has_role(auth.uid(), 'admin')
)
WITH CHECK (
  (EXISTS (SELECT 1 FROM classes c WHERE c.id = class_modules.class_id AND c.teacher_id = auth.uid()) AND has_role(auth.uid(), 'teacher'))
  OR has_role(auth.uid(), 'admin')
);

DROP POLICY IF EXISTS "Teachers can manage events" ON public.class_events;

CREATE POLICY "Teachers and admins can manage events"
ON public.class_events FOR ALL TO authenticated
USING (
  (EXISTS (SELECT 1 FROM classes c WHERE c.id = class_events.class_id AND c.teacher_id = auth.uid()) AND has_role(auth.uid(), 'teacher'))
  OR has_role(auth.uid(), 'admin')
)
WITH CHECK (
  (EXISTS (SELECT 1 FROM classes c WHERE c.id = class_events.class_id AND c.teacher_id = auth.uid()) AND has_role(auth.uid(), 'teacher'))
  OR has_role(auth.uid(), 'admin')
);

DROP POLICY IF EXISTS "Teachers can manage course class access" ON public.course_class_access;

CREATE POLICY "Teachers and admins can manage course class access"
ON public.course_class_access FOR ALL TO authenticated
USING (
  (EXISTS (SELECT 1 FROM courses c JOIN modules m ON m.id = c.module_id WHERE c.id = course_class_access.course_id AND m.teacher_id = auth.uid()) AND has_role(auth.uid(), 'teacher'))
  OR has_role(auth.uid(), 'admin')
)
WITH CHECK (
  (EXISTS (SELECT 1 FROM courses c JOIN modules m ON m.id = c.module_id WHERE c.id = course_class_access.course_id AND m.teacher_id = auth.uid()) AND has_role(auth.uid(), 'teacher'))
  OR has_role(auth.uid(), 'admin')
);
