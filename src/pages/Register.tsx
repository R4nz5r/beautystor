import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import { toast } from 'sonner';
import { validateName, validateEmail, validatePhone, validatePassword } from '@/lib/validators';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const updateField = (field: string, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: null }));
  };

  const validate = () => {
    const e = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      phone: validatePhone(form.phone),
      password: validatePassword(form.password),
    };
    setErrors(e);
    return !Object.values(e).some(Boolean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { name: form.name, phone: form.phone },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('রেজিস্ট্রেশন সফল! ইমেইল ভেরিফাই করুন।');
      navigate('/login');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-card border rounded-lg p-8">
            <h1 className="text-2xl font-bold text-center mb-6">রেজিস্টার</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">নাম</label>
                <Input value={form.name} onChange={e => updateField('name', e.target.value)} placeholder="আপনার নাম" />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">ফোন নম্বর</label>
                <Input value={form.phone} onChange={e => updateField('phone', e.target.value)} placeholder="01XXXXXXXXX" />
                {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">ইমেইল</label>
                <Input type="email" value={form.email} onChange={e => updateField('email', e.target.value)} placeholder="আপনার ইমেইল" />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">পাসওয়ার্ড</label>
                <Input type="password" value={form.password} onChange={e => updateField('password', e.target.value)} placeholder="কমপক্ষে ৬ অক্ষর" />
                {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'রেজিস্টার হচ্ছে...' : 'রেজিস্টার করুন'}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-4">
              ইতিমধ্যে অ্যাকাউন্ট আছে? <Link to="/login" className="text-primary hover:underline font-medium">লগইন করুন</Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Register;
