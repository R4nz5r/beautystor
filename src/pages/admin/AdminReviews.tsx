import { useEffect, useState } from 'react';
import { Check, X, Star, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const AdminReviews = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ name: '', rating: 5, comment: '' });

  const load = async () => {
    const { data } = await supabase.from('reviews').select('*, product:products(name)').order('created_at', { ascending: false });
    if (data) setReviews(data);
  };

  useEffect(() => { load(); }, []);

  const updateApproval = async (id: string, approved: boolean) => {
    await supabase.from('reviews').update({ approved }).eq('id', id);
    toast.success(approved ? 'অ্যাপ্রুভ করা হয়েছে' : 'রিজেক্ট করা হয়েছে');
    load();
  };

  const toggleFeatured = async (id: string, featured: boolean) => {
    await supabase.from('reviews').update({ featured } as any).eq('id', id);
    toast.success(featured ? 'হোমপেজে দেখানো হবে' : 'হোমপেজ থেকে সরানো হয়েছে');
    load();
  };

  const deleteReview = async (id: string) => {
    if (!confirm('রিভিউ ডিলিট করতে চান?')) return;
    await supabase.from('reviews').delete().eq('id', id);
    toast.success('রিভিউ ডিলিট করা হয়েছে');
    load();
  };

  const startEdit = (r: any) => {
    setEditingId(r.id);
    setEditData({ name: r.name || '', rating: r.rating, comment: r.comment || '' });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    await supabase.from('reviews').update({
      name: editData.name || null,
      rating: editData.rating,
      comment: editData.comment,
    }).eq('id', editingId);
    toast.success('রিভিউ আপডেট হয়েছে');
    setEditingId(null);
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">রিভিউ ম্যানেজমেন্ট</h1>
      <div className="bg-card border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-medium">প্রোডাক্ট</th>
              <th className="text-left p-3 font-medium">নাম</th>
              <th className="text-left p-3 font-medium">রেটিং</th>
              <th className="text-left p-3 font-medium">মন্তব্য</th>
              <th className="text-left p-3 font-medium">স্ট্যাটাস</th>
              <th className="text-left p-3 font-medium">হোমপেজ</th>
              <th className="text-left p-3 font-medium">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {reviews.map(r => (
              <tr key={r.id} className="hover:bg-muted/50">
                <td className="p-3">{r.product?.name || '-'}</td>
                <td className="p-3">
                  {editingId === r.id ? (
                    <Input value={editData.name} onChange={e => setEditData(d => ({ ...d, name: e.target.value }))} className="h-8 text-xs w-24" />
                  ) : r.name || '-'}
                </td>
                <td className="p-3">
                  {editingId === r.id ? (
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(i => (
                        <button key={i} onClick={() => setEditData(d => ({ ...d, rating: i }))}>
                          <Star className={`h-3.5 w-3.5 ${i <= editData.rating ? 'fill-beauty-gold text-beauty-gold' : 'text-muted'}`} />
                        </button>
                      ))}
                    </div>
                  ) : '★'.repeat(r.rating)}
                </td>
                <td className="p-3 max-w-xs">
                  {editingId === r.id ? (
                    <Textarea value={editData.comment} onChange={e => setEditData(d => ({ ...d, comment: e.target.value }))} className="text-xs min-h-[40px]" rows={2} />
                  ) : <span className="truncate block">{r.comment}</span>}
                </td>
                <td className="p-3">
                  {r.approved ? <span className="text-green-600 text-xs">অ্যাপ্রুভড</span> : <span className="text-amber-600 text-xs">পেন্ডিং</span>}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => toggleFeatured(r.id, !r.featured)}
                    className={`text-xs px-2 py-1 rounded ${r.featured ? 'bg-primary/20 text-primary font-medium' : 'bg-muted text-muted-foreground'}`}
                  >
                    {r.featured ? '✓ দেখানো হচ্ছে' : 'দেখান'}
                  </button>
                </td>
                <td className="p-3">
                  <div className="flex gap-1">
                    {editingId === r.id ? (
                      <>
                        <Button size="icon" variant="ghost" onClick={saveEdit} className="h-7 w-7 text-green-600"><Check className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => setEditingId(null)} className="h-7 w-7 text-muted-foreground"><X className="h-3.5 w-3.5" /></Button>
                      </>
                    ) : (
                      <>
                        {!r.approved && <button onClick={() => updateApproval(r.id, true)} className="p-1.5 hover:bg-green-100 rounded text-green-600"><Check className="h-4 w-4" /></button>}
                        {r.approved && <button onClick={() => updateApproval(r.id, false)} className="p-1.5 hover:bg-destructive/10 rounded text-destructive"><X className="h-4 w-4" /></button>}
                        <button onClick={() => startEdit(r)} className="p-1.5 hover:bg-muted rounded text-muted-foreground"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => deleteReview(r.id)} className="p-1.5 hover:bg-destructive/10 rounded text-destructive"><Trash2 className="h-4 w-4" /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reviews.length === 0 && <p className="text-center py-8 text-muted-foreground">কোনো রিভিউ নেই</p>}
      </div>
    </div>
  );
};

export default AdminReviews;
