import { useEffect, useState } from 'react';
import { MapPin, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { validateRequired, validatePhone } from '@/lib/validators';

const Addresses = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: 'বাড়ি', full_address: '', phone: '' });
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from('addresses').select('*').eq('user_id', user.id).order('created_at');
    if (data) setAddresses(data);
  };

  useEffect(() => { load(); }, [user]);

  const updateField = (field: string, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: null }));
  };

  const validate = () => {
    const e = {
      full_address: validateRequired(form.full_address, 'ঠিকানা', 5),
      phone: validatePhone(form.phone, false),
    };
    setErrors(e);
    return !Object.values(e).some(Boolean);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!validate()) return;
    const { error } = await supabase.from('addresses').insert({ ...form, user_id: user.id });
    if (error) toast.error('ঠিকানা যোগ করতে সমস্যা হয়েছে');
    else { toast.success('ঠিকানা যোগ হয়েছে'); setShowForm(false); setForm({ label: 'বাড়ি', full_address: '', phone: '' }); setErrors({}); load(); }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('addresses').delete().eq('id', id);
    setAddresses(prev => prev.filter(a => a.id !== id));
    toast.success('ঠিকানা মুছে ফেলা হয়েছে');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">সংরক্ষিত ঠিকানা</h2>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="gap-1"><Plus className="h-4 w-4" /> নতুন ঠিকানা</Button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="border rounded-lg p-4 mb-4 space-y-3">
          <Input value={form.label} onChange={e => updateField('label', e.target.value)} placeholder="লেবেল (বাড়ি/অফিস)" />
          <div>
            <Input value={form.full_address} onChange={e => updateField('full_address', e.target.value)} placeholder="বিস্তারিত ঠিকানা" />
            {errors.full_address && <p className="text-xs text-destructive mt-1">{errors.full_address}</p>}
          </div>
          <div>
            <Input value={form.phone} onChange={e => updateField('phone', e.target.value)} placeholder="ফোন নম্বর" />
            {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm">সেভ করুন</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => { setShowForm(false); setErrors({}); }}>বাতিল</Button>
          </div>
        </form>
      )}

      {addresses.length === 0 && !showForm ? (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">কোনো ঠিকানা নেই</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map(a => (
            <div key={a.id} className="border rounded-lg p-4 flex justify-between items-start">
              <div>
                <p className="font-medium text-sm">{a.label}</p>
                <p className="text-sm text-muted-foreground">{a.full_address}</p>
                {a.phone && <p className="text-xs text-muted-foreground mt-1">{a.phone}</p>}
              </div>
              <button onClick={() => handleDelete(a.id)} className="text-destructive hover:bg-destructive/10 p-1 rounded">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Addresses;
