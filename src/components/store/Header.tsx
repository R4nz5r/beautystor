import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, User, Search, Menu, X, Shield } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth, useIsAdmin } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const navLinks = [
  { label: 'হোম', href: '/' },
  { label: 'সকল প্রোডাক্ট', href: '/products' },
  { label: 'স্কিনকেয়ার', href: '/category/skincare' },
  { label: 'মেকআপ', href: '/category/makeup' },
  { label: 'হেয়ারকেয়ার', href: '/category/haircare' },
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { totalItems } = useCart();
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
      <div className="container flex items-center justify-between h-16">
        {/* Mobile menu toggle */}
        <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Logo */}
        <Link to="/" className="text-xl md:text-2xl font-bold text-primary">
          বিউটি স্টোর
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <Link key={link.href} to={link.href} className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-2">
          <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 hover:bg-muted rounded-full transition-colors">
            <Search className="h-5 w-5" />
          </button>
          {isAdmin && (
            <Link to="/admin" className="p-2 hover:bg-muted rounded-full transition-colors text-primary" title="অ্যাডমিন প্যানেল">
              <Shield className="h-5 w-5" />
            </Link>
          )}
          <Link to={user ? "/dashboard" : "/login"} className="p-2 hover:bg-muted rounded-full transition-colors">
            <User className="h-5 w-5" />
          </Link>
          <Link to="/cart" className="p-2 hover:bg-muted rounded-full transition-colors relative">
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Search overlay */}
      {searchOpen && (
        <div className="border-b bg-background p-4">
          <form onSubmit={handleSearch} className="container flex gap-2">
            <input
              type="text"
              placeholder="প্রোডাক্ট খুঁজুন..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              autoFocus
            />
            <Button type="submit" size="sm">খুঁজুন</Button>
          </form>
        </div>
      )}

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="md:hidden border-b bg-background">
          {navLinks.map(link => (
            <Link
              key={link.href}
              to={link.href}
              className="block px-4 py-3 text-sm font-medium hover:bg-muted transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Header;
