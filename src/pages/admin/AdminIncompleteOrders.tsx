import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
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
              <th className="text-left p-3 font-medium">ঠিকানা</th>
              <th className="text-left p-3 font-medium">কার্ট আইটেম</th>
              <th className="text-left p-3 font-medium">সময়</th>
              <th className="text-left p-3 font-medium">ডিলিট</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map(o => (
              <tr key={o.id} className="hover:bg-muted/50">
                <td className="p-3 font-medium">{o.customer_name || <span className="text-muted-foreground">-</span>}</td>
                <td className="p-3">{o.phone || '-'}</td>
                <td className="p-3 text-xs max-w-[200px] truncate">
                  {[o.address, o.city].filter(Boolean).join(', ') || '-'}
                </td>
                <td className="p-3">
                  {o.cart_items && o.cart_items.length > 0 ? (
                    <div className="space-y-0.5">
                      {o.cart_items.map((item: any, i: number) => (
                        <p key={i} className="text-xs">
                          {item.name} × {item.qty} — ৳{item.price}
                        </p>
                      ))}
                    </div>
                  ) : <span className="text-muted-foreground text-xs">কার্ট খালি</span>}
                </td>
                <td className="p-3 text-xs text-muted-foreground">{formatTime(o.updated_at)}</td>
                <td className="p-3">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(o.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="text-center py-8 text-muted-foreground">কোনো ইনকমপ্লিট অর্ডার নেই</p>}
      </div>

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
