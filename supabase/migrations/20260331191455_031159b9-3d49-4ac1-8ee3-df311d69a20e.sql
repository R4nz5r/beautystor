CREATE POLICY "Authenticated can select incomplete orders"
ON public.incomplete_orders FOR SELECT
TO authenticated
USING (true);