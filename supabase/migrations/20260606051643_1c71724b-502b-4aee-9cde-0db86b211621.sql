
-- Re-grant full table SELECT (previous migration left only column-level grants which break SELECT *)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_attendees TO authenticated;

-- Drop the partial "members view names" policy and replace with coords-only access.
DROP POLICY IF EXISTS "Members view attendee names" ON public.event_attendees;
DROP POLICY IF EXISTS "Members view attendees" ON public.event_attendees;

CREATE POLICY "Coords view attendees"
  ON public.event_attendees FOR SELECT
  TO authenticated
  USING (public.has_club_role(club_id, auth.uid(), ARRAY['lead'::club_role, 'coordinator'::club_role]));

-- The previously-created coord view is now redundant
DROP VIEW IF EXISTS public.event_attendees_with_email;
