
CREATE TABLE public.incomplete_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  customer_name text,
  phone text,
  address text,
  city text,
  payment_method text,
  cart_items jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX incomplete_orders_session_id_idx ON public.incomplete_orders (session_id);

ALTER TABLE public.incomplete_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert incomplete orders" ON public.incomplete_orders FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update incomplete orders" ON public.incomplete_orders FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete incomplete orders" ON public.incomplete_orders FOR DELETE TO anon, authenticated USING (true);
CREATE POLICY "Admins can view incomplete orders" ON public.incomplete_orders FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
