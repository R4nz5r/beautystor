
-- Remove overly-permissive anon SELECT on orders
DROP POLICY IF EXISTS "Anon can view orders by id" ON public.orders;

-- Secure RPC to fetch a single order summary + items by id (unguessable UUID).
-- Returns only non-sensitive fields safe to display on the order confirmation page.
CREATE OR REPLACE FUNCTION public.get_order_confirmation(_order_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'id', o.id,
    'total', o.total,
    'subtotal', o.subtotal,
    'discount', o.discount,
    'delivery_charge', o.delivery_charge,
    'status', o.status,
    'payment_method', o.payment_method,
    'payment_status', o.payment_status,
    'created_at', o.created_at,
    'items', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'product_name', oi.product_name,
        'quantity', oi.quantity,
        'price', oi.price
      ))
      FROM public.order_items oi
      WHERE oi.order_id = o.id
    ), '[]'::jsonb)
  )
  INTO result
  FROM public.orders o
  WHERE o.id = _order_id;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.get_order_confirmation(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_order_confirmation(uuid) TO anon, authenticated;
