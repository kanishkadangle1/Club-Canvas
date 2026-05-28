
-- Enum for roles within a club
create type public.club_role as enum ('lead', 'coordinator', 'member', 'faculty');

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "Profiles are viewable by authenticated users" on public.profiles for select to authenticated using (true);
create policy "Users can insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update to authenticated using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Clubs
create table public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  logo_url text,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.clubs to authenticated;
grant all on public.clubs to service_role;
alter table public.clubs enable row level security;

-- Club members
create table public.club_members (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role club_role not null default 'member',
  created_at timestamptz not null default now(),
  unique(club_id, user_id)
);
grant select, insert, update, delete on public.club_members to authenticated;
grant all on public.club_members to service_role;
alter table public.club_members enable row level security;

-- Helper: is user a member of a club
create or replace function public.is_club_member(_club uuid, _user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.club_members where club_id = _club and user_id = _user)
$$;

-- Helper: has role(s) in a club
create or replace function public.has_club_role(_club uuid, _user uuid, _roles club_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.club_members where club_id = _club and user_id = _user and role = any(_roles))
$$;

-- Clubs policies
create policy "Members can view clubs" on public.clubs for select to authenticated
  using (public.is_club_member(id, auth.uid()));
create policy "Anyone authenticated can create a club" on public.clubs for insert to authenticated
  with check (owner_id = auth.uid());
create policy "Owner or lead can update club" on public.clubs for update to authenticated
  using (owner_id = auth.uid() or public.has_club_role(id, auth.uid(), array['lead']::club_role[]));
create policy "Owner can delete club" on public.clubs for delete to authenticated
  using (owner_id = auth.uid());

-- Club members policies
create policy "Members can view roster" on public.club_members for select to authenticated
  using (public.is_club_member(club_id, auth.uid()));
create policy "Self-insert when creating club, or lead adds members" on public.club_members for insert to authenticated
  with check (user_id = auth.uid() or public.has_club_role(club_id, auth.uid(), array['lead','coordinator']::club_role[]));
create policy "Leads manage roles" on public.club_members for update to authenticated
  using (public.has_club_role(club_id, auth.uid(), array['lead']::club_role[]));
create policy "Leads remove members" on public.club_members for delete to authenticated
  using (public.has_club_role(club_id, auth.uid(), array['lead']::club_role[]) or user_id = auth.uid());

-- Auto-add creator as lead when a club is inserted
create or replace function public.add_owner_as_lead()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.club_members (club_id, user_id, role) values (new.id, new.owner_id, 'lead')
  on conflict do nothing;
  return new;
end; $$;
create trigger clubs_after_insert after insert on public.clubs for each row execute function public.add_owner_as_lead();

-- Events
create table public.events (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  title text not null,
  description text,
  event_date timestamptz,
  location text,
  status text not null default 'upcoming',
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.events to authenticated;
grant all on public.events to service_role;
alter table public.events enable row level security;
create policy "Members view events" on public.events for select to authenticated using (public.is_club_member(club_id, auth.uid()));
create policy "Coords create events" on public.events for insert to authenticated with check (public.has_club_role(club_id, auth.uid(), array['lead','coordinator']::club_role[]) and created_by = auth.uid());
create policy "Coords update events" on public.events for update to authenticated using (public.has_club_role(club_id, auth.uid(), array['lead','coordinator']::club_role[]));
create policy "Coords delete events" on public.events for delete to authenticated using (public.has_club_role(club_id, auth.uid(), array['lead','coordinator']::club_role[]));

-- Documents
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  event_id uuid references public.events(id) on delete set null,
  title text not null,
  content text not null default '',
  doc_type text not null default 'report',
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.documents to authenticated;
grant all on public.documents to service_role;
alter table public.documents enable row level security;
create policy "Members view docs" on public.documents for select to authenticated using (public.is_club_member(club_id, auth.uid()));
create policy "Coords create docs" on public.documents for insert to authenticated with check (public.has_club_role(club_id, auth.uid(), array['lead','coordinator']::club_role[]) and created_by = auth.uid());
create policy "Coords update docs" on public.documents for update to authenticated using (public.has_club_role(club_id, auth.uid(), array['lead','coordinator']::club_role[]));
create policy "Coords delete docs" on public.documents for delete to authenticated using (public.has_club_role(club_id, auth.uid(), array['lead','coordinator']::club_role[]));

-- updated_at trigger
create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
create trigger documents_set_updated before update on public.documents for each row execute function public.set_updated_at();

-- Photos
create table public.photos (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  event_id uuid references public.events(id) on delete set null,
  url text not null,
  caption text,
  uploaded_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.photos to authenticated;
grant all on public.photos to service_role;
alter table public.photos enable row level security;
create policy "Members view photos" on public.photos for select to authenticated using (public.is_club_member(club_id, auth.uid()));
create policy "Members upload photos" on public.photos for insert to authenticated with check (public.is_club_member(club_id, auth.uid()) and uploaded_by = auth.uid());
create policy "Uploader or coord can delete" on public.photos for delete to authenticated using (uploaded_by = auth.uid() or public.has_club_role(club_id, auth.uid(), array['lead','coordinator']::club_role[]));

-- Storage bucket for club photos
insert into storage.buckets (id, name, public) values ('club-photos', 'club-photos', true) on conflict do nothing;
create policy "Public read club photos" on storage.objects for select using (bucket_id = 'club-photos');
create policy "Authenticated upload to club photos" on storage.objects for insert to authenticated with check (bucket_id = 'club-photos');
create policy "Owners delete own uploads" on storage.objects for delete to authenticated using (bucket_id = 'club-photos' and owner = auth.uid());

-- Realtime
alter publication supabase_realtime add table public.documents;
alter publication supabase_realtime add table public.events;
alter publication supabase_realtime add table public.photos;
