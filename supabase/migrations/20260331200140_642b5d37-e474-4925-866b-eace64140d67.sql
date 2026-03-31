-- Allow anon users to also submit reviews
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.reviews;
CREATE POLICY "Anyone can create reviews" ON public.reviews
  FOR INSERT TO anon, authenticated WITH CHECK (true);