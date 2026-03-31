import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';

const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'পেন্ডিং', variant: 'secondary' },
  confirmed: { label: 'কনফার্মড', variant: 'default' },
  processing: { label: 'প্রসেসিং', variant: 'default' },
  shipped: { label: 'শিপড', variant: 'default' },
  delivered: { label: 'ডেলিভারড', variant: 'default' },
  cancelled: { label: 'বাতিল', variant: 'destructive' },
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
            const s = statusMap[o.status] || { label: o.status, variant: 'secondary' as const };
            return (
              <Link key={o.id} to={`/dashboard/orders/${o.id}`} className="block border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-muted-foreground">#{o.id.slice(0, 8)}</span>
                  <Badge variant={s.variant}>{s.label}</Badge>
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
