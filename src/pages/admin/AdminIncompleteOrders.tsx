import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, Eye, ArrowRightCircle, ShoppingCart, CheckCircle, TrendingUp, MapPin, RefreshCw } from 'lucide-react';
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
  const [completedCount, setCompletedCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [detailOrder, setDetailOrder] = useState<IncompleteOrder | null>(null);
  const [convertingId, setConvertingId] = useState<string | null>(null);

  const load = async () => {
    const [incRes, ordersRes] = await Promise.all([
      supabase.from('incomplete_orders' as any).select('*').order('updated_at', { ascending: false }),
      supabase.from('orders').select('id, total').order('created_at', { ascending: false }),
    ]);
    if (incRes.data) setOrders(incRes.data as any);
    if (ordersRes.data) {
      setCompletedCount(ordersRes.data.length);
      setTotalRevenue(ordersRes.data.reduce((s, o) => s + Number(o.total), 0));
    }
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
      const { data: settingsData } = await supabase.from('site_settings').select('value').eq('key', 'delivery_charge').single();
      const deliveryCharge = settingsData?.value ? parseFloat(settingsData.value) : 0;
      const total = subtotal + deliveryCharge;

      const { data: newOrder, error: orderError } = await supabase.from('orders').insert({
        customer_name: order.customer_name,
        phone: order.phone,
        shipping_address: { address: order.address, city: order.city },
        payment_method: (order.payment_method as 'cod' | 'online') || 'cod',
        subtotal, delivery_charge: deliveryCharge, discount: 0, total,
        status: 'pending', payment_status: 'unpaid',
      }).select('id').single();

      if (orderError || !newOrder) throw orderError;

      if (cartItems.length > 0) {
        const orderItems = cartItems.map((item: any) => ({
          order_id: newOrder.id, product_id: item.id || null,
          product_name: item.name || 'Unknown',
          quantity: item.qty || item.quantity || 1, price: item.price || 0,
        }));
        await supabase.from('order_items').insert(orderItems);
      }

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
    return `${Math.floor(hours / 24)} দিন আগে`;
  };

  const cartTotal = (items: any[]) =>
    items?.reduce((sum: number, i: any) => sum + (i.price * (i.qty || i.quantity || 1)), 0) || 0;

  const getCompleteness = (o: IncompleteOrder) => {
    const fields = [o.customer_name, o.phone, o.address, o.city, o.payment_method];
    const hasCart = o.cart_items && o.cart_items.length > 0;
    const filled = fields.filter(Boolean).length + (hasCart ? 1 : 0);
    return Math.round((filled / 6) * 100);
  };

  const stats = useMemo(() => {
    const totalIncomplete = orders.length;
    const totalAll = completedCount + totalIncomplete;
    const conversionRate = totalAll > 0 ? ((completedCount / totalAll) * 100).toFixed(0) : '0';
    const incompleteValue = orders.reduce((sum, o) => sum + cartTotal(o.cart_items), 0);
    const phonesCount = orders.filter(o => o.phone).length;
    return { totalIncomplete, conversionRate, incompleteValue, phonesCount };
  }, [orders, completedCount]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">অসম্পূর্ণ অর্ডার</h1>
          <p className="text-sm text-muted-foreground mt-1">রিয়েল-টাইম চেকআউট ট্র্যাকিং ও রিকভারি</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          রিফ্রেশ
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border rounded-xl p-4 flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-primary/10">
            <ShoppingCart className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.totalIncomplete}</p>
            <p className="text-xs text-muted-foreground">অসম্পূর্ণ অর্ডার</p>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4 flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-green-500/10">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{completedCount}</p>
            <p className="text-xs text-muted-foreground">সম্পন্নকৃত অর্ডার</p>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4 flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-blue-500/10">
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.conversionRate}%</p>
            <p className="text-xs text-muted-foreground">রিকভার হার</p>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4 flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10">
            <MapPin className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">৳{totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">উদ্ধারকৃত বিক্রি</p>
          </div>
        </div>
      </div>

      {/* Summary Banner */}
      {stats.totalIncomplete > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">সম্ভাব্য বিক্রি (অসম্পূর্ণ)</p>
            <p className="text-2xl font-bold text-amber-800 dark:text-amber-300">৳{stats.incompleteValue.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-amber-600 dark:text-amber-400">ফোন নম্বর আছে</p>
            <p className="text-lg font-bold text-amber-800 dark:text-amber-300">{stats.phonesCount} টি</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div>
        <h2 className="text-lg font-semibold mb-3">অসম্পূর্ণ চেকআউট লিস্ট</h2>
        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60">
                <tr>
                  <th className="text-left p-3 font-medium">কাস্টমার</th>
                  <th className="text-left p-3 font-medium">ফোন</th>
                  <th className="text-left p-3 font-medium">ঠিকানা</th>
                  <th className="text-left p-3 font-medium">কার্ট মূল্য</th>
                  <th className="text-left p-3 font-medium">সম্পূর্ণতা</th>
                  <th className="text-left p-3 font-medium">সময়</th>
                  <th className="text-left p-3 font-medium">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map(o => {
                  const completeness = getCompleteness(o);
                  const itemCount = o.cart_items?.length || 0;
                  return (
                    <tr key={o.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => setDetailOrder(o)}>
                      <td className="p-3">
                        <p className="font-medium">{o.customer_name || <span className="text-muted-foreground">—</span>}</p>
                        {o.session_id && <p className="text-xs text-muted-foreground truncate max-w-[160px]">{o.session_id.slice(0, 20)}...</p>}
                      </td>
                      <td className="p-3 font-medium">{o.phone || '—'}</td>
                      <td className="p-3 text-muted-foreground max-w-[180px] truncate">
                        {[o.address, o.city].filter(Boolean).join(', ') || '—'}
                      </td>
                      <td className="p-3">
                        <p className="font-bold">৳{cartTotal(o.cart_items).toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{itemCount} টি পণ্য</p>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          completeness >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          completeness >= 50 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {completeness}%
                        </span>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">{formatTime(o.updated_at)}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 text-xs bg-primary/5 border-primary/20 text-primary hover:bg-primary/10"
                            onClick={() => convertToOrder(o)}
                            disabled={!!convertingId}
                          >
                            <ArrowRightCircle className="h-3.5 w-3.5" />
                            অর্ডার করুন
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDetailOrder(o)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(o.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {orders.length === 0 && <p className="text-center py-10 text-muted-foreground">কোনো অসম্পূর্ণ অর্ডার নেই</p>}
        </div>
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
            <Button onClick={() => detailOrder && convertToOrder(detailOrder)} disabled={!!convertingId} className="gap-2">
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
