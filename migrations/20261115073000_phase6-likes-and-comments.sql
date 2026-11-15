-- ====================================================================
-- WRITESPACE PHASE 6: LIKES, COMMENTS AND REPLIES SCHEMA
-- ====================================================================

-- 1. LIKES TABLE
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_post_user_like UNIQUE (post_id, user_id)
);

-- Performance Indexes for Likes
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON public.likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_created_at ON public.likes(created_at DESC);

-- Enable RLS for Likes
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public can view likes on published posts" ON public.likes;
DROP POLICY IF EXISTS "Users can like published posts" ON public.likes;
DROP POLICY IF EXISTS "Users can remove own like" ON public.likes;

-- SELECT policy: Public can read likes on published posts (or author on own posts)
CREATE POLICY "Public can view likes on published posts"
  ON public.likes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE posts.id = likes.post_id
        AND (posts.status = 'published' OR posts.author_id = auth.uid())
    )
  );

-- INSERT policy: Authenticated user can like published posts using their own user_id
CREATE POLICY "Users can like published posts"
  ON public.likes
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.posts
      WHERE posts.id = likes.post_id
        AND (posts.status = 'published' OR posts.author_id = auth.uid())
    )
  );

-- DELETE policy: Authenticated users can remove only their own likes
CREATE POLICY "Users can remove own like"
  ON public.likes
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL AND auth.uid() = user_id
  );


-- 2. COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(trim(content)) > 0 AND char_length(content) <= 3000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance Indexes for Comments
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at ASC);

-- Enable RLS for Comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public can view comments on published posts" ON public.comments;
DROP POLICY IF EXISTS "Users can comment on published posts" ON public.comments;
DROP POLICY IF EXISTS "Users can update own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;

-- SELECT policy: Public can view comments on published posts (or author on own posts)
CREATE POLICY "Public can view comments on published posts"
  ON public.comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE posts.id = comments.post_id
        AND (posts.status = 'published' OR posts.author_id = auth.uid())
    )
  );

-- INSERT policy: Authenticated user can comment on published posts
CREATE POLICY "Users can comment on published posts"
  ON public.comments
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.posts
      WHERE posts.id = comments.post_id
        AND (posts.status = 'published' OR posts.author_id = auth.uid())
    )
  );

-- UPDATE policy: Authenticated users can update only their own comments
CREATE POLICY "Users can update own comments"
  ON public.comments
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND auth.uid() = user_id
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND auth.uid() = user_id
  );

-- DELETE policy: Authenticated users can delete only their own comments
CREATE POLICY "Users can delete own comments"
  ON public.comments
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL AND auth.uid() = user_id
  );
