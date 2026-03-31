import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const Wishlist = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('wishlists')
      .select('*, product:products(*)')
      .eq('user_id', user.id);
    if (data) setItems(data);
  };

  useEffect(() => { load(); }, [user]);

  const remove = async (id: string) => {
    await supabase.from('wishlists').delete().eq('id', id);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">উইশলিস্ট</h2>
      {items.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">উইশলিস্ট খালি</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {items.map(item => {
            const p = item.product;
            if (!p) return null;
            const images = typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []);
            return (
              <div key={item.id} className="border rounded-lg overflow-hidden group">
                <Link to={`/products/${p.slug}`} className="block aspect-square bg-muted">
                  <img src={images[0] || '/placeholder.svg'} alt={p.name} className="w-full h-full object-cover" />
                </Link>
                <div className="p-3">
                  <Link to={`/products/${p.slug}`} className="text-sm font-medium line-clamp-1 hover:text-primary">{p.name}</Link>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-bold text-primary">৳{p.sale_price || p.price}</span>
                    <button onClick={() => remove(item.id)} className="text-destructive hover:bg-destructive/10 p-1 rounded">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
