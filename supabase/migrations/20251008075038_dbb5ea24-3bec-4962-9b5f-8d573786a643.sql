-- ==========================================
-- TUTO LIBRARY SYSTEM - Complete Database Setup
-- ==========================================

-- Create storage buckets for library content
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('library-videos', 'library-videos', false, 524288000, ARRAY['video/mp4', 'video/webm', 'video/quicktime']),
  ('library-notes', 'library-notes', false, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'])
ON CONFLICT (id) DO NOTHING;

-- Create library_videos table
CREATE TABLE IF NOT EXISTS public.library_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uploader_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  thumbnail_path TEXT,
  education_level TEXT NOT NULL,
  subject TEXT NOT NULL,
  form TEXT,
  duration_seconds INTEGER,
  file_size_bytes BIGINT,
  view_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create library_notes table
CREATE TABLE IF NOT EXISTS public.library_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uploader_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  education_level TEXT NOT NULL,
  subject TEXT NOT NULL,
  form TEXT,
  file_type TEXT NOT NULL,
  file_size_bytes BIGINT,
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create library_views table for tracking views
CREATE TABLE IF NOT EXISTS public.library_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'note')),
  content_id UUID NOT NULL,
  view_duration_seconds INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create content_earnings table
CREATE TABLE IF NOT EXISTS public.content_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'note')),
  content_id UUID NOT NULL,
  total_views INTEGER DEFAULT 0,
  total_earnings_usd NUMERIC(10,2) DEFAULT 0.00,
  last_calculated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(creator_id, content_type, content_id)
);

-- Enable RLS on all tables
ALTER TABLE public.library_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_earnings ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- RLS POLICIES - library_videos
-- ==========================================

-- Anyone can view approved videos (for browsing catalog)
CREATE POLICY "Anyone can view approved videos"
  ON public.library_videos FOR SELECT
  USING (status = 'approved');

-- Teachers can insert their own videos
CREATE POLICY "Teachers can upload videos"
  ON public.library_videos FOR INSERT
  WITH CHECK (
    auth.uid() = uploader_id AND
    EXISTS (SELECT 1 FROM public.teachers WHERE id = auth.uid())
  );

-- Uploaders can update their own pending videos
CREATE POLICY "Uploaders can update own pending videos"
  ON public.library_videos FOR UPDATE
  USING (auth.uid() = uploader_id AND status = 'pending');

-- Uploaders can view their own videos
CREATE POLICY "Uploaders can view own videos"
  ON public.library_videos FOR SELECT
  USING (auth.uid() = uploader_id);

-- ==========================================
-- RLS POLICIES - library_notes
-- ==========================================

-- Anyone can view approved notes (for browsing catalog)
CREATE POLICY "Anyone can view approved notes"
  ON public.library_notes FOR SELECT
  USING (status = 'approved');

-- Any authenticated user can upload notes
CREATE POLICY "Authenticated users can upload notes"
  ON public.library_notes FOR INSERT
  WITH CHECK (auth.uid() = uploader_id);

-- Uploaders can update their own pending notes
CREATE POLICY "Uploaders can update own pending notes"
  ON public.library_notes FOR UPDATE
  USING (auth.uid() = uploader_id AND status = 'pending');

-- Uploaders can view their own notes
CREATE POLICY "Uploaders can view own notes"
  ON public.library_notes FOR SELECT
  USING (auth.uid() = uploader_id);

-- ==========================================
-- RLS POLICIES - library_views
-- ==========================================

-- Subscribed students can create view records
CREATE POLICY "Subscribed students can create views"
  ON public.library_views FOR INSERT
  WITH CHECK (
    auth.uid() = viewer_id AND
    EXISTS (
      SELECT 1 FROM public.subscriptions 
      WHERE student_id = auth.uid() AND status = 'active'
    )
  );

-- Users can view their own viewing history
CREATE POLICY "Users can view own viewing history"
  ON public.library_views FOR SELECT
  USING (auth.uid() = viewer_id);

-- ==========================================
-- RLS POLICIES - content_earnings
-- ==========================================

-- Creators can view their own earnings
CREATE POLICY "Creators can view own earnings"
  ON public.content_earnings FOR SELECT
  USING (auth.uid() = creator_id);

-- System can update earnings (will use service role)
CREATE POLICY "System can manage earnings"
  ON public.content_earnings FOR ALL
  USING (true);

-- ==========================================
-- STORAGE POLICIES - library-videos
-- ==========================================

-- Teachers can upload videos
CREATE POLICY "Teachers can upload videos to storage"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'library-videos' AND
    auth.uid()::text = (storage.foldername(name))[1] AND
    EXISTS (SELECT 1 FROM public.teachers WHERE id = auth.uid())
  );

-- Uploaders can view their own videos
CREATE POLICY "Uploaders can view own videos in storage"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'library-videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Subscribed students can view approved videos
CREATE POLICY "Subscribed students can view approved videos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'library-videos' AND
    EXISTS (
      SELECT 1 FROM public.subscriptions 
      WHERE student_id = auth.uid() AND status = 'active'
    )
  );

-- ==========================================
-- STORAGE POLICIES - library-notes
-- ==========================================

