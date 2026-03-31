import { useEffect, useState } from 'react';
import { ShoppingCart, Package, Users, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ orders: 0, products: 0, customers: 0, revenue: 0, pending: 0 });

  useEffect(() => {
    Promise.all([
      supabase.from('orders').select('id, total, status', { count: 'exact' }),
      supabase.from('products').select('id', { count: 'exact' }),
      supabase.from('profiles').select('id', { count: 'exact' }),
    ]).then(([ordersRes, prodsRes, custsRes]) => {
      const orders = ordersRes.data || [];
      const revenue = orders.reduce((s, o) => s + Number(o.total || 0), 0);
      const pending = orders.filter(o => o.status === 'pending').length;
      setStats({
        orders: ordersRes.count || 0,
        products: prodsRes.count || 0,
        customers: custsRes.count || 0,
        revenue,
        pending,
      });
    });
  }, []);

  const cards = [
    { icon: ShoppingCart, label: 'মোট অর্ডার', value: stats.orders, color: 'text-primary' },
    { icon: DollarSign, label: 'মোট রেভিনিউ', value: `৳${stats.revenue.toLocaleString('bn-BD')}`, color: 'text-green-600' },
    { icon: Package, label: 'পেন্ডিং অর্ডার', value: stats.pending, color: 'text-amber-600' },
    { icon: Users, label: 'কাস্টমার', value: stats.customers, color: 'text-blue-600' },
    { icon: Package, label: 'মোট প্রোডাক্ট', value: stats.products, color: 'text-purple-600' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">ড্যাশবোর্ড</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((c, i) => (
          <div key={i} className="bg-card border rounded-lg p-5">
            <c.icon className={`h-8 w-8 mb-2 ${c.color}`} />
            <p className="text-2xl font-bold">{c.value}</p>
            <p className="text-sm text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
