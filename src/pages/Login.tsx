import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import { toast } from 'sonner';
import { validateEmail, validatePassword } from '@/lib/validators';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const validate = () => {
    const e = {
      email: validateEmail(email),
      password: password ? null : 'পাসওয়ার্ড দিন',
    };
    setErrors(e);
    return !Object.values(e).some(Boolean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes('Email not confirmed')) {
        toast.error('ইমেইল ভেরিফাই করা হয়নি। আপনার ইনবক্স চেক করুন।');
      } else {
        toast.error('লগইন ব্যর্থ হয়েছে। ইমেইল ও পাসওয়ার্ড চেক করুন।');
      }
    } else {
      toast.success('সফলভাবে লগইন হয়েছে!');
      navigate('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-card border rounded-lg p-8">
            <h1 className="text-2xl font-bold text-center mb-6">লগইন</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">ইমেইল</label>
                <Input type="email" value={email} onChange={e => { setEmail(e.target.value); setErrors(er => ({ ...er, email: null })); }} placeholder="আপনার ইমেইল" />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">পাসওয়ার্ড</label>
                <Input type="password" value={password} onChange={e => { setPassword(e.target.value); setErrors(er => ({ ...er, password: null })); }} placeholder="পাসওয়ার্ড" />
                {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
              </div>
              <div className="text-right">
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">পাসওয়ার্ড ভুলে গেছেন?</Link>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-4">
              অ্যাকাউন্ট নেই? <Link to="/register" className="text-primary hover:underline font-medium">রেজিস্টার করুন</Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
