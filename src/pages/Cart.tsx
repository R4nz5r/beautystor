import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';

const Cart = () => {
  const { items, updateQuantity, removeFromCart, subtotal } = useCart();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-6">
          <h1 className="text-2xl font-bold mb-6">কার্ট</h1>

          {items.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground mb-4">আপনার কার্ট খালি</p>
              <Button asChild><Link to="/products">শপিং শুরু করুন</Link></Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-4">
                {items.map(item => (
                  <div key={item.id} className="flex gap-4 border rounded-lg p-4">
                    <Link to={`/products/${item.slug}`} className="w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/products/${item.slug}`} className="font-medium text-sm line-clamp-1 hover:text-primary">{item.name}</Link>
                      <p className="text-sm text-primary font-bold mt-1">
                        ৳{((item.sale_price || item.price) * item.quantity).toLocaleString('bn-BD')}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border rounded-md">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-muted"><Minus className="h-3 w-3" /></button>
                          <span className="px-3 text-sm">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-muted"><Plus className="h-3 w-3" /></button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="p-1 text-destructive hover:bg-destructive/10 rounded">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-card border rounded-lg p-6 h-fit">
                <h3 className="font-bold mb-4">অর্ডার সামারি</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">সাবটোটাল</span>
                    <span>৳{subtotal.toLocaleString('bn-BD')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ডেলিভারি চার্জ</span>
                    <span>{subtotal >= 500 ? 'ফ্রি' : '৳৮০'}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-base">
                    <span>মোট</span>
                    <span className="text-primary">৳{(subtotal + (subtotal >= 500 ? 0 : 80)).toLocaleString('bn-BD')}</span>
                  </div>
                </div>
                <Button asChild className="w-full mt-4">
                  <Link to="/checkout">চেকআউট করুন</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
