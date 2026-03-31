import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";

import Index from "./pages/Index";
import ProductsPage from "./pages/ProductsPage";
import ProductDetail from "./pages/ProductDetail";
import CategoryPage from "./pages/CategoryPage";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import SearchPage from "./pages/SearchPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

// Dashboard
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import MyOrders from "./pages/dashboard/MyOrders";
import OrderDetail from "./pages/dashboard/OrderDetail";
import Wishlist from "./pages/dashboard/Wishlist";
import Addresses from "./pages/dashboard/Addresses";
import Profile from "./pages/dashboard/Profile";

// Admin
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminBanners from "./pages/admin/AdminBanners";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Storefront */}
            <Route path="/" element={<Index />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:slug" element={<ProductDetail />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
            <Route path="/search" element={<SearchPage />} />

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* User Dashboard */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<MyOrders />} />
              <Route path="orders/:id" element={<OrderDetail />} />
              <Route path="wishlist" element={<Wishlist />} />
              <Route path="addresses" element={<Addresses />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Admin */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="banners" element={<AdminBanners />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
