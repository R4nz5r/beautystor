import { NavLink as RouterNavLink, Outlet, useNavigate } from 'react-router-dom';
import { Package, Heart, MapPin, User, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { RequireAuth } from '@/hooks/useAuth';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import { toast } from 'sonner';

const links = [
  { to: '/dashboard', icon: Package, label: 'অর্ডার', end: true },
  { to: '/dashboard/wishlist', icon: Heart, label: 'উইশলিস্ট' },
  { to: '/dashboard/addresses', icon: MapPin, label: 'ঠিকানা' },
  { to: '/dashboard/profile', icon: User, label: 'প্রোফাইল' },
];

const DashboardLayout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('লগআউট সফল');
    navigate('/');
  };

  return (
    <RequireAuth>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="container py-6">
            <h1 className="text-2xl font-bold mb-6">আমার অ্যাকাউন্ট</h1>
            <div className="grid md:grid-cols-4 gap-6">
              <aside className="space-y-1">
                {links.map(l => (
                  <RouterNavLink
                    key={l.to}
                    to={l.to}
                    end={l.end}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`
                    }
                  >
                    <l.icon className="h-4 w-4" />
                    {l.label}
                  </RouterNavLink>
                ))}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 w-full transition-colors"
                >
                  <LogOut className="h-4 w-4" /> লগআউট
                </button>
              </aside>
              <div className="md:col-span-3">
                <Outlet />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </RequireAuth>
  );
};

export default DashboardLayout;
