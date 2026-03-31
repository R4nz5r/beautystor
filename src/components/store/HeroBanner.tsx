import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Banner {
  id: string;
  image_url: string;
  link: string | null;
}

const HeroBanner = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    supabase.from('banners').select('*').eq('position', 'hero').eq('is_active', true).order('sort_order')
      .then(({ data }) => { if (data) setBanners(data); });
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => setCurrent(c => (c + 1) % banners.length), 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (!banners.length) {
    return (
      <div className="w-full aspect-[21/9] md:aspect-[3/1] bg-gradient-to-r from-secondary to-accent flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2">আপনার সৌন্দর্যের যত্ন নিন</h1>
          <p className="text-muted-foreground">সেরা মানের বিউটি প্রোডাক্ট</p>
        </div>
      </div>
    );
  }

  const banner = banners[current];

  return (
    <div className="relative w-full aspect-[21/9] md:aspect-[3/1] overflow-hidden bg-muted">
      <Link to={banner.link || '/products'}>
        <img src={banner.image_url} alt="Banner" className="w-full h-full object-cover" />
      </Link>

      {banners.length > 1 && (
        <>
          <button
            onClick={() => setCurrent(c => (c - 1 + banners.length) % banners.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full p-2 hover:bg-background transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setCurrent(c => (c + 1) % banners.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full p-2 hover:bg-background transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all ${i === current ? 'w-6 bg-primary' : 'w-2 bg-background/60'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HeroBanner;
