

## Plan: Show only order name in both Admin Orders and Admin Customers

The user chose to use the **order name** (from `orders.customer_name`) as the single name source across admin pages.

### Changes

**1. `src/pages/admin/AdminCustomers.tsx`**
- Remove the "প্রোফাইল নাম" column
- Keep only one "নাম" column showing `order_name` (from orders table)
- If no order exists, show "অর্ডার নেই"

**2. `src/pages/admin/AdminOrders.tsx`**
- No changes needed — already shows `orders.customer_name`

### Summary
Single file change: simplify the customers table to show only the order-sourced name instead of both profile and order names.

