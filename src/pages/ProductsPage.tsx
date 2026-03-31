import { useEffect, useState } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/store/ProductCard';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const ProductsPage = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    supabase.from('categories').select('*').order('sort_order')
      .then(({ data }) => { if (data) setCategories(data); });
  }, []);

  useEffect(() => {
    let query = supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false });
    if (selectedCat !== 'all') query = query.eq('category_id', selectedCat);
    if (featuredOnly) query = query.eq('featured', true);
    if (searchQuery.trim()) query = query.ilike('name', `%${searchQuery.trim()}%`);
    query.then(({ data }) => {
      if (data) setProducts(data.map(p => ({ ...p, images: typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []) })));
    });
  }, [selectedCat, featuredOnly, searchQuery]);

  const clearFilters = () => {
    setSelectedCat('all');
    setSearchQuery('');
    setFeaturedOnly(false);
  };

  const hasActiveFilters = selectedCat !== 'all' || searchQuery.trim() || featuredOnly;

  const FilterPanel = () => (
    <div className="space-y-6">
      <h2 className="text-lg font-bold">ফিল্টার</h2>

      {/* Search */}
      <div>
        <Label className="text-sm font-medium mb-2 block">সার্চ</Label>
        <div className="relative">
          <Input
            placeholder="প্রোডাক্ট খুঁজুন..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pr-8"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category */}
      <div>
        <Label className="text-sm font-medium mb-3 block">ক্যাটাগরি</Label>
        <RadioGroup value={selectedCat} onValueChange={setSelectedCat} className="space-y-2">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="all" id="cat-all" />
            <Label htmlFor="cat-all" className="text-sm cursor-pointer">সব ক্যাটাগরি</Label>
          </div>
          {categories.map(c => (
            <div key={c.id} className="flex items-center gap-2">
              <RadioGroupItem value={c.id} id={`cat-${c.id}`} />
              <Label htmlFor={`cat-${c.id}`} className="text-sm cursor-pointer">{c.name}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Featured only */}
      <div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="featured-only"
            checked={featuredOnly}
            onCheckedChange={(checked) => setFeaturedOnly(checked === true)}
          />
          <Label htmlFor="featured-only" className="text-sm cursor-pointer">শুধু ফিচার্ড প্রোডাক্ট</Label>
        </div>
      </div>

      {/* Clear */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-destructive hover:text-destructive">
          <X className="h-4 w-4" /> ফিল্টার ক্লিয়ার করুন
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">সকল প্রোডাক্ট</h1>
            {/* Mobile filter toggle */}
            <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="md:hidden gap-2">
                  <SlidersHorizontal className="h-4 w-4" /> ফিল্টার
                  {hasActiveFilters && <span className="h-2 w-2 rounded-full bg-primary" />}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-6">
                <FilterPanel />
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex gap-8">
            {/* Desktop sidebar */}
            <aside className="hidden md:block w-60 shrink-0">
              <div className="sticky top-20 border rounded-lg p-5">
                <FilterPanel />
              </div>
            </aside>

            {/* Products grid */}
            <div className="flex-1">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
              {products.length === 0 && (
                <p className="text-muted-foreground text-center py-12">কোনো প্রোডাক্ট পাওয়া যায়নি</p>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductsPage;
