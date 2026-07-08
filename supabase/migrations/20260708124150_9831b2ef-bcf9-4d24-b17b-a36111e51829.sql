
CREATE OR REPLACE FUNCTION public.current_session_id()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(
    (current_setting('request.headers', true)::json ->> 'x-session-id'),
    ''
  );
$$;

DROP POLICY IF EXISTS "Anyone can view own chat" ON public.chat_conversations;
DROP POLICY IF EXISTS "Anyone can update own chat" ON public.chat_conversations;

CREATE POLICY "Session can view own chat"
ON public.chat_conversations FOR SELECT TO anon, authenticated
USING (session_id = public.current_session_id());

CREATE POLICY "Session can update own chat"
ON public.chat_conversations FOR UPDATE TO anon, authenticated
USING (session_id = public.current_session_id())
WITH CHECK (session_id = public.current_session_id());

DROP POLICY IF EXISTS "Anyone can view chat messages" ON public.chat_messages;
CREATE POLICY "Session can view own chat messages"
ON public.chat_messages FOR SELECT TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.chat_conversations c
    WHERE c.id = chat_messages.conversation_id
      AND c.session_id = public.current_session_id()
  )
);

DROP POLICY IF EXISTS "Anyone can insert chat messages" ON public.chat_messages;
CREATE POLICY "Session can insert own chat messages"
ON public.chat_messages FOR INSERT TO anon, authenticated
WITH CHECK (
  sender_type = 'user'
  AND EXISTS (
    SELECT 1 FROM public.chat_conversations c
    WHERE c.id = chat_messages.conversation_id
      AND c.session_id = public.current_session_id()
  )
);

DROP POLICY IF EXISTS "Anon can select own session incomplete orders" ON public.incomplete_orders;
DROP POLICY IF EXISTS "Authenticated can select incomplete orders" ON public.incomplete_orders;
DROP POLICY IF EXISTS "Anyone can update incomplete orders" ON public.incomplete_orders;
DROP POLICY IF EXISTS "Anyone can delete incomplete orders" ON public.incomplete_orders;
DROP POLICY IF EXISTS "Anyone can insert incomplete orders" ON public.incomplete_orders;

CREATE POLICY "Session can select own incomplete order"
ON public.incomplete_orders FOR SELECT TO anon, authenticated
USING (session_id = public.current_session_id());

CREATE POLICY "Session can insert own incomplete order"
ON public.incomplete_orders FOR INSERT TO anon, authenticated
WITH CHECK (session_id = public.current_session_id());

CREATE POLICY "Session can update own incomplete order"
ON public.incomplete_orders FOR UPDATE TO anon, authenticated
USING (session_id = public.current_session_id())
WITH CHECK (session_id = public.current_session_id());

CREATE POLICY "Session can delete own incomplete order"
ON public.incomplete_orders FOR DELETE TO anon, authenticated
USING (session_id = public.current_session_id());

DROP POLICY IF EXISTS "Anyone can create reviews" ON public.reviews;
CREATE POLICY "Anyone can create reviews"
ON public.reviews FOR INSERT TO anon, authenticated
WITH CHECK (user_id IS NULL OR user_id = auth.uid());

DROP POLICY IF EXISTS "Anyone can view banners" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
