-- Create profiles table and related user tables with RLS and location fields
-- Enable required extension for UUID if not present
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  user_type TEXT CHECK (user_type IN ('student','teacher','admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Students table
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  education_level TEXT,
  preferred_lesson_type TEXT CHECK (preferred_lesson_type IN ('individual','group')),
  location_address TEXT,
  location_city TEXT,
  guardian_name TEXT,
  guardian_email TEXT,
  guardian_phone TEXT,
  subject_selections TEXT[],
  residence_lat DOUBLE PRECISION,
  residence_lng DOUBLE PRECISION,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Teachers table
CREATE TABLE IF NOT EXISTS public.teachers (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  qualifications TEXT[],
  subjects TEXT[],
  curriculum TEXT,
  experience_years INT,
  location_address TEXT,
  location_city TEXT,
  lesson_location TEXT,
  business_lat DOUBLE PRECISION,
  business_lng DOUBLE PRECISION,
  status TEXT DEFAULT 'pending',
  approved BOOLEAN NOT NULL DEFAULT false,
  rating NUMERIC DEFAULT 4.5,
  price_usd NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

-- Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE RESTRICT,
  subject TEXT,
  education_level TEXT,
  lesson_type TEXT CHECK (lesson_type IN ('individual','group')),
  duration TEXT CHECK (duration IN ('monthly','yearly')),
  price_usd NUMERIC,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trg_profiles_updated
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_students_updated
BEFORE UPDATE ON public.students
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_teachers_updated
BEFORE UPDATE ON public.teachers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_subscriptions_updated
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Handle new auth users by inserting a profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, user_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name',''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone',''),
    COALESCE(NEW.raw_user_meta_data->>'user_type','student')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- RLS Policies
-- profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

-- students
CREATE POLICY "Students can view their own data" ON public.students
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Students can insert their data" ON public.students
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Students can update their data" ON public.students
FOR UPDATE USING (auth.uid() = id);

-- teachers
CREATE POLICY "Anyone can view approved teachers" ON public.teachers
FOR SELECT USING (approved = true OR auth.uid() = id);

CREATE POLICY "Teachers can insert their data" ON public.teachers
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Teachers can update their data" ON public.teachers
FOR UPDATE USING (auth.uid() = id);

-- subscriptions
CREATE POLICY "Students and teachers can view relevant subscriptions" ON public.subscriptions
FOR SELECT USING (auth.uid() = student_id OR auth.uid() = teacher_id);

CREATE POLICY "Students can create subscriptions" ON public.subscriptions
FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students/Teachers can update relevant subscriptions" ON public.subscriptions
FOR UPDATE USING (auth.uid() = student_id OR auth.uid() = teacher_id);

-- Indexes for location lookups
CREATE INDEX IF NOT EXISTS idx_students_residence_coords ON public.students(residence_lat, residence_lng);
CREATE INDEX IF NOT EXISTS idx_teachers_business_coords ON public.teachers(business_lat, business_lng);
