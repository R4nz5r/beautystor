import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const AdminSettings = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from('site_settings').select('*')
      .then(({ data }) => {
        if (data) {
          const map: Record<string, string> = {};
          data.forEach(s => { map[s.key] = s.value || ''; });
          setSettings(map);
        }
      });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    for (const [key, value] of Object.entries(settings)) {
      await supabase.from('site_settings').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    }
    toast.success('সেটিংস সেভ হয়েছে');
    setLoading(false);
  };

  const update = (key: string, value: string) => setSettings(prev => ({ ...prev, [key]: value }));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">সাইট সেটিংস</h1>
      <div className="bg-card border rounded-lg p-6 max-w-xl space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">ঘোষণা টেক্সট (টপবার)</label>
          <Input value={settings.announcement_text || ''} onChange={e => update('announcement_text', e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">ডেলিভারি চার্জ (৳)</label>
          <Input type="number" value={settings.delivery_charge || ''} onChange={e => update('delivery_charge', e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">ফ্রি ডেলিভারি মিনিমাম (৳)</label>
          <Input type="number" value={settings.free_delivery_min || ''} onChange={e => update('free_delivery_min', e.target.value)} />
        </div>
        <Button onClick={handleSave} disabled={loading}>{loading ? 'সেভ হচ্ছে...' : 'সেভ করুন'}</Button>
      </div>
    </div>
  );
};

export default AdminSettings;
