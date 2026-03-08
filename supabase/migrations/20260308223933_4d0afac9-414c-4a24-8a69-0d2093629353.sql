
-- Allow teachers to manage questions for their quizzes
CREATE POLICY "Teachers can insert questions" ON public.questions
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM quizzes q
    JOIN modules m ON q.module_id = m.id
    WHERE q.id = questions.quiz_id AND m.teacher_id = auth.uid()
  )
);

CREATE POLICY "Teachers can update questions" ON public.questions
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM quizzes q
    JOIN modules m ON q.module_id = m.id
    WHERE q.id = questions.quiz_id AND m.teacher_id = auth.uid()
  )
);

CREATE POLICY "Teachers can delete questions" ON public.questions
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM quizzes q
    JOIN modules m ON q.module_id = m.id
    WHERE q.id = questions.quiz_id AND m.teacher_id = auth.uid()
  )
);

-- Allow teachers to manage resources for their courses
CREATE POLICY "Teachers can insert resources" ON public.resources
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM courses c
    JOIN modules m ON c.module_id = m.id
    WHERE c.id = resources.course_id AND m.teacher_id = auth.uid()
  )
);

CREATE POLICY "Teachers can update resources" ON public.resources
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM courses c
    JOIN modules m ON c.module_id = m.id
    WHERE c.id = resources.course_id AND m.teacher_id = auth.uid()
  )
);

CREATE POLICY "Teachers can delete resources" ON public.resources
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM courses c
    JOIN modules m ON c.module_id = m.id
    WHERE c.id = resources.course_id AND m.teacher_id = auth.uid()
  )
);

-- Allow teachers to manage class_modules
CREATE POLICY "Teachers can manage class modules" ON public.class_modules
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM classes c
    WHERE c.id = class_modules.class_id AND c.teacher_id = auth.uid()
  )
);
