

# Bangladeshi Beauty Store - Implementation Plan

## Overview
A full-featured Bangladeshi beauty e-commerce store built in React + Vite with Supabase backend, Bangla language throughout, Google Sans typography, and a premium minimal design inspired by Shajgoj. Includes customer storefront, user dashboard, and admin panel — all in one app.

## Design Direction
- **Color palette**: Soft rose/pink primary (beauty vibe), warm neutrals, white backgrounds, subtle shadows
- **Typography**: Google Sans (loaded via Google Fonts)
- **Language**: All UI text in Bangla
- **Mobile-first**: Designed for mobile, scales up to desktop
- **Style**: Minimal, clean, premium feel with generous whitespace

---

## Phase 1: Database Schema (Supabase Migrations)

Create the following tables with RLS policies:

- **profiles** — user_id (FK auth.users), name, phone, address, avatar_url
- **categories** — id, name, slug, image_url, sort_order
- **products** — id, name, slug, description, price, sale_price, images (jsonb), category_id, stock, featured, is_active
- **reviews** — id, product_id, user_id, rating, comment, approved
- **orders** — id, user_id (nullable for guest), status (enum: pending/confirmed/processing/shipped/delivered/cancelled), subtotal, delivery_charge, discount, total, payment_method (cod/online), payment_status, shipping_address (jsonb), phone, name, tracking_number
- **order_items** — id, order_id, product_id, quantity, price
- **banners** — id, image_url, link, position (hero/promo), sort_order, is_active
- **site_settings** — id, key, value (for top bar news text, etc.)
- **user_roles** — id, user_id, role (enum: admin/user) with security definer function `has_role()`
- **wishlists** — id, user_id, product_id
- **addresses** — id, user_id, label, full_address, phone, is_default

Seed demo data: 6-8 categories, 20+ sample beauty products, hero banners, promo banners.

---

## Phase 2: Homepage & Storefront Layout

### Components to build:

1. **TopBar** — sliding/marquee Bangla announcement text
2. **Header** — logo, navigation menu (categories), search icon (opens search overlay), cart icon with badge, account icon; sticky on scroll; hamburger menu on mobile
3. **HeroBanner** — full-width image carousel/slider
4. **CategorySlider** — horizontal scrollable category cards with images
5. **FeaturedProducts** — product grid (4 cols desktop, 2 cols mobile)
6. **PromoBanners** — two side-by-side promotional image banners
7. **AllProducts** — paginated product grid with load more
8. **CustomerReviews** — testimonial carousel
9. **ComparisonSection** — "অন্যরা vs আমরা" comparison table
10. **KeyPointsCards** — trust badges / reasons to buy
11. **MoneyBackBanner** — guarantee banner card
12. **Footer** — links, contact info, social media, payment icons
13. **Copyright** — bottom bar

### Pages:
- `/` — Homepage
- `/products` — All products with filters
- `/products/:slug` — Product detail (images, description, price, add to cart, reviews)
- `/category/:slug` — Category products
- `/search` — Search results
- `/cart` — Cart page (add/remove/update quantities)
- `/checkout` — Checkout (guest or logged-in, address form, payment method selection)

---

## Phase 3: Cart & Checkout System

- **Cart**: Client-side state (React context + localStorage) for guests; synced to Supabase for logged-in users
- **Cart page**: Product list with quantity controls, remove button, subtotal
- **Checkout page**: 
  - Name, phone, address form (Bangla labels)
  - Payment method: COD or Online (partial — 10% of total or delivery charge, whichever applies)
  - Order summary
  - Guest checkout supported; option to create account
- **Order confirmation**: Order ID, downloadable PDF invoice, order tracking link

---

## Phase 4: Authentication & User Dashboard

- **Auth pages**: `/login`, `/register`, `/forgot-password`, `/reset-password` — all in Bangla
- **User Dashboard** (`/dashboard`):
  - Order history with status tracking
  - Order detail with invoice download
  - Saved addresses (CRUD)
  - Wishlist
  - Profile settings (name, phone, avatar)

---

## Phase 5: Admin Panel

- **Route**: `/admin/*` — protected by `has_role(user_id, 'admin')` check
- **Layout**: Sidebar navigation using Shadcn Sidebar component
- **Admin pages**:
  - **Dashboard**: Overview stats (total orders, revenue, pending orders, customers)
  - **Orders**: List with filters (status, date), order detail, update status, mark payment
  - **Products**: CRUD with image upload (Supabase Storage), category assignment
  - **Categories**: CRUD
  - **Customers**: List, view details
  - **Banners**: Manage hero and promo banners
  - **Reviews**: Approve/reject customer reviews
  - **Settings**: Site settings (announcement text, delivery charge, etc.)
  - **Incomplete Orders**: Orders that were started but not completed

---

## Phase 6: Payment Integration (UddoktaPay)

- **Edge function** `process-payment`: Initiates UddoktaPay payment session for partial online payment (10% of order total or delivery charge)
- **Edge function** `payment-webhook`: Handles UddoktaPay callback to update order payment status
- API keys will be added later via Supabase secrets
- Structure built now, ready to activate when credentials are provided

---

## Phase 7: Invoice & Order Tracking

- **Invoice**: Generate downloadable PDF invoice (using jsPDF or similar client-side library) with order details, Bangla text
- **Order tracking**: Simple status timeline (pending > confirmed > processing > shipped > delivered) visible on order detail page

---

## Technical Details

- **Routing**: React Router with nested routes for admin and dashboard
- **State management**: React Context for cart, React Query for server data
- **Font**: Google Sans loaded via `<link>` in index.html
- **Image storage**: Supabase Storage bucket for product images, banners
- **RLS**: All tables protected; admin access via `has_role()` security definer function
- **Responsive**: Tailwind mobile-first breakpoints throughout

### Implementation Order
The work will be split across multiple implementation rounds due to scope. Starting with: database schema + homepage + product pages + cart system, then layering auth, dashboard, admin, and payment.

