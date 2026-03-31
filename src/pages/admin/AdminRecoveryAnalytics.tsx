import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend, PieChart, Pie, Cell,
} from 'recharts';
import { TrendingUp, ShoppingCart, CheckCircle, DollarSign } from 'lucide-react';

interface Order {
  id: string;
  total: number;
  created_at: string;
  customer_name: string | null;
  phone: string | null;
  status: string;
}

interface IncompleteOrder {
  id: string;
  cart_items: any[];
  created_at: string;
  updated_at: string;
  customer_name: string | null;
  phone: string | null;
}

const AdminRecoveryAnalytics = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [incompleteOrders, setIncompleteOrders] = useState<IncompleteOrder[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [ordersRes, incompleteRes] = await Promise.all([
        supabase.from('orders').select('id, total, created_at, customer_name, phone, status').order('created_at', { ascending: false }),
        supabase.from('incomplete_orders').select('*').order('created_at', { ascending: false }),
      ]);
      if (ordersRes.data) setOrders(ordersRes.data);
      if (incompleteRes.data) setIncompleteOrders(incompleteRes.data as any);
    };
    loadData();
  }, []);

  const stats = useMemo(() => {
    const totalIncomplete = incompleteOrders.length;
    const totalRecovered = orders.length;
    const totalAll = totalRecovered + totalIncomplete;
    const conversionRate = totalAll > 0 ? ((totalRecovered / totalAll) * 100).toFixed(0) : '0';
    const recoveredRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const incompleteValue = incompleteOrders.reduce((sum, o) => {
      const items = o.cart_items || [];
      return sum + items.reduce((s: number, i: any) => s + (i.price * (i.qty || i.quantity || 1)), 0);
    }, 0);
    const withPhone = incompleteOrders.filter(o => o.phone).length;

    return { totalIncomplete, totalRecovered, conversionRate, recoveredRevenue, incompleteValue, totalAll, withPhone };
  }, [orders, incompleteOrders]);

  // Trend data - last 14 days
  const trendData = useMemo(() => {
    const days: Record<string, { date: string; মোট: number; রূপান্তরিত: number }> = {};
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days[key] = { date: key, মোট: 0, রূপান্তরিত: 0 };
    }

    orders.forEach(o => {
      const key = o.created_at.slice(0, 10);
      if (days[key]) {
        days[key].রূপান্তরিত++;
        days[key].মোট++;
      }
    });

    incompleteOrders.forEach(o => {
      const key = (o.updated_at || o.created_at).slice(0, 10);
      if (days[key]) days[key].মোট++;
    });

    return Object.values(days).map(d => ({
      ...d,
      label: new Date(d.date).toLocaleDateString('bn-BD', { day: '2-digit', month: 'short' }),
    }));
  }, [orders, incompleteOrders]);

  // Conversion rate trend
  const rateTrendData = useMemo(() => {
    return trendData.map(d => ({
      label: d.label,
      rate: d.মোট > 0 ? Math.round((d.রূপান্তরিত / d.মোট) * 100) : 0,
    }));
  }, [trendData]);

  // Funnel data
  const funnelData = useMemo(() => {
    const total = stats.totalAll;
    const withPhoneCount = stats.withPhone + stats.totalRecovered;
    return [
      { stage: 'চেকআউট শুরু', count: total, pct: '100%' },
      { stage: 'ফোন দিয়েছে', count: withPhoneCount, pct: total > 0 ? Math.round((withPhoneCount / total) * 100) + '%' : '0%' },
      { stage: 'রূপান্তরিত', count: stats.totalRecovered, pct: total > 0 ? Math.round((stats.totalRecovered / total) * 100) + '%' : '0%' },
    ];
  }, [stats]);

  // Pie data
  const pieData = useMemo(() => [
    { name: 'রূপান্তরিত', value: stats.totalRecovered },
    { name: 'অসম্পূর্ণ', value: stats.totalIncomplete },
  ], [stats]);

  // Top recovered orders
  const topOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => Number(b.total) - Number(a.total))
      .slice(0, 5);
  }, [orders]);

  const funnelMax = funnelData[0]?.count || 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">রিকভারি অ্যানালিটিক্স</h1>
          <p className="text-sm text-muted-foreground mt-1">অসম্পূর্ণ অর্ডার রূপান্তর ও বিশ্লেষণ</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-orange-100"><ShoppingCart className="h-5 w-5 text-orange-600" /></div>
          <div>
            <p className="text-2xl font-bold">{stats.totalIncomplete}</p>
            <p className="text-xs text-muted-foreground">মোট অসম্পূর্ণ</p>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-green-100"><TrendingUp className="h-5 w-5 text-green-600" /></div>
          <div>
            <p className="text-2xl font-bold">{stats.totalRecovered}</p>
            <p className="text-xs text-muted-foreground">রূপান্তরিত</p>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-100"><CheckCircle className="h-5 w-5 text-blue-600" /></div>
          <div>
            <p className="text-2xl font-bold">{stats.conversionRate}%</p>
            <p className="text-xs text-muted-foreground">রূপান্তর হার</p>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-100"><DollarSign className="h-5 w-5 text-emerald-600" /></div>
          <div>
            <p className="text-2xl font-bold">৳{stats.recoveredRevenue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">উদ্ধারকৃত বিক্রয়</p>
          </div>
        </div>
      </div>

      {/* Revenue Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl p-5 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, hsl(142 76% 94%), hsl(142 76% 88%))' }}>
          <div>
            <p className="text-xs font-medium text-green-700 mb-1">উদ্ধারকৃত রাজস্ব</p>
            <p className="text-3xl font-bold text-green-800">৳{stats.recoveredRevenue.toLocaleString()}</p>
          </div>
          <TrendingUp className="h-10 w-10 text-green-600 opacity-60" />
        </div>
        <div className="rounded-xl p-5 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, hsl(30 100% 94%), hsl(30 100% 88%))' }}>
          <div>
            <p className="text-xs font-medium text-orange-700 mb-1">সম্ভাব্য রাজস্ব (অসম্পূর্ণ)</p>
            <p className="text-3xl font-bold text-orange-800">৳{stats.incompleteValue.toLocaleString()}</p>
          </div>
          <ShoppingCart className="h-10 w-10 text-orange-600 opacity-60" />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Conversion Trend - Bar Chart */}
        <div className="bg-card border rounded-xl p-5">
          <h3 className="font-semibold mb-4">দৈনিক রূপান্তর ট্রেন্ড</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="মোট" fill="#6b7280" radius={[3, 3, 0, 0]} />
                <Bar dataKey="রূপান্তরিত" fill="#16a34a" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversion Rate Trend - Line Chart */}
        <div className="bg-card border rounded-xl p-5">
          <h3 className="font-semibold mb-4">রূপান্তর হার ট্রেন্ড</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rateTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} formatter={(v: number) => `${v}%`} />
                <Line type="monotone" dataKey="rate" name="রূপান্তর হার" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Funnel, Pie, Top Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Funnel */}
        <div className="bg-card border rounded-xl p-5">
          <h3 className="font-semibold mb-4">রূপান্তর ফানেল</h3>
          <div className="space-y-4">
            {funnelData.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.stage}</span>
                  <span className="font-medium">{item.count}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full transition-all"
                    style={{
                      width: `${(item.count / funnelMax) * 100}%`,
                      backgroundColor: i === 0 ? '#6b7280' : i === 1 ? '#16a34a' : '#16a34a',
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{item.pct}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-card border rounded-xl p-5">
          <h3 className="font-semibold mb-4">রূপান্তর অনুপাত</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  dataKey="value"
                  strokeWidth={2}
                >
                  <Cell fill="#16a34a" />
                  <Cell fill="#d1d5db" />
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 text-xs mt-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-600" />
              রূপান্তরিত: {stats.totalRecovered}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
              অসম্পূর্ণ: {stats.totalIncomplete}
            </div>
          </div>
        </div>

        {/* Top Recovered Orders */}
        <div className="bg-card border rounded-xl p-5">
          <h3 className="font-semibold mb-4">সর্বোচ্চ উদ্ধারকৃত অর্ডার</h3>
          <div className="space-y-3">
            {topOrders.map((o, i) => (
              <div key={o.id} className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-orange-400' : 'bg-muted-foreground/30'
                }`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{o.phone || o.customer_name || '—'}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(o.created_at).toLocaleDateString('bn-BD', { day: '2-digit', month: 'short' })}
                  </p>
                </div>
                <p className="text-sm font-bold text-green-700">৳{Number(o.total).toLocaleString()}</p>
              </div>
            ))}
            {topOrders.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">কোনো অর্ডার নেই</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRecoveryAnalytics;
