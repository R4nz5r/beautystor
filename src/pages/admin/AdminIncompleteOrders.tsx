import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, Eye, ArrowRightCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface IncompleteOrder {
  id: string;
  session_id: string;
  customer_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  payment_method: string | null;
  cart_items: any[];
  created_at: string;
  updated_at: string;
}

const AdminIncompleteOrders = () => {
  const [orders, setOrders] = useState<IncompleteOrder[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [detailOrder, setDetailOrder] = useState<IncompleteOrder | null>(null);
  const [convertingId, setConvertingId] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from('incomplete_orders' as any)
      .select('*')
      .order('updated_at', { ascending: false });
    if (data) setOrders(data as any);
  };

  useEffect(() => { load(); }, []);

  const confirmDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from('incomplete_orders' as any).delete().eq('id', deleteId);
    if (error) toast.error('ডিলিট করতে সমস্যা হয়েছে');
    else toast.success('ইনকমপ্লিট অর্ডার মুছে ফেলা হয়েছে');
    setDeleteId(null);
    load();
  };

  const convertToOrder = async (order: IncompleteOrder) => {
    setConvertingId(order.id);
    try {
      const cartItems = order.cart_items || [];
      const subtotal = cartItems.reduce((sum: number, item: any) => sum + (item.price * (item.qty || item.quantity || 1)), 0);

      // Fetch delivery charge from site_settings
      const { data: settingsData } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'delivery_charge')
        .single();
      const deliveryCharge = settingsData?.value ? parseFloat(settingsData.value) : 0;
      const total = subtotal + deliveryCharge;

      // Create the order
      const { data: newOrder, error: orderError } = await supabase.from('orders').insert({
        customer_name: order.customer_name,
        phone: order.phone,
        shipping_address: { address: order.address, city: order.city },
        payment_method: (order.payment_method as 'cod' | 'online') || 'cod',
        subtotal,
        delivery_charge: deliveryCharge,
        discount: 0,
        total,
        status: 'pending',
        payment_status: 'unpaid',
      }).select('id').single();

      if (orderError || !newOrder) throw orderError;

      // Create order items
      if (cartItems.length > 0) {
        const orderItems = cartItems.map((item: any) => ({
          order_id: newOrder.id,
          product_id: item.id || null,
          product_name: item.name || 'Unknown',
          quantity: item.qty || item.quantity || 1,
          price: item.price || 0,
        }));
        await supabase.from('order_items').insert(orderItems);
      }

      // Delete the incomplete order
      await supabase.from('incomplete_orders' as any).delete().eq('id', order.id);

      toast.success('অর্ডারে রূপান্তর করা হয়েছে!');
      setDetailOrder(null);
      load();
    } catch (err) {
      console.error(err);
      toast.error('অর্ডার তৈরি করতে সমস্যা হয়েছে');
    } finally {
      setConvertingId(null);
    }
  };

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'এইমাত্র';
    if (mins < 60) return `${mins} মিনিট আগে`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} ঘণ্টা আগে`;
    const days = Math.floor(hours / 24);
    return `${days} দিন আগে`;
  };

  const cartTotal = (items: any[]) =>
    items?.reduce((sum: number, i: any) => sum + (i.price * (i.qty || i.quantity || 1)), 0) || 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">ইনকমপ্লিট অর্ডার</h1>
          <p className="text-sm text-muted-foreground mt-1">
            যেসব কাস্টমার চেকআউট ফর্ম পূরণ করেছে কিন্তু অর্ডার সম্পন্ন করেনি
          </p>
        </div>
        <span className="bg-destructive/10 text-destructive px-3 py-1 rounded-full text-sm font-medium">
          {orders.length} টি
        </span>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-medium">কাস্টমার</th>
              <th className="text-left p-3 font-medium">ফোন</th>
              <th className="text-left p-3 font-medium">কার্ট মূল্য</th>
              <th className="text-left p-3 font-medium">সময়</th>
              <th className="text-left p-3 font-medium">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map(o => (
              <tr key={o.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => setDetailOrder(o)}>
                <td className="p-3 font-medium">{o.customer_name || <span className="text-muted-foreground">—</span>}</td>
                <td className="p-3">{o.phone || '—'}</td>
                <td className="p-3 font-medium">৳{cartTotal(o.cart_items)}</td>
                <td className="p-3 text-xs text-muted-foreground">{formatTime(o.updated_at)}</td>
                <td className="p-3">
                  <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDetailOrder(o)} title="বিস্তারিত">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:text-primary" onClick={() => convertToOrder(o)} title="অর্ডারে রূপান্তর" disabled={!!convertingId}>
                      <ArrowRightCircle className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(o.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="text-center py-8 text-muted-foreground">কোনো ইনকমপ্লিট অর্ডার নেই</p>}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!detailOrder} onOpenChange={(open) => !open && setDetailOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>কাস্টমার বিস্তারিত</DialogTitle>
          </DialogHeader>
          {detailOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">নাম</p>
                  <p className="font-medium">{detailOrder.customer_name || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">ফোন</p>
                  <p className="font-medium">{detailOrder.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">ঠিকানা</p>
                  <p className="font-medium">{detailOrder.address || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">শহর</p>
                  <p className="font-medium">{detailOrder.city || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">পেমেন্ট মেথড</p>
                  <p className="font-medium">{detailOrder.payment_method === 'online' ? 'অনলাইন' : 'ক্যাশ অন ডেলিভারি'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">সময়</p>
                  <p className="font-medium">{formatTime(detailOrder.updated_at)}</p>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground text-xs mb-2">কার্ট আইটেম</p>
                {detailOrder.cart_items && detailOrder.cart_items.length > 0 ? (
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    {detailOrder.cart_items.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span>{item.name} × {item.qty || item.quantity || 1}</span>
                        <span className="font-medium">৳{item.price * (item.qty || item.quantity || 1)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 flex justify-between font-bold text-sm">
                      <span>মোট</span>
                      <span>৳{cartTotal(detailOrder.cart_items)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">কার্ট খালি</p>
                )}
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              onClick={() => detailOrder && convertToOrder(detailOrder)}
              disabled={!!convertingId}
              className="gap-2"
            >
              <ArrowRightCircle className="h-4 w-4" />
              অর্ডারে রূপান্তর করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ইনকমপ্লিট অর্ডার ডিলিট করুন</AlertDialogTitle>
            <AlertDialogDescription>এই রেকর্ডটি স্থায়ীভাবে মুছে ফেলা হবে।</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">ডিলিট করুন</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminIncompleteOrders;
