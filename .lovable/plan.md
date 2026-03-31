

## Plan: Make Admin Customers page useful with aggregated order data

Instead of querying `profiles`, query the `orders` table directly and aggregate by `customer_name` + `phone` to show real customer data.

### Changes: `src/pages/admin/AdminCustomers.tsx`

- Query all orders from Supabase
- Group by `customer_name + phone` combination to identify unique customers
- For each unique customer, compute:
  - **Total orders count**
  - **Total amount spent** (sum of `total`)
  - **Last order date**
  - **Phone** (from orders)
  - **Address** (from `shipping_address` JSON field)
- Sort by total spent descending
- Update table columns: নাম, ফোন, ঠিকানা, মোট অর্ডার, মোট খরচ, সর্বশেষ অর্ডার
- Add search/filter by customer name or phone

Single file change, no database modifications needed.

