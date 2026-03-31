

## Problem: Race condition in `useIsAdmin` causes premature redirect

**Root cause:** In `useIsAdmin`, when the hook first mounts, `user` is `null` (from its own `useAuth` instance). The effect runs immediately, sets `loading = false` and `isAdmin = false`. 

Meanwhile, in `AdminLayout`, the *other* `useAuth` instance resolves the user. Now we have: `authLoading = false`, `roleLoading = false` (stale from the null-user path), `user = truthy`, `isAdmin = false` → the redirect to `/` fires *before* the RPC call ever runs.

When `user` later updates inside `useIsAdmin`, it does call the RPC, but by then the redirect already happened.

## Fix

**File: `src/hooks/useAuth.tsx`** — In the `useIsAdmin` hook:

1. Initialize `loading` as `true`
2. When `user` changes from null to a value, set `loading = true` *before* the async RPC call
3. Only set `loading = false` after the RPC resolves or when user is confirmed null and auth is done

```typescript
export const useIsAdmin = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return; // wait for auth to settle
    if (!user) { setIsAdmin(false); setLoading(false); return; }
    setLoading(true); // reset loading when user changes
    supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' })
      .then(({ data }) => { setIsAdmin(!!data); setLoading(false); });
  }, [user, authLoading]);

  return { isAdmin, loading };
};
```

This ensures `roleLoading` stays `true` until the RPC call completes, preventing the premature redirect in `AdminLayout`.

