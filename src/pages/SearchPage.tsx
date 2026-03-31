import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/store/ProductCard';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';

const SearchPage = () => {
  const [params] = useSearchParams();
  const query = params.get('q') || '';
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (!query.trim()) return;
    supabase.from('products').select('*').eq('is_active', true).ilike('name', `%${query}%`)
      .then(({ data }) => {
        if (data) setProducts(data.map(p => ({ ...p, images: typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []) })));
      });
  }, [query]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-6">
          <h1 className="text-2xl font-bold mb-2">সার্চ রেজাল্ট</h1>
          <p className="text-muted-foreground mb-6">"{query}" এর জন্য {products.length}টি প্রোডাক্ট পাওয়া গেছে</p>
          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <p className="text-center py-12 text-muted-foreground">কোনো প্রোডাক্ট পাওয়া যায়নি</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SearchPage;
