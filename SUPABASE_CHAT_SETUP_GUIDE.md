# Supabase Chat System Setup Guide

## Overview
This guide helps you set up the database tables and Row Level Security (RLS) policies for the chat system in Supabase.

## Tables Created

### 1. **chats**
Stores chat room information (private or group)
- `id` - Unique identifier
- `type` - 'private' or 'group'
- `name` - Chat name
- `created_by` - User who created the chat
- `fid` - Facility ID the chat belongs to
- `last_message` - Latest message content
- `last_message_time` - Timestamp of last message
- `last_message_sender` - User ID of last message sender
- `is_archived` - Soft delete flag
- Indexed for fast queries

### 2. **chat_participants**
Tracks which users are in which chats
- `id` - Unique identifier
- `chat_id` - Reference to chat
- `user_id` - Reference to user
- `joined_at` - When user joined
- `last_read_message_id` - Last message user read
- `last_read_at` - When user last read messages
- `is_muted` - If user muted notifications
- Prevents duplicate entries (UNIQUE constraint)

### 3. **messages**
Stores individual chat messages
- `id` - Unique identifier
- `chat_id` - Reference to chat
- `sender_id` - Reference to sending user
- `content` - Message text
- `message_type` - 'text', 'file', or 'system'
- `is_deleted` - Soft delete flag
- `deleted_at` & `deleted_by` - Track deletions
- Heavily indexed for performance

### 4. **file_attachments**
Stores information about shared files
- `id` - Unique identifier
- `message_id` - Reference to message
- `file_name` - Original filename
- `file_type` - MIME type
- `file_size` - Size in bytes
- `file_url` - URL to access file
- `storage_path` - Path in Supabase storage
- `uploaded_by` - User who uploaded

## Setup Instructions

### Step 1: Access Supabase SQL Editor

1. Log in to [Supabase Dashboard](https://supabase.com)
2. Select your project
3. Go to **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Copy and Run SQL

1. Open `supabase-chat-setup.sql`
2. Copy all the code
3. Paste into Supabase SQL Editor
4. Click **Run** button

The script will:
- Create all tables with proper indexes
- Set up Row Level Security policies
- Create helper functions
- Add automatic timestamp management

### Step 3: Verify Setup

Run these queries to verify tables were created:

```sql
-- List all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check chat_participants for integrity
SELECT * FROM chat_participants LIMIT 5;

-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('chats', 'messages', 'chat_participants', 'file_attachments');
```

## How Access Control Works

### RLS Policies

**Patients can:**
- See chats with health workers from their facility
- Send messages in those chats
- See files shared in those chats

**Health Workers can:**
- See chats with patients from their facility
- See chats with other health workers from their facility
- Send and receive messages
- Share files

**Admin can:**
- See all facility chats (depends on additional admin policy)
- Manage users and access

### Facility-Based Filtering

All access is automatically filtered by:
1. **facility_id** - User's facility matches chat's facility
2. **user_role** - Role determines who can chat with whom
3. **chat_participants** - User must be a participant

## Helper Functions

### 1. `create_private_chat(user1_id, user2_id, facility_id)`
Creates or retrieves existing private chat between two users

```sql
SELECT create_private_chat(
  'user1-uuid',
  'user2-uuid',
  'facility-uuid'
);
```

### 2. `create_group_chat(group_name, created_by_id, facility_id, participant_ids)`
Creates a group chat with multiple participants

```sql
SELECT create_group_chat(
  'Department Meeting',
  'creator-uuid',
  'facility-uuid',
  ARRAY['user1-uuid', 'user2-uuid', 'user3-uuid']::uuid[]
);
```

### 3. `get_unread_message_count(user_id)`
Returns count of unread messages for a user

```sql
SELECT get_unread_message_count(auth.uid());
```

## Storage Setup (Optional)

For file uploads to Supabase Storage:

### Create Storage Bucket

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-files', 'Chat Files', false)
ON CONFLICT DO NOTHING;
```

### Add Storage Policy

```sql
CREATE POLICY "Authenticated users can upload files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'chat-files'
    AND auth.role() = 'authenticated'
  );
```

## Database Schema Diagram

```
users (auth.users)
├── id (PK)
├── facility_id
└── role

chats
├── id (PK)
├── type (private|group)
├── created_by (FK → users)
└── facility_id

chat_participants
├── id (PK)
├── chat_id (FK → chats)
├── user_id (FK → users)
└── UNIQUE(chat_id, user_id)

messages
├── id (PK)
├── chat_id (FK → chats)
├── sender_id (FK → users)
└── message_type (text|file|system)

file_attachments
├── id (PK)
├── message_id (FK → messages)
└── uploaded_by (FK → users)
```

## Integration with Frontend

Update `chat-system.js` to use Supabase instead of localStorage:

### Load Chats
```javascript
async loadChats() {
  const { data, error } = await supabase
    .from('chat_participants')
    .select('chat:chats(*)')
    .eq('user_id', this.currentUser.id)
    .order('created_at', { ascending: false });
  
  if (error) console.error(error);
  this.chats = data?.map(cp => cp.chat) || [];
}
```

### Send Message
```javascript
async sendMessage() {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      chat_id: this.currentChat.id,
      sender_id: this.currentUser.id,
      content: message,
      message_type: 'text'
    });
  
  if (error) console.error(error);
}
```

### Load Messages
```javascript
async loadMessages(chatId) {
  const { data, error } = await supabase
    .from('messages')
    .select('*, file_attachments(*)')
    .eq('chat_id', chatId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true });
  
  if (error) console.error(error);
  return data || [];
}
```

## Indexes for Performance

Created indexes on:
- `facility_id` - Filter by facility
- `chat_id` - Get messages/participants for a chat
- `user_id` - Get chats/messages for a user
- `created_at` - Sort by time
- Composite `(chat_id, created_at)` - Get recent messages efficiently

## Backup and Restore

### Backup Tables
```bash
pg_dump -h localhost -U postgres -d your_db -t public.chats -t public.messages > backup.sql
```

### Restore
```bash
psql -h localhost -U postgres -d your_db < backup.sql
```

## Troubleshooting

### Messages not appearing?
- Check user is in `chat_participants`
- Verify `is_deleted = FALSE`
- Check RLS policy allows access

### Can't create chats?
- Ensure `auth.uid()` is set (user logged in)
- Verify `facility_id` matches user's facility
- Check `created_by` is set to current user

### File upload fails?
- Verify file type in allowed list
- Check storage bucket exists
- Ensure authenticated user
- Check file size limit

### Performance issues?
- Check indexes are created
- Review message count per chat
- Consider archiving old chats
- Monitor storage usage

## Security Notes

1. **RLS is enabled** - All access controlled by policies
2. **Soft deletes** - Messages kept for audit trail
3. **Facility isolation** - Users only see their facility data
4. **Role-based** - Different access based on user role
5. **Encryption** - Use Supabase SSL connections

## Next Steps

1. Run the SQL setup script
2. Test the helper functions
3. Update frontend to use Supabase client
4. Implement real-time subscriptions (optional)
5. Add storage for file uploads
6. Monitor usage and performance

## Support

For Supabase help:
- [Supabase Docs](https://supabase.com/docs)
- [Supabase Community](https://supabase.com/community)
- [GitHub Issues](https://github.com/supabase/supabase)
