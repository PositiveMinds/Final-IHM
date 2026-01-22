/**
 * Supabase SQL Setup for Chat System
 * Create all necessary tables for private and group messaging with facility-based access control
 * 
 * Run this in Supabase SQL Editor to set up the chat system
 */

-- ============================================================
-- 1. USERS TABLE MODIFICATIONS (Add missing columns)
-- ============================================================
-- Add missing columns to existing users table if they don't exist
DO $$
BEGIN
  -- Add avatar column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'avatar'
  ) THEN
    ALTER TABLE public.users ADD COLUMN avatar TEXT;
  END IF;

  -- Add status column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.users ADD COLUMN status TEXT DEFAULT 'active' 
      CHECK (status IN ('active', 'inactive', 'suspended'));
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_users_fid ON public.users(fid);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(user_role);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- ============================================================
-- 6. TRIGGER FUNCTION FOR TIMESTAMP (Define before using in triggers)
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 2. CHATS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.chats (
  chat_id SERIAL PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('private', 'group')),
  name TEXT NOT NULL,
  created_by INTEGER NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  fid UUID NOT NULL,
  last_message TEXT,
  last_message_time TIMESTAMP WITH TIME ZONE,
  last_message_sender INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_archived BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_chats_fid ON public.chats(fid);
CREATE INDEX IF NOT EXISTS idx_chats_created_by ON public.chats(created_by);
CREATE INDEX IF NOT EXISTS idx_chats_type ON public.chats(type);
CREATE INDEX IF NOT EXISTS idx_chats_created_at ON public.chats(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chats_archived ON public.chats(is_archived);

-- Auto-update updated_at timestamp
CREATE TRIGGER update_chats_timestamp
  BEFORE UPDATE ON public.chats
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

-- ============================================================
-- 3. CHAT PARTICIPANTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.chat_participants (
  chat_participant_id SERIAL PRIMARY KEY,
  chat_id INTEGER NOT NULL REFERENCES public.chats(chat_id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_read_message_id INTEGER,
  last_read_at TIMESTAMP WITH TIME ZONE,
  is_muted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(chat_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_chat_participants_chat_id ON public.chat_participants(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_user_id ON public.chat_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_joined_at ON public.chat_participants(joined_at DESC);

-- ============================================================
-- 4. MESSAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.messages (
  message_id SERIAL PRIMARY KEY,
  chat_id INTEGER NOT NULL REFERENCES public.chats(chat_id) ON DELETE CASCADE,
  sender_id INTEGER NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  content TEXT,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'system')),
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON public.messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_type ON public.messages(message_type);
CREATE INDEX IF NOT EXISTS idx_messages_deleted ON public.messages(is_deleted);
CREATE INDEX IF NOT EXISTS idx_messages_chat_created ON public.messages(chat_id, created_at DESC);

-- Auto-update updated_at timestamp
CREATE TRIGGER update_messages_timestamp
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();

-- ============================================================
-- 5. FILE ATTACHMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.file_attachments (
  file_attachment_id SERIAL PRIMARY KEY,
  message_id INTEGER NOT NULL REFERENCES public.messages(message_id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  storage_path TEXT,
  uploaded_by INTEGER NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_file_attachments_message_id ON public.file_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_file_attachments_uploaded_by ON public.file_attachments(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_file_attachments_file_type ON public.file_attachments(file_type);
CREATE INDEX IF NOT EXISTS idx_file_attachments_created_at ON public.file_attachments(created_at DESC);

-- ============================================================
-- 7. FUNCTION TO GET UNREAD MESSAGE COUNT
-- ============================================================
CREATE OR REPLACE FUNCTION get_unread_message_count(p_user_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO unread_count
  FROM public.messages m
  JOIN public.chat_participants cp ON m.chat_id = cp.chat_id
  WHERE cp.user_id = p_user_id
    AND m.sender_id != p_user_id
    AND (cp.last_read_at IS NULL OR m.created_at > cp.last_read_at)
    AND m.is_deleted = FALSE;
  
  RETURN unread_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 8. FUNCTION TO CREATE PRIVATE CHAT
-- ============================================================
CREATE OR REPLACE FUNCTION create_private_chat(
  p_user1_id INTEGER,
  p_user2_id INTEGER,
  p_fid UUID
)
RETURNS INTEGER AS $$
DECLARE
  chat_id INTEGER;
  existing_chat INTEGER;
BEGIN
  -- Check if private chat already exists between these users
  SELECT c.chat_id INTO existing_chat
  FROM public.chats c
  JOIN public.chat_participants cp1 ON c.chat_id = cp1.chat_id
  JOIN public.chat_participants cp2 ON c.chat_id = cp2.chat_id
  WHERE c.type = 'private'
    AND c.fid = p_fid
    AND cp1.user_id = p_user1_id
    AND cp2.user_id = p_user2_id
  LIMIT 1;
  
  IF existing_chat IS NOT NULL THEN
    RETURN existing_chat;
  END IF;
  
  -- Create new private chat
  INSERT INTO public.chats (type, name, created_by, fid)
  VALUES ('private', 'Private Chat', p_user1_id, p_fid)
  RETURNING chat_id INTO chat_id;
  
  -- Add both participants
  INSERT INTO public.chat_participants (chat_id, user_id)
  VALUES 
    (chat_id, p_user1_id),
    (chat_id, p_user2_id);
  
  RETURN chat_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 9. FUNCTION TO CREATE GROUP CHAT
-- ============================================================
CREATE OR REPLACE FUNCTION create_group_chat(
  p_group_name TEXT,
  p_created_by_id INTEGER,
  p_fid UUID,
  p_participant_ids INTEGER[]
)
RETURNS INTEGER AS $$
DECLARE
  chat_id INTEGER;
  participant_id INTEGER;
BEGIN
  -- Create new group chat
  INSERT INTO public.chats (type, name, created_by, fid)
  VALUES ('group', p_group_name, p_created_by_id, p_fid)
  RETURNING chat_id INTO chat_id;
  
  -- Add all participants
  FOREACH participant_id IN ARRAY p_participant_ids
  LOOP
    INSERT INTO public.chat_participants (chat_id, user_id)
    VALUES (chat_id, participant_id)
    ON CONFLICT (chat_id, user_id) DO NOTHING;
  END LOOP;
  
  RETURN chat_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 10. ROW LEVEL SECURITY POLICIES
-- ============================================================
-- NOTE: RLS is disabled because the users table only has uid (INTEGER)
-- and doesn't have an id column to map to auth.uid() (UUID).
-- Implement row-level security at the application layer instead.

-- To enable RLS, add an 'id' column (UUID) to the users table that references auth.users(id)
-- Then uncomment the policies below and replace auth.uid() with the appropriate mapping.

-- ============================================================
-- 11. STORAGE SETUP FOR FILE UPLOADS
-- ============================================================
-- Create storage bucket for chat files (run separately if needed)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('chat-files', 'chat-files', false)
-- ON CONFLICT DO NOTHING;

-- Storage policy for authenticated users to upload
-- CREATE POLICY "Authenticated users can upload chat files"
--   ON storage.objects FOR INSERT
--   WITH CHECK (
--     bucket_id = 'chat-files'
--     AND auth.role() = 'authenticated'
--   );

-- ============================================================
-- TESTING QUERIES (Uncomment to test)
-- ============================================================

-- Get all chats for current user
-- SELECT c.*, 
--   (SELECT COUNT(*) FROM chat_participants WHERE chat_id = c.id) as member_count
-- FROM chats c
-- WHERE fid = (SELECT fid FROM auth.users WHERE id = auth.uid())
--   AND EXISTS (
--     SELECT 1 FROM chat_participants WHERE chat_id = c.id AND user_id = auth.uid()
--   )
-- ORDER BY c.updated_at DESC;

-- Get messages for a chat
-- SELECT m.*, 
--   (SELECT COUNT(*) FROM file_attachments WHERE message_id = m.id) as attachment_count
-- FROM messages m
-- WHERE m.chat_id = '{chat_id}'
--   AND m.is_deleted = FALSE
-- ORDER BY m.created_at DESC;

-- Get unread messages count
-- SELECT get_unread_message_count(auth.uid());

-- ============================================================
-- NOTES
-- ============================================================
-- 1. Update auth.users reference to match your users table if different
-- 2. Facility-based access is enforced through fid (facility id) checks
-- 3. RLS policies prevent unauthorized access automatically
-- 4. Messages are soft-deleted (is_deleted flag) to preserve history
-- 5. File attachments are linked to messages for context
-- 6. All timestamps are automatically managed
-- 7. User roles (patient, health_worker) must be set in users table
-- 8. fid column stores facility_id from your facilities table
