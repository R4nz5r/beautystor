import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import { toast } from 'sonner';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmed, setConfirmed] = useState('');

  useEffect(() => {
    // Check for recovery token in URL
    const hash = window.location.hash;
    if (!hash.includes('type=recovery')) {
      toast.error('অবৈধ রিসেট লিংক');
      navigate('/login');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmed) { toast.error('পাসওয়ার্ড মিলছে না'); return; }
    if (password.length < 6) { toast.error('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে'); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) toast.error(error.message);
    else { toast.success('পাসওয়ার্ড আপডেট হয়েছে!'); navigate('/login'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md bg-card border rounded-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-6">নতুন পাসওয়ার্ড সেট করুন</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">নতুন পাসওয়ার্ড</label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="কমপক্ষে ৬ অক্ষর" required />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">পাসওয়ার্ড নিশ্চিত করুন</label>
              <Input type="password" value={confirmed} onChange={e => setConfirmed(e.target.value)} placeholder="আবার পাসওয়ার্ড দিন" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'আপডেট হচ্ছে...' : 'পাসওয়ার্ড আপডেট করুন'}
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ResetPassword;
