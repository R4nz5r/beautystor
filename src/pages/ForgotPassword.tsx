import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import { toast } from 'sonner';

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else { setSent(true); toast.success('পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md bg-card border rounded-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-6">পাসওয়ার্ড রিসেট</h1>
          {sent ? (
            <div className="text-center">
              <p className="text-muted-foreground mb-4">আপনার ইমেইলে পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে।</p>
              <Link to="/login" className="text-primary hover:underline">লগইনে ফিরুন</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">ইমেইল</label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="আপনার ইমেইল" required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'পাঠানো হচ্ছে...' : 'রিসেট লিংক পাঠান'}
              </Button>
              <p className="text-center text-sm"><Link to="/login" className="text-primary hover:underline">লগইনে ফিরুন</Link></p>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
