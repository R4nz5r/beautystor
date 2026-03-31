
CREATE TABLE public.coupons (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric NOT NULL DEFAULT 0,
  min_order_amount numeric NOT NULL DEFAULT 0,
  max_uses integer DEFAULT NULL,
  used_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  expires_at timestamp with time zone DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage coupons" ON public.coupons FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can view active coupons by code" ON public.coupons FOR SELECT TO anon, authenticated USING (is_active = true);
