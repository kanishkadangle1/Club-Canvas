
CREATE SCHEMA IF NOT EXISTS app_private;
REVOKE ALL ON SCHEMA app_private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA app_private TO authenticated, service_role;

-- Recreate helpers in app_private
CREATE OR REPLACE FUNCTION app_private.has_club_role(_club uuid, _user uuid, _roles public.club_role[])
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  select exists (select 1 from public.club_members where club_id = _club and user_id = _user and role = any(_roles))
$$;

CREATE OR REPLACE FUNCTION app_private.is_club_member(_club uuid, _user uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  select exists (select 1 from public.club_members where club_id = _club and user_id = _user)
$$;

REVOKE EXECUTE ON FUNCTION app_private.has_club_role(uuid, uuid, public.club_role[]) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION app_private.is_club_member(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app_private.has_club_role(uuid, uuid, public.club_role[]) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_private.is_club_member(uuid, uuid) TO authenticated, service_role;

-- Rewrite all RLS policies that referenced public.has_club_role / public.is_club_member
-- clubs
DROP POLICY IF EXISTS "Members can view clubs" ON public.clubs;
CREATE POLICY "Members can view clubs" ON public.clubs FOR SELECT TO authenticated
USING (app_private.is_club_member(id, auth.uid()));

DROP POLICY IF EXISTS "Owner or lead can update club" ON public.clubs;
CREATE POLICY "Owner or lead can update club" ON public.clubs FOR UPDATE TO authenticated
USING ((owner_id = auth.uid()) OR app_private.has_club_role(id, auth.uid(), ARRAY['lead'::public.club_role]));

-- club_members
DROP POLICY IF EXISTS "Leads manage roles" ON public.club_members;
CREATE POLICY "Leads manage roles" ON public.club_members FOR UPDATE TO authenticated
USING (app_private.has_club_role(club_id, auth.uid(), ARRAY['lead'::public.club_role]));

DROP POLICY IF EXISTS "Leads remove members" ON public.club_members;
CREATE POLICY "Leads remove members" ON public.club_members FOR DELETE TO authenticated
USING (app_private.has_club_role(club_id, auth.uid(), ARRAY['lead'::public.club_role]) OR (user_id = auth.uid()));

DROP POLICY IF EXISTS "Members can view roster" ON public.club_members;
CREATE POLICY "Members can view roster" ON public.club_members FOR SELECT TO authenticated
USING (app_private.is_club_member(club_id, auth.uid()));

DROP POLICY IF EXISTS "Owner bootstraps self, or lead/coord adds members" ON public.club_members;
CREATE POLICY "Owner bootstraps self, or lead/coord adds members" ON public.club_members FOR INSERT TO authenticated
WITH CHECK (
  (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.clubs c WHERE c.id = club_id AND c.owner_id = auth.uid()))
  OR app_private.has_club_role(club_id, auth.uid(), ARRAY['lead'::public.club_role, 'coordinator'::public.club_role])
);

-- events
DROP POLICY IF EXISTS "Coords create events" ON public.events;
CREATE POLICY "Coords create events" ON public.events FOR INSERT TO authenticated
WITH CHECK (app_private.has_club_role(club_id, auth.uid(), ARRAY['lead'::public.club_role, 'coordinator'::public.club_role]) AND (created_by = auth.uid()));

DROP POLICY IF EXISTS "Coords delete events" ON public.events;
CREATE POLICY "Coords delete events" ON public.events FOR DELETE TO authenticated
USING (app_private.has_club_role(club_id, auth.uid(), ARRAY['lead'::public.club_role, 'coordinator'::public.club_role]));

DROP POLICY IF EXISTS "Coords update events" ON public.events;
CREATE POLICY "Coords update events" ON public.events FOR UPDATE TO authenticated
USING (app_private.has_club_role(club_id, auth.uid(), ARRAY['lead'::public.club_role, 'coordinator'::public.club_role]));

DROP POLICY IF EXISTS "Members view events" ON public.events;
CREATE POLICY "Members view events" ON public.events FOR SELECT TO authenticated
USING (app_private.is_club_member(club_id, auth.uid()));

-- documents
DROP POLICY IF EXISTS "Coords create docs" ON public.documents;
CREATE POLICY "Coords create docs" ON public.documents FOR INSERT TO authenticated
WITH CHECK (app_private.has_club_role(club_id, auth.uid(), ARRAY['lead'::public.club_role, 'coordinator'::public.club_role]) AND (created_by = auth.uid()));

DROP POLICY IF EXISTS "Coords delete docs" ON public.documents;
CREATE POLICY "Coords delete docs" ON public.documents FOR DELETE TO authenticated
USING (app_private.has_club_role(club_id, auth.uid(), ARRAY['lead'::public.club_role, 'coordinator'::public.club_role]));

DROP POLICY IF EXISTS "Coords update docs" ON public.documents;
CREATE POLICY "Coords update docs" ON public.documents FOR UPDATE TO authenticated
USING (app_private.has_club_role(club_id, auth.uid(), ARRAY['lead'::public.club_role, 'coordinator'::public.club_role]));

DROP POLICY IF EXISTS "Members view docs" ON public.documents;
CREATE POLICY "Members view docs" ON public.documents FOR SELECT TO authenticated
USING (app_private.is_club_member(club_id, auth.uid()));

-- photos
DROP POLICY IF EXISTS "Members upload photos" ON public.photos;
CREATE POLICY "Members upload photos" ON public.photos FOR INSERT TO authenticated
WITH CHECK (app_private.is_club_member(club_id, auth.uid()) AND (uploaded_by = auth.uid()));

DROP POLICY IF EXISTS "Members view photos" ON public.photos;
CREATE POLICY "Members view photos" ON public.photos FOR SELECT TO authenticated
USING (app_private.is_club_member(club_id, auth.uid()));

DROP POLICY IF EXISTS "Uploader or coord can delete" ON public.photos;
CREATE POLICY "Uploader or coord can delete" ON public.photos FOR DELETE TO authenticated
USING ((uploaded_by = auth.uid()) OR app_private.has_club_role(club_id, auth.uid(), ARRAY['lead'::public.club_role, 'coordinator'::public.club_role]));

-- event_attendees
DROP POLICY IF EXISTS "Coords add attendees" ON public.event_attendees;
CREATE POLICY "Coords add attendees" ON public.event_attendees FOR INSERT TO authenticated
WITH CHECK (app_private.has_club_role(club_id, auth.uid(), ARRAY['lead'::public.club_role, 'coordinator'::public.club_role]) AND (added_by = auth.uid()));

DROP POLICY IF EXISTS "Coords delete attendees" ON public.event_attendees;
CREATE POLICY "Coords delete attendees" ON public.event_attendees FOR DELETE TO authenticated
USING (app_private.has_club_role(club_id, auth.uid(), ARRAY['lead'::public.club_role, 'coordinator'::public.club_role]));

DROP POLICY IF EXISTS "Coords update attendees" ON public.event_attendees;
CREATE POLICY "Coords update attendees" ON public.event_attendees FOR UPDATE TO authenticated
USING (app_private.has_club_role(club_id, auth.uid(), ARRAY['lead'::public.club_role, 'coordinator'::public.club_role]));

DROP POLICY IF EXISTS "Coords view attendees" ON public.event_attendees;
CREATE POLICY "Coords view attendees" ON public.event_attendees FOR SELECT TO authenticated
USING (app_private.has_club_role(club_id, auth.uid(), ARRAY['lead'::public.club_role, 'coordinator'::public.club_role]));

-- event_sessions
DROP POLICY IF EXISTS "Coords create sessions" ON public.event_sessions;
CREATE POLICY "Coords create sessions" ON public.event_sessions FOR INSERT TO authenticated
WITH CHECK (app_private.has_club_role(club_id, auth.uid(), ARRAY['lead'::public.club_role, 'coordinator'::public.club_role]) AND (created_by = auth.uid()));

DROP POLICY IF EXISTS "Coords delete sessions" ON public.event_sessions;
CREATE POLICY "Coords delete sessions" ON public.event_sessions FOR DELETE TO authenticated
USING (app_private.has_club_role(club_id, auth.uid(), ARRAY['lead'::public.club_role, 'coordinator'::public.club_role]));

DROP POLICY IF EXISTS "Coords update sessions" ON public.event_sessions;
CREATE POLICY "Coords update sessions" ON public.event_sessions FOR UPDATE TO authenticated
USING (app_private.has_club_role(club_id, auth.uid(), ARRAY['lead'::public.club_role, 'coordinator'::public.club_role]));

DROP POLICY IF EXISTS "Members view sessions" ON public.event_sessions;
CREATE POLICY "Members view sessions" ON public.event_sessions FOR SELECT TO authenticated
USING (app_private.is_club_member(club_id, auth.uid()));

-- storage upload policy referenced public.is_club_member
DROP POLICY IF EXISTS "Club members upload to club photos" ON storage.objects;
CREATE POLICY "Club members upload to club photos" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'club-photos'
  AND app_private.is_club_member(NULLIF(split_part(name, '/', 1), '')::uuid, auth.uid())
);

-- realtime policies
DROP POLICY IF EXISTS "Club members access realtime" ON realtime.messages;
CREATE POLICY "Club members access realtime" ON realtime.messages FOR SELECT TO authenticated
USING (app_private.is_club_member(NULLIF(split_part(realtime.topic(), ':', 2), '')::uuid, auth.uid()));

DROP POLICY IF EXISTS "Club members send realtime" ON realtime.messages;
CREATE POLICY "Club members send realtime" ON realtime.messages FOR INSERT TO authenticated
WITH CHECK (app_private.is_club_member(NULLIF(split_part(realtime.topic(), ':', 2), '')::uuid, auth.uid()));

-- Drop the now-unreferenced public wrappers
DROP FUNCTION IF EXISTS public.has_club_role(uuid, uuid, public.club_role[]);
DROP FUNCTION IF EXISTS public.is_club_member(uuid, uuid);
