import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('profiles').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setCustomers(data); });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">কাস্টমার তালিকা</h1>
      <div className="bg-card border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-medium">নাম</th>
              <th className="text-left p-3 font-medium">ফোন</th>
              <th className="text-left p-3 font-medium">ঠিকানা</th>
              <th className="text-left p-3 font-medium">তারিখ</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {customers.map(c => (
              <tr key={c.id} className="hover:bg-muted/50">
                <td className="p-3 font-medium">{c.name || '-'}</td>
                <td className="p-3">{c.phone || '-'}</td>
                <td className="p-3 text-muted-foreground">{c.address || '-'}</td>
                <td className="p-3 text-xs">{new Date(c.created_at).toLocaleDateString('bn-BD')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && <p className="text-center py-8 text-muted-foreground">কোনো কাস্টমার নেই</p>}
      </div>
    </div>
  );
};

export default AdminCustomers;
