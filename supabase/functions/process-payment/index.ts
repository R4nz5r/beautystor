import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const UDDOKTAPAY_API_KEY = Deno.env.get('UDDOKTAPAY_API_KEY');
    const UDDOKTAPAY_BASE_URL = Deno.env.get('UDDOKTAPAY_BASE_URL') || 'https://beautystor.paymently.io/api';

    if (!UDDOKTAPAY_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'UddoktaPay API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { order_id, amount, customer_name, customer_email, customer_phone, redirect_url, cancel_url } = await req.json();

    if (!order_id || !amount) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: order_id, amount' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const appUrl = 'https://beautystor.lovable.app';

    // Initiate payment with UddoktaPay - full amount
    const paymentRes = await fetch(`${UDDOKTAPAY_BASE_URL}/checkout-v2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'RT-UDDOKTAPAY-API-KEY': UDDOKTAPAY_API_KEY,
      },
      body: JSON.stringify({
        full_name: customer_name || 'Customer',
        email: customer_email || 'customer@example.com',
        amount: String(amount),
        metadata: { order_id },
        redirect_url: redirect_url || `${appUrl}/order-confirmation/${order_id}`,
        return_type: 'GET',
        cancel_url: cancel_url || `${appUrl}/checkout`,
        webhook_url: `${SUPABASE_URL}/functions/v1/payment-webhook`,
      }),
    });

    const paymentData = await paymentRes.json();

    if (!paymentRes.ok || !paymentData.status) {
      return new Response(
        JSON.stringify({ error: 'Payment initiation failed', details: paymentData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update order payment status to pending
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    await supabase.from('orders').update({ payment_status: 'unpaid' }).eq('id', order_id);

    return new Response(
      JSON.stringify({ payment_url: paymentData.payment_url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
