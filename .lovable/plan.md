

## Plan: Unread Badge on Chat Sidebar + Home Button in Admin

### Changes

**1. Unread message count badge on the "লাইভ চ্যাট" sidebar link (`AdminLayout.tsx`)**

- Add a Supabase Realtime subscription in `AdminLayout` that listens for new `chat_messages` where `sender_type = 'user'`.
- Track total unread count in state. When on `/admin/chat`, reset it.
- Render a red badge with the unread count next to the "লাইভ চ্যাট" nav item (or a dot if count is 0 but there are new messages).
- The `links` array currently has a duplicate "সেটিংস" entry — will remove that too.

**2. Home button in sidebar footer (`AdminLayout.tsx`)**

- Add a "হোম" button with a `Home` icon next to the logout button (or above it) that navigates to `/` (the storefront).
- Visible in both expanded and collapsed sidebar states.

### Files to modify
- `src/pages/admin/AdminLayout.tsx` — add realtime unread tracking, home button, fix duplicate settings link

### Technical details
- Subscribe to `postgres_changes` on `chat_messages` table for `INSERT` events, increment counter for `sender_type === 'user'`.
- Use `useLocation` to detect when admin is on `/admin/chat` to auto-clear the badge.
- Render the badge as a small red circle with count using existing `Badge` component or inline styled span.

