import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AdminReviews = () => {
  const [reviews, setReviews] = useState<any[]>([]);

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
              <th className="text-left p-3 font-medium">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {reviews.map(r => (
              <tr key={r.id} className="hover:bg-muted/50">
                <td className="p-3">{r.product?.name || '-'}</td>
                <td className="p-3">{r.name || '-'}</td>
                <td className="p-3">{'★'.repeat(r.rating)}</td>
                <td className="p-3 max-w-xs truncate">{r.comment}</td>
                <td className="p-3">{r.approved ? <span className="text-green-600 text-xs">অ্যাপ্রুভড</span> : <span className="text-amber-600 text-xs">পেন্ডিং</span>}</td>
                <td className="p-3 flex gap-1">
                  {!r.approved && <button onClick={() => updateApproval(r.id, true)} className="p-1.5 hover:bg-green-100 rounded text-green-600"><Check className="h-4 w-4" /></button>}
                  {r.approved && <button onClick={() => updateApproval(r.id, false)} className="p-1.5 hover:bg-destructive/10 rounded text-destructive"><X className="h-4 w-4" /></button>}
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
