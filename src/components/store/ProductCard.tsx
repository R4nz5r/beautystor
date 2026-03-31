import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  images: string[];
}

const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [wishlisted, setWishlisted] = useState(false);
  const image = product.images?.[0] || '/placeholder.svg';
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const discountPercent = hasDiscount ? Math.round((1 - product.sale_price! / product.price) * 100) : 0;

  useEffect(() => {
    if (!user) return;
    supabase.from('wishlists').select('id').eq('user_id', user.id).eq('product_id', product.id).maybeSingle()
      .then(({ data }) => { if (data) setWishlisted(true); });
  }, [user, product.id]);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      sale_price: product.sale_price,
      image,
      slug: product.slug,
    });
  };

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { toast.error('উইশলিস্টে যোগ করতে লগইন করুন'); return; }
    if (wishlisted) {
      await supabase.from('wishlists').delete().eq('user_id', user.id).eq('product_id', product.id);
      setWishlisted(false);
      toast.success('উইশলিস্ট থেকে সরানো হয়েছে');
    } else {
      await supabase.from('wishlists').insert({ user_id: user.id, product_id: product.id });
      setWishlisted(true);
      toast.success('উইশলিস্টে যোগ করা হয়েছে');
    }
  };

  return (
    <Link to={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-square rounded-lg overflow-hidden bg-muted mb-3">
        <img
          src={image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
        />
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
            -{discountPercent}%
          </span>
        )}
        <button
          onClick={toggleWishlist}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
        >
          <Heart className={`h-4 w-4 ${wishlisted ? 'fill-destructive text-destructive' : 'text-foreground/70'}`} />
        </button>
        <Button
          size="icon"
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full h-9 w-9"
          onClick={handleAdd}
        >
          <ShoppingBag className="h-4 w-4" />
        </Button>
      </div>
      <h3 className="text-sm font-medium text-foreground line-clamp-2 mb-1">{product.name}</h3>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-primary">
          ৳{(product.sale_price || product.price).toLocaleString('bn-BD')}
        </span>
        {hasDiscount && (
          <span className="text-xs text-muted-foreground line-through">
            ৳{product.price.toLocaleString('bn-BD')}
          </span>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
