
-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  user_type TEXT CHECK (user_type IN ('student', 'teacher', 'admin')) DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, user_type)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'user_type'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create students table
CREATE TABLE public.students (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  education_level TEXT CHECK (education_level IN (
    'primary_grade_1', 'primary_grade_2', 'primary_grade_3', 'primary_grade_4', 
    'primary_grade_5', 'primary_grade_6', 'primary_grade_7',
    'olevel_form_1', 'olevel_form_2', 'olevel_form_3', 'olevel_form_4',
    'alevel_form_5_arts', 'alevel_form_5_sciences', 'alevel_form_5_commercials',
    'alevel_form_6_arts', 'alevel_form_6_sciences', 'alevel_form_6_commercials'
  )),
  preferred_lesson_type TEXT CHECK (preferred_lesson_type IN ('individual', 'group')),
  location_address TEXT,
  location_city TEXT,
  guardian_name TEXT,
  guardian_email TEXT,
  guardian_phone TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on students
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Create policies for students
CREATE POLICY "Users can view own student profile" ON public.students
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own student profile" ON public.students
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own student profile" ON public.students
  FOR UPDATE USING (auth.uid() = id);

-- Create teachers table
CREATE TABLE public.teachers (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  qualifications TEXT[],
  subjects TEXT[],
  curriculum TEXT,
  experience_years INTEGER,
  location_address TEXT,
  location_city TEXT,
  lesson_location TEXT,
  approved BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3,2) DEFAULT 0.0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on teachers
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

-- Create policies for teachers
CREATE POLICY "Users can view own teacher profile" ON public.teachers
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own teacher profile" ON public.teachers
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own teacher profile" ON public.teachers
  FOR UPDATE USING (auth.uid() = id);

-- Admin can view all teachers
CREATE POLICY "Admins can view all teachers" ON public.teachers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Admin can update all teachers
CREATE POLICY "Admins can update all teachers" ON public.teachers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  lesson_type TEXT CHECK (lesson_type IN ('individual', 'group')),
  education_level TEXT CHECK (education_level IN (
    'primary_grade_1', 'primary_grade_2', 'primary_grade_3', 'primary_grade_4', 
    'primary_grade_5', 'primary_grade_6', 'primary_grade_7',
    'olevel_form_1', 'olevel_form_2', 'olevel_form_3', 'olevel_form_4',
    'alevel_form_5_arts', 'alevel_form_5_sciences', 'alevel_form_5_commercials',
    'alevel_form_6_arts', 'alevel_form_6_sciences', 'alevel_form_6_commercials'
  )),
  price_usd DECIMAL(10,2),
  duration TEXT CHECK (duration IN ('monthly', 'yearly')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'cancelled')),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for subscriptions
CREATE POLICY "Students can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Teachers can view their subscriptions" ON public.subscriptions
  FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Create admin settings table
CREATE TABLE public.admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert pricing plans
INSERT INTO public.admin_settings (setting_key, setting_value) VALUES 
('pricing_plans', '{
  "primary_grade_1": {"individual": {"monthly": 20, "yearly": 200}, "group": {"monthly": 4, "yearly": 40}},
  "primary_grade_2": {"individual": {"monthly": 20, "yearly": 200}, "group": {"monthly": 4, "yearly": 40}},
  "primary_grade_3": {"individual": {"monthly": 22, "yearly": 220}, "group": {"monthly": 4.5, "yearly": 45}},
  "primary_grade_4": {"individual": {"monthly": 22, "yearly": 220}, "group": {"monthly": 4.5, "yearly": 45}},
  "primary_grade_5": {"individual": {"monthly": 25, "yearly": 250}, "group": {"monthly": 5, "yearly": 50}},
  "primary_grade_6": {"individual": {"monthly": 25, "yearly": 250}, "group": {"monthly": 5, "yearly": 50}},
  "primary_grade_7": {"individual": {"monthly": 28, "yearly": 280}, "group": {"monthly": 5.5, "yearly": 55}},
  "olevel_form_1": {"individual": {"monthly": 35, "yearly": 350}, "group": {"monthly": 6, "yearly": 60}},
  "olevel_form_2": {"individual": {"monthly": 35, "yearly": 350}, "group": {"monthly": 6, "yearly": 60}},
  "olevel_form_3": {"individual": {"monthly": 40, "yearly": 400}, "group": {"monthly": 7, "yearly": 70}},
  "olevel_form_4": {"individual": {"monthly": 45, "yearly": 450}, "group": {"monthly": 8, "yearly": 80}},
  "alevel_form_5_arts": {"individual": {"monthly": 50, "yearly": 500}, "group": {"monthly": 10, "yearly": 100}},
  "alevel_form_5_sciences": {"individual": {"monthly": 55, "yearly": 550}, "group": {"monthly": 11, "yearly": 110}},
  "alevel_form_5_commercials": {"individual": {"monthly": 50, "yearly": 500}, "group": {"monthly": 10, "yearly": 100}},
  "alevel_form_6_arts": {"individual": {"monthly": 55, "yearly": 550}, "group": {"monthly": 11, "yearly": 110}},
  "alevel_form_6_sciences": {"individual": {"monthly": 60, "yearly": 600}, "group": {"monthly": 12, "yearly": 120}},
  "alevel_form_6_commercials": {"individual": {"monthly": 55, "yearly": 550}, "group": {"monthly": 11, "yearly": 110}}
}');

-- Create function to make admin
CREATE OR REPLACE FUNCTION public.make_admin(admin_email TEXT)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles 
  SET user_type = 'admin' 
  WHERE email = admin_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
