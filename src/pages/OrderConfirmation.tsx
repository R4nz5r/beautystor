import { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';

const UDDOKTAPAY_API_KEY = 'E7qcUplhcoNkvZJWkkIFVe2gBBcWzuM1cOZCWC4V';
const UDDOKTAPAY_BASE_URL = 'https://beautystor.paymently.io/api';
const PAYMENT_MODE: 'server' | 'client' = 'server';

const OrderConfirmation = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);
  const [paymentResult, setPaymentResult] = useState<{
    status: string;
    payment_method?: string;
    transaction_id?: string;
  } | null>(null);

  const invoiceId = searchParams.get('invoice_id');

  // Verify payment if invoice_id is present
  useEffect(() => {
    if (!invoiceId || !id) return;

    const verifyPayment = async () => {
      setVerifying(true);
      try {
        if (PAYMENT_MODE === 'server') {
          const { data, error } = await supabase.functions.invoke('verify-payment', {
            body: { invoice_id: invoiceId, order_id: id },
          });
          if (!error && data) {
            setPaymentResult(data);
          }
        } else {
          // Client-side verification
          const res = await fetch(`${UDDOKTAPAY_BASE_URL}/verify-payment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'RT-UDDOKTAPAY-API-KEY': UDDOKTAPAY_API_KEY,
            },
            body: JSON.stringify({ invoice_id: invoiceId }),
          });
          const data = await res.json();
          setPaymentResult({
            status: data.status,
            payment_method: data.payment_method,
            transaction_id: data.transaction_id,
          });

          // Update order if completed
          if (data.status === 'COMPLETED') {
            await supabase.from('orders').update({
              payment_status: 'paid' as const,
              updated_at: new Date().toISOString(),
            }).eq('id', id);
          }
        }
      } catch (err) {
        console.error('Payment verification failed:', err);
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [invoiceId, id]);

  // Load order details
  useEffect(() => {
    if (!id) return;
    const loadOrder = async () => {
      // Small delay if verifying to let payment status update
      if (invoiceId) await new Promise(r => setTimeout(r, 1500));
      const { data } = await supabase.from('orders').select('*').eq('id', id).single();
      if (data) setOrder(data);
    };
    loadOrder();
  }, [id, invoiceId, verifying]);

  const isPaid = paymentResult?.status === 'COMPLETED' || order?.payment_status === 'paid';

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12">
        <div className="text-center max-w-md mx-auto px-4">
          {verifying ? (
            <>
              <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
              <h1 className="text-2xl font-bold mb-2">পেমেন্ট যাচাই হচ্ছে...</h1>
              <p className="text-muted-foreground">অনুগ্রহ করে অপেক্ষা করুন</p>
            </>
          ) : (
            <>
              {isPaid ? (
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              ) : paymentResult?.status === 'ERROR' ? (
                <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              ) : (
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              )}

              <h1 className="text-2xl font-bold mb-2">
                {paymentResult?.status === 'ERROR'
                  ? 'পেমেন্ট ব্যর্থ হয়েছে!'
                  : 'অর্ডার সফল হয়েছে!'}
              </h1>
              <p className="text-muted-foreground mb-2">
                {paymentResult?.status === 'ERROR'
                  ? 'পেমেন্ট সম্পন্ন হয়নি। আপনি পুনরায় চেষ্টা করতে পারেন।'
                  : 'আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে।'}
              </p>

              {order && (
                <div className="bg-card border rounded-lg p-4 my-6 text-sm text-left space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">অর্ডার আইডি</span>
                    <span className="font-mono text-xs">{order.id.slice(0, 8)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">মোট</span>
                    <span className="font-bold text-primary">৳{order.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">পেমেন্ট</span>
                    <span>{order.payment_method === 'cod' ? 'ক্যাশ অন ডেলিভারি' : 'অনলাইন'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">পেমেন্ট স্ট্যাটাস</span>
                    <span className={isPaid ? 'text-green-600 font-medium' : 'text-yellow-600'}>
                      {isPaid ? '✅ পেইড' : order.payment_method === 'cod' ? 'ডেলিভারিতে' : '⏳ পেন্ডিং'}
                    </span>
                  </div>
                  {paymentResult?.payment_method && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">পেমেন্ট মাধ্যম</span>
                      <span className="capitalize">{paymentResult.payment_method}</span>
                    </div>
                  )}
                  {paymentResult?.transaction_id && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ট্রানজেকশন আইডি</span>
                      <span className="font-mono text-xs">{paymentResult.transaction_id}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">স্ট্যাটাস</span>
                    <span className="flex items-center gap-1"><Package className="h-3 w-3" /> পেন্ডিং</span>
                  </div>
                </div>
              )}
              <div className="flex gap-3 justify-center">
                <Button asChild><Link to="/products">শপিং চালিয়ে যান</Link></Button>
                <Button variant="outline" asChild><Link to="/">হোমে ফিরুন</Link></Button>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderConfirmation;
