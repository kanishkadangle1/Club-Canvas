
CREATE TABLE public.event_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  club_id uuid NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  title text NOT NULL,
  speaker text,
  description text,
  start_time timestamptz,
  end_time timestamptz,
  order_index integer NOT NULL DEFAULT 0,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_sessions TO authenticated;
GRANT ALL ON public.event_sessions TO service_role;

ALTER TABLE public.event_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view sessions" ON public.event_sessions
  FOR SELECT TO authenticated USING (public.is_club_member(club_id, auth.uid()));
CREATE POLICY "Coords create sessions" ON public.event_sessions
  FOR INSERT TO authenticated
  WITH CHECK (public.has_club_role(club_id, auth.uid(), ARRAY['lead'::club_role,'coordinator'::club_role]) AND created_by = auth.uid());
CREATE POLICY "Coords update sessions" ON public.event_sessions
  FOR UPDATE TO authenticated
  USING (public.has_club_role(club_id, auth.uid(), ARRAY['lead'::club_role,'coordinator'::club_role]));
CREATE POLICY "Coords delete sessions" ON public.event_sessions
  FOR DELETE TO authenticated
  USING (public.has_club_role(club_id, auth.uid(), ARRAY['lead'::club_role,'coordinator'::club_role]));

CREATE INDEX idx_event_sessions_event ON public.event_sessions(event_id, order_index);

CREATE TABLE public.event_attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  club_id uuid NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  attended boolean NOT NULL DEFAULT false,
  checked_in_at timestamptz,
  added_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_attendees TO authenticated;
GRANT ALL ON public.event_attendees TO service_role;

ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view attendees" ON public.event_attendees
  FOR SELECT TO authenticated USING (public.is_club_member(club_id, auth.uid()));
CREATE POLICY "Coords add attendees" ON public.event_attendees
  FOR INSERT TO authenticated
  WITH CHECK (public.has_club_role(club_id, auth.uid(), ARRAY['lead'::club_role,'coordinator'::club_role]) AND added_by = auth.uid());
CREATE POLICY "Coords update attendees" ON public.event_attendees
  FOR UPDATE TO authenticated
  USING (public.has_club_role(club_id, auth.uid(), ARRAY['lead'::club_role,'coordinator'::club_role]));
CREATE POLICY "Coords delete attendees" ON public.event_attendees
  FOR DELETE TO authenticated
  USING (public.has_club_role(club_id, auth.uid(), ARRAY['lead'::club_role,'coordinator'::club_role]));

CREATE INDEX idx_event_attendees_event ON public.event_attendees(event_id);
