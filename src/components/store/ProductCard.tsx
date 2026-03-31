import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';

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
  const image = product.images?.[0] || '/placeholder.svg';
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const discountPercent = hasDiscount ? Math.round((1 - product.sale_price! / product.price) * 100) : 0;

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
