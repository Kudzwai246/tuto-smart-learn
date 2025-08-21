-- Update admin function to include both admin emails
CREATE OR REPLACE FUNCTION public.is_admin(_uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  select exists (
    select 1 from public.profiles p
    where p.id = _uid
      and (p.user_type = 'admin' 
           or p.email = 'luckilyimat@gmail.com' 
           or p.email = 'chiwandiretakunda75@gmail.com')
  );
$function$;

-- Add profile picture to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;

-- Add qualifications and detailed fields to teachers table
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS qualification_details jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS teaching_methodology text;
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS specializations text[];
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS availability_schedule jsonb DEFAULT '{}'::jsonb;

-- Enhanced rating system with detailed feedback
ALTER TABLE public.ratings ADD COLUMN IF NOT EXISTS teaching_quality integer CHECK (teaching_quality >= 1 AND teaching_quality <= 5);
ALTER TABLE public.ratings ADD COLUMN IF NOT EXISTS communication integer CHECK (communication >= 1 AND communication <= 5);
ALTER TABLE public.ratings ADD COLUMN IF NOT EXISTS punctuality integer CHECK (punctuality >= 1 AND punctuality <= 5);
ALTER TABLE public.ratings ADD COLUMN IF NOT EXISTS subject_knowledge integer CHECK (subject_knowledge >= 1 AND subject_knowledge <= 5);

-- Update teacher rating calculation function to include detailed ratings
CREATE OR REPLACE FUNCTION public.update_teacher_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  update public.teachers t
    set rating = (
      select coalesce(
        (avg(r.rating) + avg(r.teaching_quality) + avg(r.communication) + avg(r.punctuality) + avg(r.subject_knowledge)) / 5, 
        4.5
      )
      from public.ratings r
      where r.teacher_id = t.id
    )
  where t.id = coalesce(new.teacher_id, old.teacher_id);
  return null;
end;
$function$;

-- Create trigger for rating updates
DROP TRIGGER IF EXISTS update_teacher_rating_trigger ON public.ratings;
CREATE TRIGGER update_teacher_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_teacher_rating();