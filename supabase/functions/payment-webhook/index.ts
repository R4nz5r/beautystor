import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const UDDOKTAPAY_API_KEY = Deno.env.get('UDDOKTAPAY_API_KEY');
    const UDDOKTAPAY_BASE_URL = Deno.env.get('UDDOKTAPAY_BASE_URL') || 'https://beautystor.paymently.io/api';

    if (!UDDOKTAPAY_API_KEY) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { invoice_id } = body;

    if (!invoice_id) {
      return new Response(JSON.stringify({ error: 'Missing invoice_id' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify payment with UddoktaPay
    const verifyRes = await fetch(`${UDDOKTAPAY_BASE_URL}/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'RT-UDDOKTAPAY-API-KEY': UDDOKTAPAY_API_KEY,
      },
      body: JSON.stringify({ invoice_id }),
    });

    const verifyData = await verifyRes.json();

    if (!verifyRes.ok) {
      return new Response(JSON.stringify({ error: 'Payment verification failed', details: verifyData }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (verifyData.status === 'COMPLETED') {
      const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
      const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      const orderId = verifyData.metadata?.order_id;
      if (orderId) {
        await supabase.from('orders').update({
          payment_status: 'paid',
          updated_at: new Date().toISOString(),
        }).eq('id', orderId);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
