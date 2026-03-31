import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/store/ProductCard';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';

const ProductsPage = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('categories').select('*').order('sort_order')
      .then(({ data }) => { if (data) setCategories(data); });
  }, []);

  useEffect(() => {
    let query = supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false });
    if (selectedCat) query = query.eq('category_id', selectedCat);
    query.then(({ data }) => {
      if (data) setProducts(data.map(p => ({ ...p, images: typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []) })));
    });
  }, [selectedCat]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-6">
          <h1 className="text-2xl font-bold mb-6">সকল প্রোডাক্ট</h1>

          {/* Category filter */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
            <button
              onClick={() => setSelectedCat(null)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${!selectedCat ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
            >
              সব
            </button>
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCat(c.id)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${selectedCat === c.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          {products.length === 0 && (
            <p className="text-muted-foreground text-center py-12">কোনো প্রোডাক্ট পাওয়া যায়নি</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductsPage;
