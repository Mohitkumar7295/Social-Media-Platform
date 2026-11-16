-- ====================================================================
-- WRITESPACE PHASE 9: NOTIFICATIONS SCHEMA & ROW LEVEL SECURITY
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('follow', 'like', 'comment', 'reply')),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT check_no_self_notification CHECK (recipient_id != actor_id)
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_created
    ON public.notifications (recipient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_unread
    ON public.notifications (recipient_id, is_read)
    WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_notifications_actor
    ON public.notifications (actor_id);

CREATE INDEX IF NOT EXISTS idx_notifications_post
    ON public.notifications (post_id);

CREATE INDEX IF NOT EXISTS idx_notifications_comment
    ON public.notifications (comment_id);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 1. SELECT: Users can only read notifications intended for them
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
    ON public.notifications
    FOR SELECT
    USING (auth.uid() = recipient_id);

-- 2. UPDATE: Users can only mark/update their own notifications
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
    ON public.notifications
    FOR UPDATE
    USING (auth.uid() = recipient_id)
    WITH CHECK (auth.uid() = recipient_id);

-- 3. DELETE: Users can delete their own notifications
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications"
    ON public.notifications
    FOR DELETE
    USING (auth.uid() = recipient_id);

-- 4. INSERT: Users can insert notifications only when acting as themselves and not self-notifying
DROP POLICY IF EXISTS "Users can insert notifications as actor" ON public.notifications;
CREATE POLICY "Users can insert notifications as actor"
    ON public.notifications
    FOR INSERT
    WITH CHECK (auth.uid() = actor_id AND actor_id != recipient_id);
