import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, ArrowLeft, Star, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import { toast } from 'sonner';

const ProductDetail = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    if (!slug) return;
    supabase.from('products').select('*').eq('slug', slug).single()
      .then(({ data }) => {
        if (data) {
          const parsed = { ...data, images: typeof data.images === 'string' ? JSON.parse(data.images) : (data.images || []) };
          setProduct(parsed);
          supabase.from('reviews').select('*').eq('product_id', data.id).eq('approved', true)
            .then(({ data: r }) => { if (r) setReviews(r); });
        }
      });
  }, [slug]);

  useEffect(() => {
    if (!user || !product) return;
    supabase.from('wishlists').select('id').eq('user_id', user.id).eq('product_id', product.id).maybeSingle()
      .then(({ data }) => { if (data) setWishlisted(true); });
  }, [user, product?.id]);

  const toggleWishlist = async () => {
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

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">লোড হচ্ছে...</p>
        </div>
        <Footer />
      </div>
    );
  }

  const image = product.images?.[selectedImage] || '/placeholder.svg';
  const hasDiscount = product.sale_price && product.sale_price < product.price;

  const getCartItem = () => ({
    id: product.id,
    name: product.name,
    price: product.price,
    sale_price: product.sale_price,
    image: product.images?.[0] || '/placeholder.svg',
    slug: product.slug,
  });

  const handleAddToCart = () => {
    addToCart(getCartItem(), qty);
  };

  const handleBuyNow = () => {
    addToCart(getCartItem(), qty);
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-6">
          <Link to="/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-4">
            <ArrowLeft className="h-4 w-4" /> প্রোডাক্টে ফিরে যান
          </Link>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Images */}
            <div>
              <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-3">
                <img src={image} alt={product.name} className="w-full h-full object-cover" />
              </div>
              {product.images?.length > 1 && (
                <div className="flex gap-2">
                  {product.images.map((img: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`w-16 h-16 rounded-md overflow-hidden border-2 ${i === selectedImage ? 'border-primary' : 'border-transparent'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-3">{product.name}</h1>

              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl font-bold text-primary">
                  ৳{(product.sale_price || product.price).toLocaleString('bn-BD')}
                </span>
                {hasDiscount && (
                  <span className="text-lg text-muted-foreground line-through">
                    ৳{product.price.toLocaleString('bn-BD')}
                  </span>
                )}
              </div>

              <p className="text-muted-foreground mb-6">{product.description}</p>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center border rounded-md">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="p-2 hover:bg-muted"><Minus className="h-4 w-4" /></button>
                  <span className="px-4 font-medium">{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} className="p-2 hover:bg-muted"><Plus className="h-4 w-4" /></button>
                </div>
                <span className="text-sm text-muted-foreground">স্টক: {product.stock}</span>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleAddToCart} className="flex-1 gap-2">
                  <ShoppingBag className="h-4 w-4" /> কার্টে যোগ করুন
                </Button>
                <Button variant="secondary" asChild>
                  <Link to="/checkout">এখনই কিনুন</Link>
                </Button>
                <Button variant="outline" size="icon" onClick={toggleWishlist} className="shrink-0">
                  <Heart className={`h-5 w-5 ${wishlisted ? 'fill-destructive text-destructive' : ''}`} />
                </Button>
              </div>
            </div>
          </div>

          {/* Reviews */}
          {reviews.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-bold mb-4">রিভিউ ({reviews.length})</h2>
              <div className="space-y-4">
                {reviews.map(r => (
                  <div key={r.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < r.rating ? 'fill-beauty-gold text-beauty-gold' : 'text-muted'}`} />
                      ))}
                    </div>
                    <p className="text-sm mb-1">{r.comment}</p>
                    <p className="text-xs text-muted-foreground">{r.name || 'গ্রাহক'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
