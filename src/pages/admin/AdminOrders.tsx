import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const statusOptions = [
  { value: 'all', label: 'সব' },
  { value: 'pending', label: 'পেন্ডিং' },
  { value: 'confirmed', label: 'কনফার্মড' },
  { value: 'processing', label: 'প্রসেসিং' },
  { value: 'shipped', label: 'শিপড' },
  { value: 'delivered', label: 'ডেলিভারড' },
  { value: 'cancelled', label: 'বাতিল' },
];

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  processing: 'bg-purple-100 text-purple-800 border-purple-200',
  shipped: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  delivered: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (filter !== 'all') query = query.eq('status', filter as any);
    const { data } = await query;
    if (data) setOrders(data);
  };

  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('orders').update({ status: status as any, updated_at: new Date().toISOString() }).eq('id', id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">অর্ডার ম্যানেজমেন্ট</h1>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {statusOptions.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-medium">অর্ডার আইডি</th>
              <th className="text-left p-3 font-medium">কাস্টমার</th>
              <th className="text-left p-3 font-medium">মোট</th>
              <th className="text-left p-3 font-medium">পেমেন্ট</th>
              <th className="text-left p-3 font-medium">স্ট্যাটাস</th>
              <th className="text-left p-3 font-medium">তারিখ</th>
              <th className="text-left p-3 font-medium">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map(o => (
              <tr key={o.id} className="hover:bg-muted/50">
                <td className="p-3 font-mono text-xs">{o.id.slice(0, 8)}</td>
                <td className="p-3">
                  {o.customer_name || '-'}
                  <br/><span className="text-xs text-muted-foreground">{o.phone}</span>
                </td>
                <td className="p-3 font-bold">৳{o.total}</td>
                <td className="p-3">{o.payment_method === 'cod' ? 'COD' : 'অনলাইন'}</td>
                <td className="p-3">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusColors[o.status] || 'bg-muted text-muted-foreground'}`}>
                    {statusOptions.find(s => s.value === o.status)?.label || o.status}
                  </span>
                </td>
                <td className="p-3 text-xs">{new Date(o.created_at).toLocaleDateString('bn-BD')}</td>
                <td className="p-3">
                  <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                    <SelectTrigger className="h-8 text-xs w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {statusOptions.filter(s => s.value !== 'all').map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="text-center py-8 text-muted-foreground">কোনো অর্ডার নেই</p>}
      </div>
    </div>
  );
};

export default AdminOrders;
