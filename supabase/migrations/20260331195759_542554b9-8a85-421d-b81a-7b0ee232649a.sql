-- Add featured column to reviews
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false;

-- Chat conversations table
CREATE TABLE public.chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_name text NOT NULL,
  visitor_email text,
  session_id text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert chat conversations" ON public.chat_conversations
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Anyone can view own chat" ON public.chat_conversations
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Anyone can update own chat" ON public.chat_conversations
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admins can manage chats" ON public.chat_conversations
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Chat messages table
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  sender_type text NOT NULL DEFAULT 'user',
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert chat messages" ON public.chat_messages
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Anyone can view chat messages" ON public.chat_messages
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can manage messages" ON public.chat_messages
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_conversations;