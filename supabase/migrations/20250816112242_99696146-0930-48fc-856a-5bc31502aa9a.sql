-- Fix policy creation by guarding with pg_policies lookups

-- Create is_admin helper function
create or replace function public.is_admin(_uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = _uid
      and (p.user_type = 'admin' or p.email = 'luckilyimat@gmail.com')
  );
$$;

-- Subjects table
create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text not null check (category in ('academic','vocational')),
  level text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Teacher subjects (per-subject approval required)
create table if not exists public.teacher_subjects (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null,
  subject_id uuid not null,
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(teacher_id, subject_id)
);

-- Ratings table (students rate teachers)
create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null,
  student_id uuid not null,
  rating numeric not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz not null default now()
);

-- Teacher documents (for verification)
create table if not exists public.teacher_documents (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null,
  doc_type text,
  file_path text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Payments table
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid references public.subscriptions(id) on delete set null,
  student_id uuid not null,
  teacher_id uuid not null,
  amount_usd numeric not null,
  platform_fee_usd numeric not null,
  teacher_payout_usd numeric not null,
  status text not null default 'pending' check (status in ('pending','paid','failed','refunded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.subjects enable row level security;
alter table public.teacher_subjects enable row level security;
alter table public.ratings enable row level security;
alter table public.teacher_documents enable row level security;
alter table public.payments enable row level security;

-- Policies with guards
-- Subjects: readable by everyone
DO $$
BEGIN
IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='subjects' AND policyname='Subjects are viewable by everyone'
) THEN
  CREATE POLICY "Subjects are viewable by everyone"
    ON public.subjects FOR SELECT USING (true);
END IF;
END$$;

-- Teacher subjects policies
DO $$
BEGIN
IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='teacher_subjects' AND policyname='Teacher can view own teacher_subjects'
) THEN
  CREATE POLICY "Teacher can view own teacher_subjects"
    ON public.teacher_subjects FOR SELECT USING (auth.uid() = teacher_id);
END IF;
IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='teacher_subjects' AND policyname='Public can view approved teacher_subjects'
) THEN
  CREATE POLICY "Public can view approved teacher_subjects"
    ON public.teacher_subjects FOR SELECT USING (
      exists(select 1 from public.teachers t where t.id = teacher_id and t.approved = true) and approved = true
    );
END IF;
IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='teacher_subjects' AND policyname='Teacher can request subject approval'
) THEN
  CREATE POLICY "Teacher can request subject approval"
    ON public.teacher_subjects FOR INSERT WITH CHECK (auth.uid() = teacher_id and approved = false);
END IF;
IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='teacher_subjects' AND policyname='Teacher can edit own unapproved entries'
) THEN
  CREATE POLICY "Teacher can edit own unapproved entries"
    ON public.teacher_subjects FOR UPDATE USING (auth.uid() = teacher_id and approved = false);
END IF;
IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='teacher_subjects' AND policyname='Admin can approve teacher_subjects'
) THEN
  CREATE POLICY "Admin can approve teacher_subjects"
    ON public.teacher_subjects FOR UPDATE USING (public.is_admin(auth.uid()));
END IF;
END$$;

-- Ratings policies
DO $$
BEGIN
IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='ratings' AND policyname='Teacher can view ratings received'
) THEN
  CREATE POLICY "Teacher can view ratings received"
    ON public.ratings FOR SELECT USING (auth.uid() = teacher_id);
END IF;
IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='ratings' AND policyname='Student can view their own ratings'
) THEN
  CREATE POLICY "Student can view their own ratings"
    ON public.ratings FOR SELECT USING (auth.uid() = student_id);
END IF;
IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='ratings' AND policyname='Public can view ratings for approved teachers'
) THEN
  CREATE POLICY "Public can view ratings for approved teachers"
    ON public.ratings FOR SELECT USING (
      exists(select 1 from public.teachers t where t.id = teacher_id and t.approved = true)
    );
END IF;
IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='ratings' AND policyname='Student can create rating'
) THEN
  CREATE POLICY "Student can create rating"
    ON public.ratings FOR INSERT WITH CHECK (auth.uid() = student_id);
END IF;
IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='ratings' AND policyname='Student can update their rating'
) THEN
  CREATE POLICY "Student can update their rating"
    ON public.ratings FOR UPDATE USING (auth.uid() = student_id);
END IF;
END$$;

-- Teacher documents
DO $$
BEGIN
IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='teacher_documents' AND policyname='Teacher can view own documents'
) THEN
  CREATE POLICY "Teacher can view own documents"
    ON public.teacher_documents FOR SELECT USING (auth.uid() = teacher_id);
END IF;
IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='teacher_documents' AND policyname='Teacher can upload own documents'
) THEN
  CREATE POLICY "Teacher can upload own documents"
    ON public.teacher_documents FOR INSERT WITH CHECK (auth.uid() = teacher_id);
END IF;
IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='teacher_documents' AND policyname='Teacher can update own documents while pending'
) THEN
  CREATE POLICY "Teacher can update own documents while pending"
    ON public.teacher_documents FOR UPDATE USING (auth.uid() = teacher_id and status = 'pending');
END IF;
IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='teacher_documents' AND policyname='Admin can manage documents'
) THEN
  CREATE POLICY "Admin can manage documents"
    ON public.teacher_documents FOR ALL USING (public.is_admin(auth.uid()));
END IF;
END$$;

-- Payments policies
DO $$
BEGIN
IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='payments' AND policyname='Student can view own payments'
) THEN
  CREATE POLICY "Student can view own payments" ON public.payments FOR SELECT USING (auth.uid() = student_id);
