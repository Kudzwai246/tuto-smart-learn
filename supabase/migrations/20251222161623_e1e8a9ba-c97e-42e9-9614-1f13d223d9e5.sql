-- Add RLS policies for admins to manage teachers table

-- Allow admins to view ALL teachers (including pending ones)
CREATE POLICY "Admins can view all teachers"
ON public.teachers
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Allow admins to update any teacher record (for approving/rejecting)
CREATE POLICY "Admins can update all teachers"
ON public.teachers
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));