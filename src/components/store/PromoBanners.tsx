import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const PromoBanners = () => {
  const [banners, setBanners] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('banners').select('*').eq('position', 'promo').eq('is_active', true).order('sort_order').limit(2)
      .then(({ data }) => { if (data) setBanners(data); });
  }, []);

  if (banners.length < 2) return null;

  return (
    <section className="py-8 md:py-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map(b => (
            <Link key={b.id} to={b.link || '/products'} className="rounded-lg overflow-hidden aspect-[2/1] bg-muted group">
              <img src={b.image_url} alt="Promo" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromoBanners;
