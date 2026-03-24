-- Migration: Admin Provisioning Flow
-- Locks down org creation to owner-only (via SQL editor / service role)
-- Adds seat limits and provisioning function

-- 1. Add max_seats column to organisations
ALTER TABLE public.organisations ADD COLUMN IF NOT EXISTS max_seats integer NOT NULL DEFAULT 10;

-- 2. Drop the public org creation policy (no more client-side org creation)
DROP POLICY IF EXISTS "Auth users create org" ON public.organisations;

-- 3. Create provisioning function (SECURITY DEFINER — bypasses RLS)
-- Only callable from SQL editor or service role key, NOT from the client
CREATE OR REPLACE FUNCTION public.provision_org(
  p_org_name    text,
  p_admin_email text,
  p_max_seats   integer DEFAULT 10
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id  uuid;
  v_org_id   uuid;
BEGIN
  -- Find the user by email in auth.users
  SELECT id INTO v_user_id
    FROM auth.users
   WHERE email = p_admin_email;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No user found with email: %', p_admin_email;
  END IF;

  -- Create the organisation
  INSERT INTO public.organisations (name, created_by, max_seats)
    VALUES (p_org_name, v_user_id, p_max_seats)
    RETURNING id INTO v_org_id;

  -- Assign user as admin of the new org
  UPDATE public.profiles
     SET org_id = v_org_id,
         role = 'admin',
         updated_at = now()
   WHERE id = v_user_id;

  RETURN jsonb_build_object(
    'org_id', v_org_id,
    'org_name', p_org_name,
    'admin_user_id', v_user_id,
    'admin_email', p_admin_email,
    'max_seats', p_max_seats
  );
END;
$$;

-- 4. Revoke public access — only service role (SQL editor) can call this
REVOKE EXECUTE ON FUNCTION public.provision_org FROM anon, authenticated;

-- 5. Seat limit enforcement trigger on org_invites
CREATE OR REPLACE FUNCTION public.check_seat_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_max_seats   integer;
  v_current     integer;
  v_pending     integer;
BEGIN
  SELECT max_seats INTO v_max_seats
    FROM public.organisations
   WHERE id = NEW.org_id;

  SELECT count(*) INTO v_current
    FROM public.profiles
   WHERE org_id = NEW.org_id;

  SELECT count(*) INTO v_pending
    FROM public.org_invites
   WHERE org_id = NEW.org_id;

  IF (v_current + v_pending) >= v_max_seats THEN
    RAISE EXCEPTION 'Seat limit reached (% of % seats used, % pending invites)',
      v_current, v_max_seats, v_pending;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_seat_limit ON public.org_invites;
CREATE TRIGGER enforce_seat_limit
  BEFORE INSERT ON public.org_invites
  FOR EACH ROW
  EXECUTE FUNCTION public.check_seat_limit();

-- 6. Update handle_new_user to check seat limits before auto-assigning
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  _invite   record;
  _max      integer;
  _current  integer;
BEGIN
  SELECT * INTO _invite FROM public.org_invites WHERE email = new.email LIMIT 1;

  IF _invite IS NOT NULL THEN
    -- Check seat limit before assigning
    SELECT max_seats INTO _max FROM public.organisations WHERE id = _invite.org_id;
    SELECT count(*) INTO _current FROM public.profiles WHERE org_id = _invite.org_id;

    IF _current < _max THEN
      INSERT INTO public.profiles (id, display_name, org_id, role)
      VALUES (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', 'User'), _invite.org_id, 'user');
    ELSE
      INSERT INTO public.profiles (id, display_name)
      VALUES (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', 'User'));
    END IF;

    DELETE FROM public.org_invites WHERE id = _invite.id;
  ELSE
    INSERT INTO public.profiles (id, display_name)
    VALUES (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', 'User'));
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
