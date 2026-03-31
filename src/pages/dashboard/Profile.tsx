import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { validateName, validatePhone } from '@/lib/validators';

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('*').eq('user_id', user.id).single()
      .then(({ data }) => {
        if (data) setForm({ name: data.name || '', phone: data.phone || '', address: data.address || '' });
      });
  }, [user]);

  const updateField = (field: string, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: null }));
  };

  const validate = () => {
    const e = {
      name: validateName(form.name),
      phone: validatePhone(form.phone, false),
    };
    setErrors(e);
    return !Object.values(e).some(Boolean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!validate()) return;
    setLoading(true);
    const { error } = await supabase.from('profiles').update(form).eq('user_id', user.id);
    if (error) toast.error('আপডেট ব্যর্থ');
    else toast.success('প্রোফাইল আপডেট হয়েছে');
    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">প্রোফাইল সেটিংস</h2>
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">নাম</label>
          <Input value={form.name} onChange={e => updateField('name', e.target.value)} />
          {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">ফোন</label>
          <Input value={form.phone} onChange={e => updateField('phone', e.target.value)} />
          {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">ঠিকানা</label>
          <Input value={form.address} onChange={e => updateField('address', e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">ইমেইল</label>
          <Input value={user?.email || ''} disabled className="bg-muted" />
        </div>
        <Button type="submit" disabled={loading}>{loading ? 'সেভ হচ্ছে...' : 'সেভ করুন'}</Button>
      </form>
    </div>
  );
};

export default Profile;
