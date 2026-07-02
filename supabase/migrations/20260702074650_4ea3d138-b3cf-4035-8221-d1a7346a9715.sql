
-- 1. Fix club_members self-insert escalation
DROP POLICY IF EXISTS "Self-insert when creating club, or lead adds members" ON public.club_members;
CREATE POLICY "Owner bootstraps self, or lead/coord adds members"
ON public.club_members
FOR INSERT
TO authenticated
WITH CHECK (
  (
    user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.clubs c WHERE c.id = club_id AND c.owner_id = auth.uid())
  )
  OR public.has_club_role(club_id, auth.uid(), ARRAY['lead'::club_role, 'coordinator'::club_role])
);

-- 2. event_attendees: re-affirm restrictive SELECT (drop any legacy permissive policies if present)
DROP POLICY IF EXISTS "Members view attendees" ON public.event_attendees;
DROP POLICY IF EXISTS "Members can view attendees" ON public.event_attendees;
-- 'Coords view attendees' already restricts to lead/coordinator; leave in place.

-- 3. Storage: require club membership on upload; drop public listing policy
DROP POLICY IF EXISTS "Authenticated upload to club photos" ON storage.objects;
CREATE POLICY "Club members upload to club photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'club-photos'
  AND public.is_club_member(
    NULLIF(split_part(name, '/', 1), '')::uuid,
    auth.uid()
  )
);

DROP POLICY IF EXISTS "Public read club photos" ON storage.objects;
-- Bucket remains public so direct CDN URLs continue to work; listing is now disallowed.

-- 4. Realtime channel authorization: only club members can subscribe to `club:<uuid>` / `doc:<uuid>` topics
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Club members access realtime" ON realtime.messages;
CREATE POLICY "Club members access realtime"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  public.is_club_member(
    NULLIF(split_part(realtime.topic(), ':', 2), '')::uuid,
    auth.uid()
  )
);

DROP POLICY IF EXISTS "Club members send realtime" ON realtime.messages;
CREATE POLICY "Club members send realtime"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_club_member(
    NULLIF(split_part(realtime.topic(), ':', 2), '')::uuid,
    auth.uid()
  )
);

-- 5. Fix mutable search_path on set_updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
begin new.updated_at = now(); return new; end;
$$;

-- 6. Revoke public/anon EXECUTE on SECURITY DEFINER helpers; authenticated retained where required by RLS
REVOKE EXECUTE ON FUNCTION public.has_club_role(uuid, uuid, club_role[]) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_club_member(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.add_owner_as_lead() FROM PUBLIC, anon, authenticated;
