import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      // Get profiles
      const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      
      // Get distinct customer names from orders matched by user_id
      const { data: orders } = await supabase.from('orders').select('user_id, customer_name, phone');

      const orderMap = new Map<string, { name: string; phone: string }>();
      orders?.forEach(o => {
        if (o.user_id && !orderMap.has(o.user_id)) {
          orderMap.set(o.user_id, { name: o.customer_name || '', phone: o.phone || '' });
        }
      });

      const merged = (profiles || []).map(p => ({
        ...p,
        order_name: orderMap.get(p.user_id)?.name || null,
        order_phone: orderMap.get(p.user_id)?.phone || null,
      }));

      setCustomers(merged);
    };
    load();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">কাস্টমার তালিকা</h1>
      <div className="bg-card border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-medium">নাম</th>
              <th className="text-left p-3 font-medium">ফোন</th>
              <th className="text-left p-3 font-medium">ঠিকানা</th>
              <th className="text-left p-3 font-medium">তারিখ</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {customers.map(c => (
              <tr key={c.id} className="hover:bg-muted/50">
                <td className="p-3 font-medium">{c.name || '-'}</td>
                <td className="p-3">{c.order_name || <span className="text-muted-foreground">অর্ডার নেই</span>}</td>
                <td className="p-3">{c.phone || c.order_phone || '-'}</td>
                <td className="p-3 text-muted-foreground">{c.address || '-'}</td>
                <td className="p-3 text-xs">{new Date(c.created_at).toLocaleDateString('bn-BD')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && <p className="text-center py-8 text-muted-foreground">কোনো কাস্টমার নেই</p>}
      </div>
    </div>
  );
};

export default AdminCustomers;
