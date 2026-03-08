
-- Add XP and gamification level to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp integer NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gamification_level integer NOT NULL DEFAULT 1;

-- Badges definition table
CREATE TABLE public.badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'trophy',
  category text NOT NULL DEFAULT 'general',
  xp_reward integer NOT NULL DEFAULT 10,
  condition_type text NOT NULL DEFAULT 'manual',
  condition_value integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Badges viewable by all authenticated" ON public.badges
FOR SELECT TO authenticated USING (true);

-- User earned badges
CREATE TABLE public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badges" ON public.user_badges
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "System can insert badges" ON public.user_badges
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- XP history log
CREATE TABLE public.xp_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  reason text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own xp" ON public.xp_transactions
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own xp" ON public.xp_transactions
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Function to award XP and auto-level up
CREATE OR REPLACE FUNCTION public.award_xp(_user_id uuid, _amount integer, _reason text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_xp integer;
  new_level integer;
BEGIN
  -- Insert transaction
  INSERT INTO xp_transactions (user_id, amount, reason) VALUES (_user_id, _amount, _reason);
  
  -- Update profile XP
  UPDATE profiles SET xp = xp + _amount WHERE id = _user_id RETURNING xp INTO new_xp;
  
  -- Calculate level: every 100 XP = 1 level
  new_level := GREATEST(1, (new_xp / 100) + 1);
  
  UPDATE profiles SET gamification_level = new_level WHERE id = _user_id;
END;
$$;

-- Function to check and award badges
CREATE OR REPLACE FUNCTION public.check_and_award_badges(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  badge_rec RECORD;
  quiz_count integer;
  course_count integer;
  total_xp integer;
BEGIN
  SELECT COUNT(*) INTO quiz_count FROM quiz_attempts WHERE user_id = _user_id;
  SELECT COUNT(*) INTO course_count FROM course_progress WHERE user_id = _user_id AND completed = true;
  SELECT COALESCE(xp, 0) INTO total_xp FROM profiles WHERE id = _user_id;

  FOR badge_rec IN SELECT * FROM badges LOOP
    -- Skip if already earned
    IF EXISTS (SELECT 1 FROM user_badges WHERE user_id = _user_id AND badge_id = badge_rec.id) THEN
      CONTINUE;
    END IF;

    -- Check conditions
    IF badge_rec.condition_type = 'quizzes_completed' AND quiz_count >= badge_rec.condition_value THEN
      INSERT INTO user_badges (user_id, badge_id) VALUES (_user_id, badge_rec.id);
      PERFORM award_xp(_user_id, badge_rec.xp_reward, 'Badge: ' || badge_rec.name);
    ELSIF badge_rec.condition_type = 'courses_completed' AND course_count >= badge_rec.condition_value THEN
      INSERT INTO user_badges (user_id, badge_id) VALUES (_user_id, badge_rec.id);
      PERFORM award_xp(_user_id, badge_rec.xp_reward, 'Badge: ' || badge_rec.name);
    ELSIF badge_rec.condition_type = 'xp_earned' AND total_xp >= badge_rec.condition_value THEN
      INSERT INTO user_badges (user_id, badge_id) VALUES (_user_id, badge_rec.id);
      PERFORM award_xp(_user_id, badge_rec.xp_reward, 'Badge: ' || badge_rec.name);
    END IF;
  END LOOP;
END;
$$;

-- Seed initial badges
INSERT INTO public.badges (name, description, icon, category, xp_reward, condition_type, condition_value) VALUES
  ('Premier pas', 'Complétez votre premier QCM', 'rocket', 'quizzes', 20, 'quizzes_completed', 1),
  ('Apprenti', 'Complétez 5 QCM', 'book-open', 'quizzes', 50, 'quizzes_completed', 5),
  ('Expert', 'Complétez 20 QCM', 'award', 'quizzes', 100, 'quizzes_completed', 20),
  ('Étudiant assidu', 'Terminez votre premier cours', 'graduation-cap', 'courses', 20, 'courses_completed', 1),
  ('Scholar', 'Terminez 10 cours', 'library', 'courses', 75, 'courses_completed', 10),
  ('Maître', 'Terminez 25 cours', 'crown', 'courses', 150, 'courses_completed', 25),
  ('Collectionneur XP', 'Gagnez 500 XP', 'star', 'xp', 50, 'xp_earned', 500),
  ('Légende', 'Gagnez 2000 XP', 'flame', 'xp', 200, 'xp_earned', 2000);
