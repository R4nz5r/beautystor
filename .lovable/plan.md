

## Plan: Full Payment Integration with UddoktaPay

### Summary
Remove the partial payment option, make online payment full amount, and integrate UddoktaPay payment gateway. Since this is a React+Vite project (not Next.js), server-side processing will use Supabase Edge Functions instead of API routes.

### Changes

**1. Update Edge Function secrets**
- Store `UDDOKTAPAY_API_KEY` = `E7qcUplhcoNkvZJWkkIFVe2gBBcWzuM1cOZCWC4V` and `UDDOKTAPAY_BASE_URL` = `https://beautystor.paymently.io/api` as Supabase secrets (for server-side option)

**2. Update `supabase/functions/process-payment/index.ts`** (server-side option)
- Update to use full payment amount instead of partial
- Fix the redirect/cancel URLs to use the app's published URL
- Update payment_status to `paid` on successful verification instead of `partial`
- Add `return_type: 'GET'` so invoice_id comes as query param

**3. Update `supabase/functions/payment-webhook/index.ts`**
- Update payment_status from `partial` to `paid` when COMPLETED

**4. Update `src/pages/Checkout.tsx`**
- Change "অনলাইন পেমেন্ট (আংশিক)" to "অনলাইন পেমেন্ট" with full payment description
- Remove the 10% partial payment calculation display
- Add payment processing logic:
  - **Server-side mode**: Call the `process-payment` edge function, get payment_url, redirect user
  - **Client-side mode**: Call UddoktaPay API directly from browser with the API key
- Add a toggle/config to choose client-side vs server-side (default: server-side)
- On form submit with online payment: create order → initiate payment → redirect to UddoktaPay

**5. Update `src/pages/OrderConfirmation.tsx`**
- On mount, check for `invoice_id` query param (from UddoktaPay redirect)
- If present, call verify-payment (via edge function or client-side) to confirm payment
- Update order status display based on payment verification result
- Show payment success/failure status

**6. Update `supabase/functions/payment-webhook/index.ts`** (already exists)
- Keep as webhook handler for UddoktaPay IPN callbacks
- Update to set `payment_status = 'paid'` instead of `partial`

### Technical Details
- **Client-side flow**: Checkout → create order → POST to `https://beautystor.paymently.io/api/checkout-v2` directly → redirect to payment_url → return to order-confirmation with invoice_id → verify payment
- **Server-side flow**: Checkout → create order → call `process-payment` edge function → redirect to payment_url → return to order-confirmation → call edge function to verify
- API key will be stored both as a Supabase secret (for edge functions) and as a constant in client code (for client-side option) since it's a publishable merchant key
- Note: Next.js API routes are not available in this Vite project; edge functions serve the same purpose

### Files to modify
- `supabase/functions/process-payment/index.ts`
- `supabase/functions/payment-webhook/index.ts`
- `src/pages/Checkout.tsx`
- `src/pages/OrderConfirmation.tsx`

### New files
- `supabase/functions/verify-payment/index.ts` — dedicated verify endpoint for order confirmation page

