-- Fix the admin account issue
UPDATE profiles 
SET user_type = 'admin' 
WHERE email = 'luckilyimat@gmail.com';

-- Also ensure the is_admin function works correctly by updating it
CREATE OR REPLACE FUNCTION public.is_admin(_uid uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1 from public.profiles p
    where p.id = _uid
      and (p.user_type = 'admin' or p.email = 'luckilyimat@gmail.com')
  );
$function$