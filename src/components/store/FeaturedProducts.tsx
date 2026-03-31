import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from './ProductCard';

const FeaturedProducts = () => {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('products').select('*').eq('featured', true).eq('is_active', true).limit(8)
      .then(({ data }) => {
        if (data) setProducts(data.map(p => ({ ...p, images: typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []) })));
      });
  }, []);

  if (!products.length) return null;

  return (
    <section className="py-8 md:py-12">
      <div className="container">
        <h2 className="text-xl md:text-2xl font-bold mb-6">ফিচার্ড প্রোডাক্ট</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
