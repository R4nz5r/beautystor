

## Plan: Add Form Validation Across All Forms

### Summary
Add proper input validation (inline error messages, phone/email format checks, length limits) to every form in the application using a lightweight helper approach — no new libraries needed.

### Validation Rules
- **Name**: Required, 2-100 chars, no numbers
- **Email**: Required, valid email format
- **Phone**: Required where used, must match BD format `01XXXXXXXXX` (11 digits starting with 01)
- **Password**: Min 6 chars
- **Address**: Required where used, min 5 chars
- **Comment/Message**: Required where used, min 3 chars

### Files to Modify

**1. Create `src/lib/validators.ts`** — shared validation helper functions:
- `validateName(value)` → error string or null
- `validateEmail(value)` → error string or null  
- `validatePhone(value)` → error string or null
- `validatePassword(value)` → error string or null
- `validateRequired(value, fieldName)` → error string or null

**2. `src/pages/Register.tsx`** — validate name, email, phone (BD format), password before submit; show inline error messages per field

**3. `src/pages/Login.tsx`** — validate email format and password not empty; show inline errors

**4. `src/pages/ForgotPassword.tsx`** — validate email format

**5. `src/pages/ResetPassword.tsx`** — validate password length and match

**6. `src/pages/Checkout.tsx`** — validate name, phone (BD format), address required; show inline errors per field

**7. `src/pages/dashboard/Profile.tsx`** — validate name, phone format

**8. `src/pages/dashboard/Addresses.tsx`** — validate address required, phone format if provided

**9. `src/components/store/ReviewForm.tsx`** — validate name (if not logged in), comment min length

**10. `src/components/store/ChatWidget.tsx`** — validate name required, phone format

### Approach
- Add `errors` state object to each form component
- Validate on submit; show red error text below each field
- Phone regex: `/^01[3-9]\d{8}$/` for Bangladesh numbers
- Email regex: standard format check
- All error messages in Bengali to match existing UI

### Technical Details
- No new dependencies — pure helper functions
- Error display: `<p className="text-xs text-destructive mt-1">{error}</p>` below each input
- Clear field error on change (immediate feedback)
- Admin forms (products, categories, banners, coupons) already use `required` attribute — skip those for now

