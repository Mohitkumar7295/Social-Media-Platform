-- ====================================================================
-- WRITESPACE PHASE 4: POSTS & ARTICLES SCHEMA
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  subtitle VARCHAR(300),
  slug VARCHAR(250) UNIQUE NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  excerpt TEXT,
  cover_image_url TEXT,
  cover_image_key TEXT,
  category VARCHAR(50) DEFAULT 'General',
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  reading_time INTEGER DEFAULT 1,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status_published_at ON public.posts(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category);

-- Enable Row Level Security
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 1. SELECT policy:
-- Public can view published articles; authenticated authors can view all their own posts (drafts and published)
CREATE POLICY "Public can view published posts, authors can view own"
  ON public.posts
  FOR SELECT
  USING (
    status = 'published' 
    OR (auth.uid() IS NOT NULL AND auth.uid() = author_id)
  );

-- 2. INSERT policy:
-- Authenticated users can insert posts only where author_id matches their authenticated auth.uid()
CREATE POLICY "Authors can create own posts"
  ON public.posts
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND auth.uid() = author_id
  );

-- 3. UPDATE policy:
-- Authenticated authors can update only their own posts
CREATE POLICY "Authors can update own posts"
  ON public.posts
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND auth.uid() = author_id
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND auth.uid() = author_id
  );

-- 4. DELETE policy:
-- Authenticated authors can delete only their own posts
CREATE POLICY "Authors can delete own posts"
  ON public.posts
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL AND auth.uid() = author_id
  );
