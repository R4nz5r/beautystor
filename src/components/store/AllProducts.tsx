import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from './ProductCard';
import { Button } from '@/components/ui/button';

const AllProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 8;

  const load = async (p: number) => {
    const { data } = await supabase
      .from('products').select('*').eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(p * limit, (p + 1) * limit - 1);
    if (data) {
      const parsed = data.map(d => ({ ...d, images: typeof d.images === 'string' ? JSON.parse(d.images) : (d.images || []) }));
      setProducts(prev => p === 0 ? parsed : [...prev, ...parsed]);
      setHasMore(data.length === limit);
    }
  };

  useEffect(() => { load(0); }, []);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    load(next);
  };

  return (
    <section className="py-8 md:py-12">
      <div className="container">
        <h2 className="text-xl md:text-2xl font-bold mb-6">সকল প্রোডাক্ট</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
        {hasMore && (
          <div className="mt-8 text-center">
            <Button variant="outline" onClick={loadMore}>আরও দেখুন</Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default AllProducts;
