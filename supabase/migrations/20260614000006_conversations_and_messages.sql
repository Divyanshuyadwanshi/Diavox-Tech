-- Migration: 20260614000006_conversations_and_messages.sql
-- Description: Creates conversations, messages, team_groups, project_groups, team_messages, and private_messages tables.

-- GENERAL GROUP CHATS OR TOPICS
CREATE TABLE IF NOT EXISTS public.conversations (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255),
  is_group BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LEGACY GLOBAL GENERAL CHAT STREAM
CREATE TABLE IF NOT EXISTS public.messages (
  id VARCHAR(255) PRIMARY KEY,
  sender_id VARCHAR(255) REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_name VARCHAR(255) NOT NULL,
  sender_role VARCHAR(100) NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TEAM DEPARTMENT LOUNGES / SPECIFIC CHANT ROOMS
CREATE TABLE IF NOT EXISTS public.team_groups (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CHANNELS TARGETED AT SECURE ONGOING INDIVIDUAL PROJECTS
CREATE TABLE IF NOT EXISTS public.project_groups (
  id VARCHAR(255) PRIMARY KEY,
  project_id VARCHAR(255) REFERENCES public.projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  assigned_members TEXT[], -- Array of Profile IDs
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MULTI-CHANNEL TEAM CHAT FEED (REPLACES LOBBY IN PRODUCTION SYSTEM)
CREATE TABLE IF NOT EXISTS public.team_messages (
  id VARCHAR(255) PRIMARY KEY,
  group_id VARCHAR(255) NOT NULL, -- references team_groups or project_groups ID
  sender_id VARCHAR(255) REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_name VARCHAR(255) NOT NULL,
  sender_role VARCHAR(150),
  text TEXT NOT NULL,
  file_url TEXT,
  file_name TEXT,
  is_image BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DIRECT PRIVATE MESSAGING SYSTEM
CREATE TABLE IF NOT EXISTS public.private_messages (
  id VARCHAR(255) PRIMARY KEY,
  sender_id VARCHAR(255) REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_name VARCHAR(255) NOT NULL,
  recipient_id VARCHAR(255) REFERENCES public.profiles(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_team_messages_group ON public.team_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_team_messages_sender ON public.team_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_private_messages_pair ON public.private_messages(sender_id, recipient_id);
CREATE INDEX IF NOT EXISTS idx_private_messages_recipient ON public.private_messages(recipient_id);
