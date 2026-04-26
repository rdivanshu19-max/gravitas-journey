
-- Roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  is_banned BOOLEAN NOT NULL DEFAULT false,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  onboarding_complete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Track deleted emails to prevent reuse
CREATE TABLE public.deleted_emails (
  email TEXT PRIMARY KEY,
  deleted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.deleted_emails ENABLE ROW LEVEL SECURITY;

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Has role function (security definer to bypass RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Update timestamp helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile + role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Block deleted emails
  IF EXISTS (SELECT 1 FROM public.deleted_emails WHERE email = NEW.email) THEN
    RAISE EXCEPTION 'This email has been deleted and cannot be reused';
  END IF;

  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));

  IF NEW.email = 'studyspacerankers@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  END IF;

  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Profiles policies
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins update all profiles" ON public.profiles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete profiles" ON public.profiles FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- User roles policies
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Deleted emails: only admins or trigger
CREATE POLICY "Admins view deleted emails" ON public.deleted_emails FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert deleted emails" ON public.deleted_emails FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Onboarding
CREATE TABLE public.onboarding_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  target_exam TEXT,
  class_level TEXT,
  coaching TEXT,
  current_marks INTEGER,
  target_rank TEXT,
  weak_subjects TEXT[],
  strong_subjects TEXT[],
  study_hours INTEGER,
  exam_date DATE,
  thinking_style TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.onboarding_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own onboarding" ON public.onboarding_responses FOR ALL USING (auth.uid() = user_id);

-- Wrong answers (graveyard)
CREATE TABLE public.wrong_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  subject TEXT,
  topic TEXT,
  user_answer TEXT,
  correct_answer TEXT,
  mistake_type TEXT,
  buried_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resurrected_at TIMESTAMPTZ,
  defeated BOOLEAN NOT NULL DEFAULT false
);
ALTER TABLE public.wrong_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own graveyard" ON public.wrong_answers FOR ALL USING (auth.uid() = user_id);

-- Focus sessions
CREATE TABLE public.focus_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  duration_minutes INTEGER NOT NULL,
  distractions INTEGER NOT NULL DEFAULT 0,
  silence_score INTEGER NOT NULL,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sessions" ON public.focus_sessions FOR ALL USING (auth.uid() = user_id);

-- Confessions (anonymous)
CREATE TABLE public.confessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  votes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.confessions ENABLE ROW LEVEL SECURITY;
-- Public-readable but author hidden; we expose via view
CREATE VIEW public.confessions_public WITH (security_invoker=on) AS
  SELECT id, content, votes, created_at FROM public.confessions;
CREATE POLICY "Authors insert own confessions" ON public.confessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authors view own confessions" ON public.confessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can read public confessions" ON public.confessions FOR SELECT USING (true);
CREATE POLICY "Authors delete own" ON public.confessions FOR DELETE USING (auth.uid() = user_id);

-- Time capsules
CREATE TABLE public.time_capsules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  unlock_date DATE NOT NULL,
  unlocked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.time_capsules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own capsules" ON public.time_capsules FOR ALL USING (auth.uid() = user_id);

-- Mock scores
CREATE TABLE public.mock_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_name TEXT NOT NULL,
  physics INTEGER,
  chemistry INTEGER,
  math_or_bio INTEGER,
  total INTEGER,
  test_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mock_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own scores" ON public.mock_scores FOR ALL USING (auth.uid() = user_id);

-- Admin function: ban/unban/delete other users
CREATE OR REPLACE FUNCTION public.admin_set_ban(_target UUID, _banned BOOLEAN)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  UPDATE public.profiles SET is_banned = _banned WHERE id = _target;
END; $$;

CREATE OR REPLACE FUNCTION public.admin_delete_user(_target UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _email TEXT;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  SELECT email INTO _email FROM public.profiles WHERE id = _target;
  INSERT INTO public.deleted_emails(email) VALUES (_email) ON CONFLICT DO NOTHING;
  DELETE FROM auth.users WHERE id = _target;
END; $$;

-- Self-delete account
CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _email TEXT;
BEGIN
  SELECT email INTO _email FROM public.profiles WHERE id = auth.uid();
  IF _email IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  INSERT INTO public.deleted_emails(email) VALUES (_email) ON CONFLICT DO NOTHING;
  DELETE FROM auth.users WHERE id = auth.uid();
END; $$;
