import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
}

const CategorySlider = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    supabase.from('categories').select('*').order('sort_order')
      .then(({ data }) => { if (data) setCategories(data); });
  }, []);

  return (
    <section className="py-8 md:py-12">
      <div className="container">
        <h2 className="text-xl md:text-2xl font-bold mb-6">ক্যাটাগরি</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {categories.map(cat => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="flex-shrink-0 w-24 md:w-32 text-center group"
            >
              <div className="w-20 h-20 md:w-28 md:h-28 mx-auto rounded-full overflow-hidden bg-secondary border-2 border-transparent group-hover:border-primary transition-colors">
                {cat.image_url ? (
                  <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-2xl">
                    {cat.name[0]}
                  </div>
                )}
              </div>
              <p className="mt-2 text-xs md:text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                {cat.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySlider;
