import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const AdminBanners = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ image_url: '', link: '', position: 'hero' as 'hero' | 'promo', sort_order: '0', is_active: true });

  const load = async () => {
    const { data } = await supabase.from('banners').select('*').order('position').order('sort_order');
    if (data) setBanners(data);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('banners').insert({ ...form, sort_order: parseInt(form.sort_order) || 0 });
    toast.success('ব্যানার যোগ হয়েছে'); setOpen(false); load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('banners').delete().eq('id', id);
    toast.success('মুছে ফেলা হয়েছে'); load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">ব্যানার ম্যানেজমেন্ট</h1>
        <Button onClick={() => setOpen(true)} className="gap-1"><Plus className="h-4 w-4" /> নতুন ব্যানার</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners.map(b => (
          <div key={b.id} className="border rounded-lg overflow-hidden">
            <img src={b.image_url} alt="" className="w-full h-40 object-cover" />
            <div className="p-3 flex justify-between items-center">
              <div>
                <span className="text-xs bg-muted px-2 py-0.5 rounded">{b.position === 'hero' ? 'হিরো' : 'প্রোমো'}</span>
                <span className="text-xs text-muted-foreground ml-2">ক্রম: {b.sort_order}</span>
              </div>
              <button onClick={() => handleDelete(b.id)} className="text-destructive hover:bg-destructive/10 p-1 rounded"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>নতুন ব্যানার</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="ছবির URL" required />
            <Input value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} placeholder="লিংক (e.g. /products)" />
            <Select value={form.position} onValueChange={(v: 'hero' | 'promo') => setForm(f => ({ ...f, position: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="hero">হিরো ব্যানার</SelectItem>
                <SelectItem value="promo">প্রোমো ব্যানার</SelectItem>
              </SelectContent>
            </Select>
            <Input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} placeholder="ক্রম" />
            <label className="flex items-center gap-2 text-sm"><Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} /> একটিভ</label>
            <Button type="submit" className="w-full">যোগ করুন</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBanners;
