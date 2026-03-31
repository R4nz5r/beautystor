import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: 'পেন্ডিং', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  confirmed: { label: 'কনফার্মড', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  processing: { label: 'প্রসেসিং', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  shipped: { label: 'শিপড', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  delivered: { label: 'ডেলিভারড', color: 'bg-green-100 text-green-800 border-green-200' },
  cancelled: { label: 'বাতিল', color: 'bg-red-100 text-red-800 border-red-200' },
};

const MyOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setOrders(data); });
  }, [user]);

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">আমার অর্ডারসমূহ</h2>
      {orders.length === 0 ? (
        <p className="text-muted-foreground">কোনো অর্ডার নেই</p>
      ) : (
        <div className="space-y-3">
          {orders.map(o => {
            const s = statusMap[o.status] || { label: o.status, color: 'bg-muted text-muted-foreground' };
            return (
              <Link key={o.id} to={`/dashboard/orders/${o.id}`} className="block border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-muted-foreground">#{o.id.slice(0, 8)}</span>
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${s.color}`}>{s.label}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{new Date(o.created_at).toLocaleDateString('bn-BD')}</span>
                  <span className="font-bold text-primary">৳{o.total}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
