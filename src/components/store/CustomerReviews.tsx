import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const CustomerReviews = () => {
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    (supabase.from('reviews').select('*').eq('approved', true) as any).eq('featured', true).limit(6)
      .then(({ data }: any) => { if (data) setReviews(data); });
  }, []);

  if (!reviews.length) return null;

  return (
    <section className="py-8 md:py-12 bg-secondary/50">
      <div className="container">
        <h2 className="text-xl md:text-2xl font-bold mb-6 text-center">কাস্টমার রিভিউ</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reviews.map(r => (
            <div key={r.id} className="bg-card rounded-lg p-5 shadow-sm">
              <div className="flex items-center gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < r.rating ? 'fill-beauty-gold text-beauty-gold' : 'text-muted'}`} />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-3">"{r.comment}"</p>
              <p className="text-sm font-medium">{r.name || 'গ্রাহক'}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CustomerReviews;
