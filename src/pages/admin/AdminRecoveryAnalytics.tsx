import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { TrendingUp, ShoppingCart, CheckCircle, DollarSign } from 'lucide-react';

interface Order {
  id: string;
  total: number;
  created_at: string;
  customer_name: string | null;
  status: string;
}

interface IncompleteOrder {
  id: string;
  cart_items: any[];
  created_at: string;
  updated_at: string;
  customer_name: string | null;
}

const AdminRecoveryAnalytics = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [incompleteOrders, setIncompleteOrders] = useState<IncompleteOrder[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [ordersRes, incompleteRes] = await Promise.all([
        supabase.from('orders').select('id, total, created_at, customer_name, status').order('created_at', { ascending: false }),
        supabase.from('incomplete_orders' as any).select('*').order('created_at', { ascending: false }),
      ]);
      if (ordersRes.data) setOrders(ordersRes.data);
      if (incompleteRes.data) setIncompleteOrders(incompleteRes.data as any);
    };
    loadData();
  }, []);

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalIncomplete = incompleteOrders.length;
    const totalAll = totalOrders + totalIncomplete;
    const conversionRate = totalAll > 0 ? ((totalOrders / totalAll) * 100).toFixed(1) : '0';
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const incompleteValue = incompleteOrders.reduce((sum, o) => {
      const items = o.cart_items || [];
      return sum + items.reduce((s: number, i: any) => s + (i.price * (i.qty || i.quantity || 1)), 0);
    }, 0);

    return { totalOrders, totalIncomplete, conversionRate, totalRevenue, incompleteValue };
  }, [orders, incompleteOrders]);

  // Trend data - last 30 days
  const trendData = useMemo(() => {
    const days: Record<string, { date: string; orders: number; incomplete: number; recovered: number }> = {};
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days[key] = { date: key, orders: 0, incomplete: 0, recovered: 0 };
    }

    orders.forEach(o => {
      const key = o.created_at.slice(0, 10);
      if (days[key]) days[key].orders++;
    });

    incompleteOrders.forEach(o => {
      const key = (o.updated_at || o.created_at).slice(0, 10);
      if (days[key]) days[key].incomplete++;
    });

    return Object.values(days).map(d => ({
      ...d,
      label: d.date.slice(5), // MM-DD
    }));
  }, [orders, incompleteOrders]);

  // Funnel data
  const funnelData = useMemo(() => {
    const total = stats.totalOrders + stats.totalIncomplete;
    return [
      { stage: 'চেকআউট শুরু', count: total, fill: 'hsl(var(--primary))' },
      { stage: 'ইনকমপ্লিট', count: stats.totalIncomplete, fill: 'hsl(var(--destructive))' },
      { stage: 'সম্পন্ন অর্ডার', count: stats.totalOrders, fill: 'hsl(142 76% 36%)' },
    ];
  }, [stats]);

  // Top recovered (highest value orders)
  const topOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => Number(b.total) - Number(a.total))
      .slice(0, 5);
  }, [orders]);

  const StatCard = ({ icon: Icon, label, value, sub, color }: any) => (
    <div className="bg-card border rounded-xl p-5">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">রিকভারি অ্যানালিটিক্স</h1>
        <p className="text-sm text-muted-foreground mt-1">
          ইনকমপ্লিট অর্ডার থেকে রিকভারি পারফরম্যান্স ট্র্যাক করুন
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ShoppingCart} label="মোট অর্ডার" value={stats.totalOrders} sub="সম্পন্ন অর্ডার" color="bg-primary" />
        <StatCard icon={TrendingUp} label="ইনকমপ্লিট" value={stats.totalIncomplete} sub={`৳${stats.incompleteValue.toLocaleString()} পেন্ডিং মূল্য`} color="bg-destructive" />
        <StatCard icon={CheckCircle} label="কনভার্সন রেট" value={`${stats.conversionRate}%`} sub="চেকআউট → অর্ডার" color="bg-green-600" />
        <StatCard icon={DollarSign} label="মোট রেভিনিউ" value={`৳${stats.totalRevenue.toLocaleString()}`} sub="রিকভার্ড + সরাসরি" color="bg-blue-600" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Trend */}
        <div className="bg-card border rounded-xl p-5">
          <h3 className="font-semibold mb-4">৩০ দিনের ট্রেন্ড</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Line type="monotone" dataKey="orders" name="সম্পন্ন অর্ডার" stroke="hsl(142 76% 36%)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="incomplete" name="ইনকমপ্লিট" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-card border rounded-xl p-5">
          <h3 className="font-semibold mb-4">কনভার্সন ফানেল</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="stage" tick={{ fontSize: 12 }} width={120} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" name="সংখ্যা" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Recovered Orders */}
      <div className="bg-card border rounded-xl p-5">
        <h3 className="font-semibold mb-4">সর্বোচ্চ মূল্যের অর্ডার (টপ ৫)</h3>
        <div className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 font-medium">কাস্টমার</th>
                <th className="text-left p-3 font-medium">মূল্য</th>
                <th className="text-left p-3 font-medium">স্ট্যাটাস</th>
                <th className="text-left p-3 font-medium">তারিখ</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {topOrders.map(o => (
                <tr key={o.id} className="hover:bg-muted/50">
                  <td className="p-3 font-medium">{o.customer_name || '—'}</td>
                  <td className="p-3 font-bold text-primary">৳{Number(o.total).toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      o.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      o.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground">{new Date(o.created_at).toLocaleDateString('bn-BD')}</td>
                </tr>
              ))}
              {topOrders.length === 0 && (
                <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">কোনো অর্ডার নেই</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminRecoveryAnalytics;
