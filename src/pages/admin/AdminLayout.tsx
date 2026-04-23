import { NavLink as RouterNavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, Image, Star, Settings, LogOut, ChevronLeft, Tag, AlertCircle, BarChart3, MessageCircle, Home } from 'lucide-react';
import { useIsAdmin, useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState, useRef } from 'react';

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
  { to: '/admin/chat', icon: MessageCircle, label: 'লাইভ চ্যাট' },
  { to: '/admin/settings', icon: Settings, label: 'সেটিংস' },
];

const AdminLayout = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [unreadChat, setUnreadChat] = useState(0);
  const locationRef = useRef(location.pathname);

  // Keep ref in sync
  useEffect(() => {
    locationRef.current = location.pathname;
  }, [location.pathname]);

  // Reset unread when on chat page and save last-seen timestamp
  useEffect(() => {
    if (location.pathname === '/admin/chat') {
      setUnreadChat(0);
      localStorage.setItem('admin_chat_last_seen', new Date().toISOString());
    }
  }, [location.pathname]);

  // Load initial unread count — only messages after last seen
  useEffect(() => {
    const loadUnread = async () => {
      const lastSeen = localStorage.getItem('admin_chat_last_seen') || new Date(0).toISOString();
      const { data: activeConversations } = await supabase
        .from('chat_conversations')
        .select('id')
        .neq('status', 'closed');

      const activeIds = (activeConversations || []).map((conversation) => conversation.id);
      if (activeIds.length === 0) {
        setUnreadChat(0);
        return;
      }

      const { count } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('sender_type', 'user')
        .in('conversation_id', activeIds)
        .gt('created_at', lastSeen);
      setUnreadChat(locationRef.current !== '/admin/chat' ? count || 0 : 0);
    };
    if (user && isAdmin) loadUnread();
  }, [user, isAdmin]);

  // Realtime subscription for new chat messages
  useEffect(() => {
    if (!user || !isAdmin) return;

    const channel = supabase
      .channel('admin-chat-unread-v2')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
      }, (payload: any) => {
        if (payload.new?.sender_type === 'user' && locationRef.current !== '/admin/chat') {
          supabase
            .from('chat_conversations')
            .select('status')
            .eq('id', payload.new.conversation_id)
            .maybeSingle()
            .then(({ data }) => {
              if (data?.status !== 'closed') {
                setUnreadChat(prev => prev + 1);
              }
            });
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_conversations',
      }, (payload: any) => {
        if (payload.new?.status === 'closed') {
          if (locationRef.current !== '/admin/chat') {
            const lastSeen = localStorage.getItem('admin_chat_last_seen') || new Date(0).toISOString();
            supabase
              .from('chat_messages')
              .select('*', { count: 'exact', head: true })
              .eq('sender_type', 'user')
              .gt('created_at', lastSeen)
              .then(({ count }) => setUnreadChat(count || 0));
          }
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, isAdmin]);

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
              key={l.to + l.label}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-foreground/80'}`
              }
              title={l.label}
            >
              <l.icon className="h-4 w-4 flex-shrink-0" />
              {sidebarOpen && <span>{l.label}</span>}
              {l.to === '/admin/chat' && unreadChat > 0 && (
                <span className="ml-auto bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {unreadChat > 99 ? '99+' : unreadChat}
                </span>
              )}
            </RouterNavLink>
          ))}
        </nav>
        <div className="p-2 border-t space-y-1">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium text-foreground/80 hover:bg-muted w-full transition-colors"
            title="হোম"
          >
            <Home className="h-4 w-4" />
            {sidebarOpen && <span>হোম</span>}
          </button>
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
