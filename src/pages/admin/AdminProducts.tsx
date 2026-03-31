import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const AdminProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    name: '', slug: '', description: '', price: '', sale_price: '', category_id: '', stock: '0', featured: false, is_active: true, images: '',
  });

  const load = async () => {
    const { data } = await supabase.from('products').select('*, category:categories(name)').order('created_at', { ascending: false });
    if (data) setProducts(data);
  };

  useEffect(() => {
    load();
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => { if (data) setCategories(data); });
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', slug: '', description: '', price: '', sale_price: '', category_id: '', stock: '0', featured: false, is_active: true, images: '' });
    setOpen(true);
  };

  const openEdit = (p: any) => {
    setEditing(p);
    const imgs = Array.isArray(p.images) ? p.images : (typeof p.images === 'string' ? JSON.parse(p.images || '[]') : []);
    setForm({
      name: p.name, slug: p.slug, description: p.description || '', price: String(p.price), sale_price: p.sale_price ? String(p.sale_price) : '',
      category_id: p.category_id || '', stock: String(p.stock), featured: p.featured, is_active: p.is_active, images: imgs.join('\n'),
    });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'),
      description: form.description,
      price: parseFloat(form.price) || 0,
      sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
      category_id: form.category_id || null,
      stock: parseInt(form.stock) || 0,
      featured: form.featured,
      is_active: form.is_active,
      images: JSON.stringify(form.images.split('\n').filter(Boolean)),
      updated_at: new Date().toISOString(),
    };

    if (editing) {
      const { error } = await supabase.from('products').update(payload).eq('id', editing.id);
      if (error) toast.error('আপডেট ব্যর্থ'); else toast.success('আপডেট সফল');
    } else {
      const { error } = await supabase.from('products').insert(payload);
      if (error) toast.error('যোগ করতে ব্যর্থ: ' + error.message); else toast.success('প্রোডাক্ট যোগ হয়েছে');
    }
    setOpen(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('মুছে ফেলতে চান?')) return;
    await supabase.from('products').delete().eq('id', id);
    toast.success('মুছে ফেলা হয়েছে');
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">প্রোডাক্ট ম্যানেজমেন্ট</h1>
        <Button onClick={openNew} className="gap-1"><Plus className="h-4 w-4" /> নতুন প্রোডাক্ট</Button>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-medium">ছবি</th>
              <th className="text-left p-3 font-medium">নাম</th>
              <th className="text-left p-3 font-medium">দাম</th>
              <th className="text-left p-3 font-medium">ক্যাটাগরি</th>
              <th className="text-left p-3 font-medium">স্টক</th>
              <th className="text-left p-3 font-medium">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map(p => {
              const imgs = Array.isArray(p.images) ? p.images : (typeof p.images === 'string' ? JSON.parse(p.images || '[]') : []);
              return (
                <tr key={p.id} className="hover:bg-muted/50">
                  <td className="p-3"><img src={imgs[0] || '/placeholder.svg'} alt="" className="w-10 h-10 rounded object-cover" /></td>
                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3">৳{p.sale_price || p.price}</td>
                  <td className="p-3 text-muted-foreground">{p.category?.name || '-'}</td>
                  <td className="p-3">{p.stock}</td>
                  <td className="p-3 flex gap-1">
                    <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-muted rounded"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-destructive/10 rounded text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'প্রোডাক্ট এডিট' : 'নতুন প্রোডাক্ট'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="প্রোডাক্টের নাম" required />
            <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="slug (auto-generated if empty)" />
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="বর্ণনা" rows={3} />
            <div className="grid grid-cols-2 gap-3">
              <Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="দাম" required />
              <Input type="number" value={form.sale_price} onChange={e => setForm(f => ({ ...f, sale_price: e.target.value }))} placeholder="সেল দাম" />
            </div>
            <Select value={form.category_id} onValueChange={v => setForm(f => ({ ...f, category_id: v }))}>
              <SelectTrigger><SelectValue placeholder="ক্যাটাগরি সিলেক্ট করুন" /></SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="স্টক" />
            <Textarea value={form.images} onChange={e => setForm(f => ({ ...f, images: e.target.value }))} placeholder="ছবির URL (প্রতি লাইনে একটি)" rows={2} />
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm"><Switch checked={form.featured} onCheckedChange={v => setForm(f => ({ ...f, featured: v }))} /> ফিচার্ড</label>
              <label className="flex items-center gap-2 text-sm"><Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} /> একটিভ</label>
            </div>
            <Button type="submit" className="w-full">{editing ? 'আপডেট করুন' : 'যোগ করুন'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
