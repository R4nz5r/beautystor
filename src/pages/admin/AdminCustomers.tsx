import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface AggregatedCustomer {
  name: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
}

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<AggregatedCustomer[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      const { data: orders } = await supabase
        .from('orders')
        .select('customer_name, phone, shipping_address, total, created_at');

      if (!orders) return;

      const map = new Map<string, AggregatedCustomer>();

      orders.forEach((o) => {
        const key = `${(o.customer_name || '').trim().toLowerCase()}||${(o.phone || '').trim()}`;
        const existing = map.get(key);
        const addr = typeof o.shipping_address === 'object' && o.shipping_address
          ? (o.shipping_address as any).full_address || (o.shipping_address as any).address || ''
          : '';

        if (existing) {
          existing.totalOrders += 1;
          existing.totalSpent += Number(o.total) || 0;
          if (o.created_at > existing.lastOrderDate) {
            existing.lastOrderDate = o.created_at;
          }
          if (!existing.address && addr) existing.address = addr;
        } else {
          map.set(key, {
            name: o.customer_name || 'অজানা',
            phone: o.phone || '-',
            address: addr || '-',
            totalOrders: 1,
            totalSpent: Number(o.total) || 0,
            lastOrderDate: o.created_at,
          });
        }
      });

      const sorted = Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
      setCustomers(sorted);
    };
    load();
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">কাস্টমার তালিকা</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="নাম বা ফোন দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      <div className="bg-card border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-medium">নাম</th>
              <th className="text-left p-3 font-medium">ফোন</th>
              <th className="text-left p-3 font-medium">ঠিকানা</th>
              <th className="text-center p-3 font-medium">মোট অর্ডার</th>
              <th className="text-right p-3 font-medium">মোট খরচ</th>
              <th className="text-left p-3 font-medium">সর্বশেষ অর্ডার</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((c, i) => (
              <tr key={i} className="hover:bg-muted/50">
                <td className="p-3 font-medium">{c.name}</td>
                <td className="p-3">{c.phone}</td>
                <td className="p-3 text-muted-foreground max-w-[200px] truncate">{c.address}</td>
                <td className="p-3 text-center">{c.totalOrders}</td>
                <td className="p-3 text-right font-semibold">৳{c.totalSpent.toLocaleString('bn-BD')}</td>
                <td className="p-3 text-xs">{new Date(c.lastOrderDate).toLocaleDateString('bn-BD')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center py-8 text-muted-foreground">কোনো কাস্টমার পাওয়া যায়নি</p>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-2">মোট কাস্টমার: {filtered.length}</p>
    </div>
  );
};

export default AdminCustomers;
