
-- Recreate missing trigger so club owner is auto-added as a lead member.
-- Without this, RLS SELECT on clubs (requires membership) hides the just-created
-- club from its owner, breaking creation flows.
DROP TRIGGER IF EXISTS clubs_add_owner_as_lead ON public.clubs;
CREATE TRIGGER clubs_add_owner_as_lead
AFTER INSERT ON public.clubs
FOR EACH ROW EXECUTE FUNCTION public.add_owner_as_lead();