END IF;
IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='payments' AND policyname='Teacher can view payments to them'
) THEN
  CREATE POLICY "Teacher can view payments to them" ON public.payments FOR SELECT USING (auth.uid() = teacher_id);
END IF;
IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='payments' AND policyname='Student can create their payment records'
) THEN
  CREATE POLICY "Student can create their payment records" ON public.payments FOR INSERT WITH CHECK (auth.uid() = student_id);
END IF;
IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='payments' AND policyname='Admin can manage all payments'
) THEN
  CREATE POLICY "Admin can manage all payments" ON public.payments FOR ALL USING (public.is_admin(auth.uid()));
END IF;
END$$;

-- updated_at triggers
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger if not exists set_subjects_updated_at before update on public.subjects
for each row execute function public.set_updated_at();
create trigger if not exists set_teacher_subjects_updated_at before update on public.teacher_subjects
for each row execute function public.set_updated_at();
create trigger if not exists set_teacher_documents_updated_at before update on public.teacher_documents
for each row execute function public.set_updated_at();
create trigger if not exists set_payments_updated_at before update on public.payments
for each row execute function public.set_updated_at();

-- Keep teachers.rating in sync with ratings table
create or replace function public.update_teacher_rating()
returns trigger as $$
begin
  update public.teachers t
    set rating = (
      select coalesce(avg(r.rating), 0)
      from public.ratings r
      where r.teacher_id = t.id
    )
  where t.id = coalesce(new.teacher_id, old.teacher_id);
  return null;
end;
$$ language plpgsql security definer set search_path = public;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'ratings_after_change'
  ) THEN
    CREATE TRIGGER ratings_after_change
    AFTER INSERT OR UPDATE OR DELETE ON public.ratings
    FOR EACH ROW EXECUTE FUNCTION public.update_teacher_rating();
  END IF;
END$$;

-- Haversine distance (km)
create or replace function public.haversine_km(lat1 double precision, lon1 double precision, lat2 double precision, lon2 double precision)
returns double precision
language sql immutable as $$
  with cte as (
    select radians(lat2 - lat1) as dlat,
           radians(lon2 - lon1) as dlon,
           radians(lat1) as rlat1,
           radians(lat2) as rlat2
  )
  select 6371 * 2 * atan2(
    sqrt(sin(dlat/2)^2 + cos(rlat1) * cos(rlat2) * sin(dlon/2)^2),
    sqrt(1 - (sin(dlat/2)^2 + cos(rlat1) * cos(rlat2) * sin(dlon/2)^2))
  ) from cte;
$$;

-- Nearby teachers RPC for a student and subject
create or replace function public.get_teachers_nearby_by_subject(_student_id uuid, _subject text, _limit int default 20)
returns table (
  teacher_id uuid,
  full_name text,
  rating numeric,
  location_city text,
  distance_km double precision
)
language sql
security definer
set search_path = public
as $$
  with s as (
    select residence_lat, residence_lng from public.students where id = _student_id
  )
  select t.id as teacher_id,
         p.full_name,
         t.rating,
         t.location_city,
         public.haversine_km(s.residence_lat, s.residence_lng, t.business_lat, t.business_lng) as distance_km
  from public.teachers t
  join public.profiles p on p.id = t.id
  join s on true
  where t.approved = true
    and t.business_lat is not null and t.business_lng is not null
    and exists (
      select 1 from public.teacher_subjects ts
      join public.subjects sub on sub.id = ts.subject_id
      where ts.teacher_id = t.id and ts.approved = true and sub.name ilike _subject
    )
  order by distance_km asc
  limit _limit;
$$;

-- Income projection RPC
create or replace function public.get_teacher_income_projection(_teacher_id uuid)
returns table (
  one_on_one_students integer,
  group_students integer,
  monthly_revenue numeric,
  teacher_share numeric
)
language sql
security definer
set search_path = public
as $$
  select
    coalesce(sum(case when lesson_type = 'one_on_one' and status = 'active' then 1 else 0 end),0) as one_on_one_students,
    coalesce(sum(case when lesson_type = 'group' and status = 'active' then 1 else 0 end),0) as group_students,
    coalesce(sum(case when status = 'active' then price_usd else 0 end),0) as monthly_revenue,
    coalesce(sum(case when status = 'active' then price_usd * 0.9 else 0 end),0) as teacher_share
  from public.subscriptions
  where teacher_id = _teacher_id;
$$;

-- Storage buckets
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('teacher-docs', 'teacher-docs', false)
  on conflict (id) do nothing;

-- Storage policies guarded
DO $$
BEGIN
IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Avatar images are publicly accessible'
) THEN
  CREATE POLICY "Avatar images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');
END IF;
IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Users can upload their own avatar'
) THEN
  CREATE POLICY "Users can upload their own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
END IF;
IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Users can update their own avatar'
) THEN
  CREATE POLICY "Users can update their own avatar"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
END IF;
IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Teachers can manage their own documents'
) THEN
  CREATE POLICY "Teachers can manage their own documents"
    ON storage.objects FOR ALL
    USING (bucket_id = 'teacher-docs' and auth.uid()::text = (storage.foldername(name))[1])
    WITH CHECK (bucket_id = 'teacher-docs' and auth.uid()::text = (storage.foldername(name))[1]);
END IF;
IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Admin can read teacher documents'
) THEN
  CREATE POLICY "Admin can read teacher documents"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'teacher-docs' and public.is_admin(auth.uid()));
END IF;
END$$;