-- Allow authors + admins to delete their confessions
CREATE POLICY "Admins delete confessions" ON public.confessions
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Public view should include user_id so client can know ownership
DROP VIEW IF EXISTS public.confessions_public;
CREATE VIEW public.confessions_public WITH (security_invoker = true) AS
  SELECT id, content, votes, created_at, user_id FROM public.confessions;

-- Likes
CREATE TABLE public.confession_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  confession_id uuid NOT NULL REFERENCES public.confessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(confession_id, user_id)
);
ALTER TABLE public.confession_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads likes" ON public.confession_likes FOR SELECT USING (true);
CREATE POLICY "Users like as themselves" ON public.confession_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users unlike own" ON public.confession_likes FOR DELETE USING (auth.uid() = user_id);

-- Replies (anonymous)
CREATE TABLE public.confession_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  confession_id uuid NOT NULL REFERENCES public.confessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.confession_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads replies" ON public.confession_replies FOR SELECT USING (true);
CREATE POLICY "Users insert own replies" ON public.confession_replies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authors delete own replies" ON public.confession_replies FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins delete replies" ON public.confession_replies FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Public view of replies (with user_id for ownership)
CREATE VIEW public.confession_replies_public WITH (security_invoker = true) AS
  SELECT id, confession_id, content, created_at, user_id FROM public.confession_replies;

-- Brain fingerprint persistence
CREATE TABLE public.brain_fingerprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  profile_type text NOT NULL,
  scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.brain_fingerprints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own fingerprint" ON public.brain_fingerprints
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER bf_updated BEFORE UPDATE ON public.brain_fingerprints
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Allow email reuse: drop deleted_emails block in trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  IF NEW.email = 'studyspacerankers@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  END IF;
  RETURN NEW;
END; $$;

-- Update delete_own_account to not record blocked email
CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  DELETE FROM auth.users WHERE id = auth.uid();
END; $$;

CREATE OR REPLACE FUNCTION public.admin_delete_user(_target uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  DELETE FROM auth.users WHERE id = _target;
END; $$;

-- Drop deleted_emails table (no longer used)
DROP TABLE IF EXISTS public.deleted_emails;