-- Authenticated users can upload notes
CREATE POLICY "Authenticated users can upload notes to storage"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'library-notes' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Uploaders can view their own notes
CREATE POLICY "Uploaders can view own notes in storage"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'library-notes' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Subscribed students can view approved notes
CREATE POLICY "Subscribed students can view approved notes"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'library-notes' AND
    EXISTS (
      SELECT 1 FROM public.subscriptions 
      WHERE student_id = auth.uid() AND status = 'active'
    )
  );

-- ==========================================
-- FUNCTIONS FOR EARNINGS CALCULATION
-- ==========================================

-- Function to calculate and update video earnings
CREATE OR REPLACE FUNCTION public.calculate_video_earnings(_creator_id UUID, _video_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_views INTEGER;
  earnings NUMERIC(10,2);
BEGIN
  -- Get total views for the video
  SELECT COALESCE(view_count, 0) INTO total_views
  FROM public.library_videos
  WHERE id = _video_id AND uploader_id = _creator_id;
  
  -- Calculate earnings: $0.2 per 100 views
  earnings := (total_views / 100.0) * 0.2;
  
  -- Upsert into content_earnings
  INSERT INTO public.content_earnings (creator_id, content_type, content_id, total_views, total_earnings_usd, last_calculated_at)
  VALUES (_creator_id, 'video', _video_id, total_views, earnings, NOW())
  ON CONFLICT (creator_id, content_type, content_id)
  DO UPDATE SET 
    total_views = EXCLUDED.total_views,
    total_earnings_usd = EXCLUDED.total_earnings_usd,
    last_calculated_at = NOW(),
    updated_at = NOW();
  
  RETURN earnings;
END;
$$;

-- Function to calculate and update note earnings
CREATE OR REPLACE FUNCTION public.calculate_note_earnings(_creator_id UUID, _note_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_views INTEGER;
  earnings NUMERIC(10,2);
BEGIN
  -- Get total views for the note
  SELECT COALESCE(view_count, 0) INTO total_views
  FROM public.library_notes
  WHERE id = _note_id AND uploader_id = _creator_id;
  
  -- Calculate earnings: $0.2 per 1000 views
  earnings := (total_views / 1000.0) * 0.2;
  
  -- Upsert into content_earnings
  INSERT INTO public.content_earnings (creator_id, content_type, content_id, total_views, total_earnings_usd, last_calculated_at)
  VALUES (_creator_id, 'note', _note_id, total_views, earnings, NOW())
  ON CONFLICT (creator_id, content_type, content_id)
  DO UPDATE SET 
    total_views = EXCLUDED.total_views,
    total_earnings_usd = EXCLUDED.total_earnings_usd,
    last_calculated_at = NOW(),
    updated_at = NOW();
  
  RETURN earnings;
END;
$$;

-- Function to get total content earnings for a creator
CREATE OR REPLACE FUNCTION public.get_creator_total_earnings(_creator_id UUID)
RETURNS TABLE(
  total_video_earnings NUMERIC,
  total_note_earnings NUMERIC,
  total_earnings NUMERIC,
  video_count INTEGER,
  note_count INTEGER,
  total_views INTEGER
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COALESCE(SUM(CASE WHEN content_type = 'video' THEN total_earnings_usd ELSE 0 END), 0) as total_video_earnings,
    COALESCE(SUM(CASE WHEN content_type = 'note' THEN total_earnings_usd ELSE 0 END), 0) as total_note_earnings,
    COALESCE(SUM(total_earnings_usd), 0) as total_earnings,
    COUNT(CASE WHEN content_type = 'video' THEN 1 END)::INTEGER as video_count,
    COUNT(CASE WHEN content_type = 'note' THEN 1 END)::INTEGER as note_count,
    COALESCE(SUM(total_views), 0)::INTEGER as total_views
  FROM public.content_earnings
  WHERE creator_id = _creator_id;
$$;

-- ==========================================
-- TRIGGERS
-- ==========================================

-- Trigger to update updated_at on library_videos
CREATE TRIGGER update_library_videos_updated_at
  BEFORE UPDATE ON public.library_videos
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Trigger to update updated_at on library_notes
CREATE TRIGGER update_library_notes_updated_at
  BEFORE UPDATE ON public.library_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Trigger to update updated_at on content_earnings
CREATE TRIGGER update_content_earnings_updated_at
  BEFORE UPDATE ON public.content_earnings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_library_videos_uploader ON public.library_videos(uploader_id);
CREATE INDEX IF NOT EXISTS idx_library_videos_status ON public.library_videos(status);
CREATE INDEX IF NOT EXISTS idx_library_videos_subject ON public.library_videos(subject);
CREATE INDEX IF NOT EXISTS idx_library_videos_education_level ON public.library_videos(education_level);

CREATE INDEX IF NOT EXISTS idx_library_notes_uploader ON public.library_notes(uploader_id);
CREATE INDEX IF NOT EXISTS idx_library_notes_status ON public.library_notes(status);
CREATE INDEX IF NOT EXISTS idx_library_notes_subject ON public.library_notes(subject);
CREATE INDEX IF NOT EXISTS idx_library_notes_education_level ON public.library_notes(education_level);

CREATE INDEX IF NOT EXISTS idx_library_views_viewer ON public.library_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_library_views_content ON public.library_views(content_type, content_id);

CREATE INDEX IF NOT EXISTS idx_content_earnings_creator ON public.content_earnings(creator_id);
CREATE INDEX IF NOT EXISTS idx_content_earnings_content ON public.content_earnings(content_type, content_id);