
-- Create roles enum
CREATE TYPE public.app_role AS ENUM ('student', 'teacher', 'admin');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  role app_role NOT NULL DEFAULT 'student',
  institution TEXT DEFAULT '',
  field TEXT DEFAULT '',
  level TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Public profiles are viewable" ON public.profiles FOR SELECT TO authenticated USING (true);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, institution, field, level)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'student'),
    COALESCE(NEW.raw_user_meta_data->>'institution', ''),
    COALESCE(NEW.raw_user_meta_data->>'field', ''),
    COALESCE(NEW.raw_user_meta_data->>'level', '')
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'student'));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Modules table
CREATE TABLE public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  level TEXT NOT NULL DEFAULT 'L1',
  field TEXT NOT NULL DEFAULT '',
  teacher_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  image_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Modules viewable by all authenticated" ON public.modules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Teachers can create modules" ON public.modules FOR INSERT TO authenticated WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "Teachers can update own modules" ON public.modules FOR UPDATE TO authenticated USING (auth.uid() = teacher_id);
CREATE POLICY "Teachers can delete own modules" ON public.modules FOR DELETE TO authenticated USING (auth.uid() = teacher_id);

-- Courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  "order" INTEGER NOT NULL DEFAULT 0,
  duration TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Courses viewable by all authenticated" ON public.courses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Teachers can manage courses" ON public.courses FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.modules WHERE id = module_id AND teacher_id = auth.uid())
);

-- Resources table
CREATE TABLE public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'link',
  url TEXT NOT NULL DEFAULT ''
);

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Resources viewable by all authenticated" ON public.resources FOR SELECT TO authenticated USING (true);

-- Quizzes table
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  duration INTEGER NOT NULL DEFAULT 15,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Quizzes viewable by all authenticated" ON public.quizzes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Teachers can manage quizzes" ON public.quizzes FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.modules WHERE id = module_id AND teacher_id = auth.uid())
);

-- Questions table
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'single',
  points INTEGER NOT NULL DEFAULT 1,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  explanation TEXT DEFAULT '',
  options JSONB NOT NULL DEFAULT '[]'
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Questions viewable by all authenticated" ON public.questions FOR SELECT TO authenticated USING (true);

-- Classes table
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Classes viewable by all authenticated" ON public.classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Teachers can create classes" ON public.classes FOR INSERT TO authenticated WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "Teachers can update own classes" ON public.classes FOR UPDATE TO authenticated USING (auth.uid() = teacher_id);

-- Class members
CREATE TABLE public.class_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(class_id, user_id)
);

ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view class members" ON public.class_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can join classes" ON public.class_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave classes" ON public.class_members FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Class modules junction
CREATE TABLE public.class_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(class_id, module_id)
);

ALTER TABLE public.class_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Class modules viewable" ON public.class_modules FOR SELECT TO authenticated USING (true);

-- Quiz attempts / scores
CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  max_score INTEGER NOT NULL DEFAULT 0,
  answers JSONB DEFAULT '{}',
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own attempts" ON public.quiz_attempts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own attempts" ON public.quiz_attempts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Teachers can view attempts for their quizzes" ON public.quiz_attempts FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.quizzes q
    JOIN public.modules m ON q.module_id = m.id
    WHERE q.id = quiz_id AND m.teacher_id = auth.uid()
  )
);

-- Course progress tracking
CREATE TABLE public.course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, course_id)
);

ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own progress" ON public.course_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.course_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can modify own progress" ON public.course_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id);
