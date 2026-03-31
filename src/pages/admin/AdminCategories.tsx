import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const AdminCategories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', slug: '', image_url: '', sort_order: '0' });

  const load = async () => {
    const { data } = await supabase.from('categories').select('*').order('sort_order');
    if (data) setCategories(data);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm({ name: '', slug: '', image_url: '', sort_order: '0' }); setOpen(true); };
  const openEdit = (c: any) => { setEditing(c); setForm({ name: c.name, slug: c.slug, image_url: c.image_url || '', sort_order: String(c.sort_order) }); setOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name: form.name, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'), image_url: form.image_url || null, sort_order: parseInt(form.sort_order) || 0 };
    if (editing) {
      await supabase.from('categories').update(payload).eq('id', editing.id);
      toast.success('আপডেট সফল');
    } else {
      await supabase.from('categories').insert(payload);
      toast.success('ক্যাটাগরি যোগ হয়েছে');
    }
    setOpen(false); load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('মুছে ফেলতে চান?')) return;
    await supabase.from('categories').delete().eq('id', id);
    toast.success('মুছে ফেলা হয়েছে'); load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">ক্যাটাগরি ম্যানেজমেন্ট</h1>
        <Button onClick={openNew} className="gap-1"><Plus className="h-4 w-4" /> নতুন ক্যাটাগরি</Button>
      </div>
      <div className="bg-card border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted"><tr><th className="text-left p-3 font-medium">ছবি</th><th className="text-left p-3 font-medium">নাম</th><th className="text-left p-3 font-medium">Slug</th><th className="text-left p-3 font-medium">ক্রম</th><th className="text-left p-3 font-medium">অ্যাকশন</th></tr></thead>
          <tbody className="divide-y">
            {categories.map(c => (
              <tr key={c.id} className="hover:bg-muted/50">
                <td className="p-3">{c.image_url ? <img src={c.image_url} alt="" className="w-10 h-10 rounded-full object-cover" /> : '-'}</td>
                <td className="p-3 font-medium">{c.name}</td>
                <td className="p-3 text-muted-foreground">{c.slug}</td>
                <td className="p-3">{c.sort_order}</td>
                <td className="p-3 flex gap-1">
                  <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-muted rounded"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(c.id)} className="p-1.5 hover:bg-destructive/10 rounded text-destructive"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'ক্যাটাগরি এডিট' : 'নতুন ক্যাটাগরি'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="ক্যাটাগরি নাম" required />
            <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="slug" />
            <Input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="ছবির URL" />
            <Input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} placeholder="ক্রম" />
            <Button type="submit" className="w-full">{editing ? 'আপডেট' : 'যোগ করুন'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCategories;
