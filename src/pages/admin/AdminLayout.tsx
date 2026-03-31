import { NavLink as RouterNavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, Image, Star, Settings, LogOut, ChevronLeft, Tag, AlertCircle, BarChart3 } from 'lucide-react';
import { useIsAdmin, useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

const links = [
  { to: '/admin', icon: LayoutDashboard, label: 'ড্যাশবোর্ড', end: true },
  { to: '/admin/orders', icon: ShoppingCart, label: 'অর্ডার' },
  { to: '/admin/incomplete-orders', icon: AlertCircle, label: 'ইনকমপ্লিট অর্ডার' },
  { to: '/admin/recovery-analytics', icon: BarChart3, label: 'রিকভারি অ্যানালিটিক্স' },
  { to: '/admin/products', icon: Package, label: 'প্রোডাক্ট' },
  { to: '/admin/categories', icon: Package, label: 'ক্যাটাগরি' },
  { to: '/admin/customers', icon: Users, label: 'কাস্টমার' },
  { to: '/admin/coupons', icon: Tag, label: 'কুপন' },
  { to: '/admin/banners', icon: Image, label: 'ব্যানার' },
  { to: '/admin/reviews', icon: Star, label: 'রিভিউ' },
  { to: '/admin/settings', icon: Settings, label: 'সেটিংস' },
];

const AdminLayout = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
    if (!authLoading && !roleLoading && user && !isAdmin) navigate('/');
  }, [user, isAdmin, authLoading, roleLoading, navigate]);

  if (authLoading || roleLoading) return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">লোড হচ্ছে...</p></div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-card border-r flex flex-col transition-all duration-200 flex-shrink-0`}>
        <div className="p-4 border-b flex items-center justify-between">
          {sidebarOpen && <h2 className="font-bold text-primary text-lg">অ্যাডমিন</h2>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-muted rounded">
            <ChevronLeft className={`h-5 w-5 transition-transform ${!sidebarOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {links.map(l => (
            <RouterNavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-foreground/80'}`
              }
              title={l.label}
            >
              <l.icon className="h-4 w-4 flex-shrink-0" />
              {sidebarOpen && <span>{l.label}</span>}
            </RouterNavLink>
          ))}
        </nav>
        <div className="p-2 border-t">
          <button
            onClick={async () => { await supabase.auth.signOut(); navigate('/'); }}
            className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 w-full transition-colors"
          >
            <LogOut className="h-4 w-4" />
            {sidebarOpen && <span>লগআউট</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
