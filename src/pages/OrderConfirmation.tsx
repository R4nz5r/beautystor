import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';

const OrderConfirmation = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    supabase.from('orders').select('*').eq('id', id).single()
      .then(({ data }) => { if (data) setOrder(data); });
  }, [id]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12">
        <div className="text-center max-w-md mx-auto px-4">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">অর্ডার সফল হয়েছে!</h1>
          <p className="text-muted-foreground mb-2">আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে।</p>
          {order && (
            <div className="bg-card border rounded-lg p-4 my-6 text-sm text-left space-y-2">
              <div className="flex justify-between"><span className="text-muted-foreground">অর্ডার আইডি</span><span className="font-mono text-xs">{order.id.slice(0, 8)}...</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">মোট</span><span className="font-bold text-primary">৳{order.total}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">পেমেন্ট</span><span>{order.payment_method === 'cod' ? 'ক্যাশ অন ডেলিভারি' : 'অনলাইন'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">স্ট্যাটাস</span><span className="flex items-center gap-1"><Package className="h-3 w-3" /> পেন্ডিং</span></div>
            </div>
          )}
          <div className="flex gap-3 justify-center">
            <Button asChild><Link to="/products">শপিং চালিয়ে যান</Link></Button>
            <Button variant="outline" asChild><Link to="/">হোমে ফিরুন</Link></Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderConfirmation;
