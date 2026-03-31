import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import { toast } from 'sonner';

const Checkout = () => {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    paymentMethod: 'cod' as 'cod' | 'online',
  });

  const deliveryCharge = subtotal >= 500 ? 0 : 80;
  const total = subtotal + deliveryCharge;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address) {
      toast.error('সকল তথ্য পূরণ করুন');
      return;
    }
    if (items.length === 0) {
      toast.error('কার্ট খালি');
      return;
    }

    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id || null;

      const { data: order, error } = await supabase.from('orders').insert({
        user_id: userId,
        status: 'pending',
        subtotal,
        delivery_charge: deliveryCharge,
        total,
        payment_method: form.paymentMethod,
        payment_status: 'unpaid',
        shipping_address: { address: form.address, city: form.city },
        phone: form.phone,
        customer_name: form.name,
      }).select().single();

      if (error) throw error;

      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price: item.sale_price || item.price,
      }));

      await supabase.from('order_items').insert(orderItems);

      clearCart();
      toast.success('অর্ডার সফলভাবে সম্পন্ন হয়েছে!');
      navigate(`/order-confirmation/${order.id}`);
    } catch (err) {
      toast.error('অর্ডার করতে সমস্যা হয়েছে');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center py-16">
          <p className="text-muted-foreground mb-4">আপনার কার্ট খালি</p>
          <Button asChild><Link to="/products">শপিং শুরু করুন</Link></Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-6">
          <h1 className="text-2xl font-bold mb-6">চেকআউট</h1>

          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Shipping info */}
              <div className="md:col-span-2 space-y-4">
                <div className="border rounded-lg p-6 space-y-4">
                  <h2 className="font-bold text-lg">শিপিং তথ্য</h2>
                  <div>
                    <label className="text-sm font-medium mb-1 block">নাম *</label>
                    <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="আপনার নাম" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">ফোন নম্বর *</label>
                    <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="01XXXXXXXXX" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">ঠিকানা *</label>
                    <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="বিস্তারিত ঠিকানা" required />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">শহর</label>
                    <Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="ঢাকা" />
                  </div>
                </div>

                <div className="border rounded-lg p-6 space-y-3">
                  <h2 className="font-bold text-lg">পেমেন্ট পদ্ধতি</h2>
                  <label className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-muted/50">
                    <input type="radio" name="payment" value="cod" checked={form.paymentMethod === 'cod'} onChange={() => setForm(f => ({ ...f, paymentMethod: 'cod' }))} />
                    <div>
                      <p className="font-medium text-sm">ক্যাশ অন ডেলিভারি</p>
                      <p className="text-xs text-muted-foreground">পণ্য হাতে পেয়ে পেমেন্ট করুন</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-muted/50">
                    <input type="radio" name="payment" value="online" checked={form.paymentMethod === 'online'} onChange={() => setForm(f => ({ ...f, paymentMethod: 'online' }))} />
                    <div>
                      <p className="font-medium text-sm">অনলাইন পেমেন্ট (আংশিক)</p>
                      <p className="text-xs text-muted-foreground">মোট মূল্যের ১০% বা ডেলিভারি চার্জ অগ্রিম পরিশোধ করুন</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Order summary */}
              <div className="bg-card border rounded-lg p-6 h-fit">
                <h3 className="font-bold mb-4">অর্ডার সামারি</h3>
                <div className="space-y-3 mb-4">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-3 text-sm">
                      <img src={item.image} alt="" className="w-12 h-12 rounded object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="line-clamp-1">{item.name}</p>
                        <p className="text-muted-foreground">{item.quantity}x ৳{(item.sale_price || item.price).toLocaleString('bn-BD')}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 text-sm border-t pt-3">
                  <div className="flex justify-between"><span className="text-muted-foreground">সাবটোটাল</span><span>৳{subtotal.toLocaleString('bn-BD')}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">ডেলিভারি</span><span>{deliveryCharge === 0 ? 'ফ্রি' : `৳${deliveryCharge}`}</span></div>
                  {form.paymentMethod === 'online' && (
                    <div className="flex justify-between text-primary">
                      <span>অগ্রিম পেমেন্ট</span>
                      <span>৳{Math.max(Math.ceil(total * 0.1), deliveryCharge).toLocaleString('bn-BD')}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-bold text-base">
                    <span>মোট</span><span className="text-primary">৳{total.toLocaleString('bn-BD')}</span>
                  </div>
                </div>
                <Button type="submit" className="w-full mt-4" disabled={loading}>
                  {loading ? 'প্রসেসিং...' : 'অর্ডার কনফার্ম করুন'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
