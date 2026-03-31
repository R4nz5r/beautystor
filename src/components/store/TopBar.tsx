import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const TopBar = () => {
  const [text, setText] = useState('সকল প্রোডাক্টে ১৫% ছাড় চলছে! | ৫০০ টাকার উপরে ফ্রি ডেলিভারি');

  useEffect(() => {
    supabase.from('site_settings').select('value').eq('key', 'announcement_text').single()
      .then(({ data }) => { if (data?.value) setText(data.value); });
  }, []);

  return (
    <div className="bg-primary text-primary-foreground py-2 overflow-hidden">
      <div className="animate-marquee whitespace-nowrap text-sm font-medium">
        {text}
      </div>
    </div>
  );
};

export default TopBar;
