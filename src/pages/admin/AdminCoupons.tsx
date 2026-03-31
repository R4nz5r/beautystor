import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog';

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

const emptyForm = {
  code: '',
  discount_type: 'percentage',
  discount_value: 0,
  min_order_amount: 0,
  max_uses: '' as string | number,
  is_active: true,
  expires_at: '',
};

const AdminCoupons = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as Coupon[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        code: form.code.trim().toUpperCase(),
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        min_order_amount: Number(form.min_order_amount),
        max_uses: form.max_uses === '' ? null : Number(form.max_uses),
        is_active: form.is_active,
        expires_at: form.expires_at || null,
      };
      if (editId) {
        const { error } = await supabase.from('coupons').update(payload).eq('id', editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('coupons').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      toast.success(editId ? 'কুপন আপডেট হয়েছে' : 'কুপন তৈরি হয়েছে');
      closeDialog();
    },
    onError: () => toast.error('সমস্যা হয়েছে'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      toast.success('কুপন মুছে ফেলা হয়েছে');
    },
  });

  const openNew = () => {
    setEditId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (c: Coupon) => {
    setEditId(c.id);
    setForm({
      code: c.code,
      discount_type: c.discount_type,
      discount_value: c.discount_value,
      min_order_amount: c.min_order_amount,
      max_uses: c.max_uses ?? '',
      is_active: c.is_active,
      expires_at: c.expires_at ? c.expires_at.slice(0, 16) : '',
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditId(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">কুপন ম্যানেজমেন্ট</h1>
        <Button onClick={openNew} size="sm"><Plus className="h-4 w-4 mr-1" /> নতুন কুপন</Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">লোড হচ্ছে...</p>
      ) : coupons.length === 0 ? (
        <p className="text-muted-foreground">কোনো কুপন নেই</p>
      ) : (
        <div className="border rounded-lg overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">কোড</th>
                <th className="text-left p-3 font-medium">ছাড়</th>
                <th className="text-left p-3 font-medium">ন্যূনতম অর্ডার</th>
                <th className="text-left p-3 font-medium">ব্যবহার</th>
                <th className="text-left p-3 font-medium">মেয়াদ</th>
                <th className="text-left p-3 font-medium">স্ট্যাটাস</th>
                <th className="text-right p-3 font-medium">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c.id} className="border-t hover:bg-muted/30">
                  <td className="p-3 font-mono font-bold flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" /> {c.code}
                  </td>
                  <td className="p-3">
                    {c.discount_type === 'percentage' ? `${c.discount_value}%` : `৳${c.discount_value}`}
                  </td>
                  <td className="p-3">৳{Number(c.min_order_amount).toLocaleString('bn-BD')}</td>
                  <td className="p-3">{c.used_count}/{c.max_uses ?? '∞'}</td>
                  <td className="p-3 text-xs">
                    {c.expires_at ? new Date(c.expires_at).toLocaleDateString('bn-BD') : 'সীমাহীন'}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {c.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => { if (confirm('মুছে ফেলতে চান?')) deleteMutation.mutate(c.id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? 'কুপন এডিট করুন' : 'নতুন কুপন তৈরি করুন'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">কুপন কোড *</label>
              <Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="BEAUTY15" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">ছাড়ের ধরণ</label>
                <select className="w-full border rounded-md px-3 py-2 text-sm" value={form.discount_type} onChange={e => setForm(f => ({ ...f, discount_type: e.target.value }))}>
                  <option value="percentage">শতকরা (%)</option>
                  <option value="fixed">নির্দিষ্ট (৳)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">ছাড়ের পরিমাণ *</label>
                <Input type="number" value={form.discount_value} onChange={e => setForm(f => ({ ...f, discount_value: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">ন্যূনতম অর্ডার (৳)</label>
                <Input type="number" value={form.min_order_amount} onChange={e => setForm(f => ({ ...f, min_order_amount: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">সর্বোচ্চ ব্যবহার</label>
                <Input type="number" value={form.max_uses} onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))} placeholder="সীমাহীন" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">মেয়াদ শেষ</label>
              <Input type="datetime-local" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />
              সক্রিয়
            </label>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">বাতিল</Button></DialogClose>
            <Button onClick={() => saveMutation.mutate()} disabled={!form.code.trim() || saveMutation.isPending}>
              {saveMutation.isPending ? '...' : editId ? 'আপডেট' : 'তৈরি করুন'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCoupons;
