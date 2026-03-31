import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/store/ProductCard';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';

const CategoryPage = () => {
  const { slug } = useParams();
  const [products, setProducts] = useState<any[]>([]);
  const [category, setCategory] = useState<any>(null);

  useEffect(() => {
    if (!slug) return;
    supabase.from('categories').select('*').eq('slug', slug).single()
      .then(({ data }) => {
        if (data) {
          setCategory(data);
          supabase.from('products').select('*').eq('category_id', data.id).eq('is_active', true)
            .then(({ data: prods }) => {
              if (prods) setProducts(prods.map(p => ({ ...p, images: typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []) })));
            });
        }
      });
  }, [slug]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-6">
          <h1 className="text-2xl font-bold mb-6">{category?.name || 'ক্যাটাগরি'}</h1>
          {products.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">কোনো প্রোডাক্ট পাওয়া যায়নি</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CategoryPage;
