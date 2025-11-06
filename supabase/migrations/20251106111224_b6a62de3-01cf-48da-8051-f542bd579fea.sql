-- Allow students to view other student profiles (basic info only)
-- This enables student networking and community features
CREATE POLICY "Students can view other student profiles"
ON students FOR SELECT
USING (true);

-- Allow students to view other profiles (basic info)
CREATE POLICY "Users can view other profiles"
ON profiles FOR SELECT
USING (true);