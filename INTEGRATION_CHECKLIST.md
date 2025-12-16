# Quick Integration Checklist

## 1️⃣ Apply Database Migration ✅
- [ ] Run: `supabase db push`
- [ ] Or manually execute SQL from `supabase/migrations/20251216_fix_referral_system.sql`
- [ ] Verify in Supabase Dashboard → no errors

## 2️⃣ Update Auth.tsx (Optional - Already has auto-generation)
- [ ] If you want to add the function to existing Auth.tsx, copy `generateReferralCode()` function
- [ ] And add the referral creation code in the signup success block

## 3️⃣ Add Dashboard to Profile Page
**File: `src/pages/Profile.tsx`**

Add import at top:
```typescript
import { ReferralDashboard } from "@/components/referral/ReferralDashboard";
```

Add to JSX (inside profile content):
```tsx
<div className="mt-12">
  <ReferralDashboard />
</div>
```

## 4️⃣ Add Auth Modal to Home Page (Pop-up)
**File: `src/App.tsx` or `src/pages/Index.tsx`**

Add import:
```typescript
import { AuthModal } from "@/components/layout/AuthModal";
import { useState, useEffect } from "react";
```

Add state in component:
```typescript
const [authModalOpen, setAuthModalOpen] = useState(false);
const { user } = useAuth(); // Use your existing auth hook

useEffect(() => {
  // Show modal only if user is not logged in (optional: add delay)
  if (!user) {
    const timer = setTimeout(() => setAuthModalOpen(true), 2000); // Show after 2 seconds
    return () => clearTimeout(timer);
  }
}, [user]);
```

Add to JSX:
```tsx
<AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
```

## 5️⃣ Add Withdrawal Admin Panel
**File: `src/pages/admin/` → Create new file or add to existing**

Option A - Add to existing admin page:
```typescript
import { AdminWithdrawalApproval } from "@/components/admin/AdminWithdrawalApproval";

// Add to admin dashboard
<AdminWithdrawalApproval />
```

Option B - Create new admin page:
```typescript
// src/pages/admin/Withdrawals.tsx
import { AdminWithdrawalApproval } from "@/components/admin/AdminWithdrawalApproval";

export default function AdminWithdrawals() {
  return <AdminWithdrawalApproval />;
}
```

Add route in `src/App.tsx`:
```typescript
<Route path="/admin/withdrawals" element={<Withdrawals />} />
```

## 6️⃣ Verify Auto-Apply on Product Share Works
- [ ] Already implemented in `src/pages/Checkout.tsx`
- [ ] When link has `?ref=CODE`, it auto-applies
- [ ] No manual "Apply" button click needed anymore

## 7️⃣ Test the Complete Flow

### Create Test Account:
```
Email: test@example.com
Password: Test@123
Full Name: Test User
```

### Should see:
- ✅ User created in Supabase Auth
- ✅ Referral code auto-generated
- ✅ Balance = 0
- ✅ Can view on Profile → Referral Dashboard

### Copy referral link:
```
https://yoursite.com/?ref=REF-XXXXXX
```

### Test referral:
- Open link in another browser
- Add to cart → checkout
- Should show referral code applied automatically

## 8️⃣ Update Checkout to Credit Balance (IMPORTANT)

**File: `src/pages/Checkout.tsx`** (around line 82-110)

After payment success, balance should be credited. Currently the code updates the referral record. You may need to also update the referral_accounts balance:

```typescript
// Add this after referral is marked completed:
if (referralCode && referralCode.user_id) {
  const { data: acc } = await supabase
    .from('referral_accounts')
    .select('balance')
    .eq('user_id', referralCode.user_id)
    .maybeSingle();
  
  await supabase
    .from('referral_accounts')
    .update({ balance: (acc?.balance || 0) + 49 }) // or 111 for combo
    .eq('user_id', referralCode.user_id);
}
```

## ✅ Done!

Your complete referral system should now work:
- New users get auto referral codes
- Can view & share from dashboard
- Friends auto-apply code on visit
- After payment, balance updates
- Can withdraw with bank details
- Admin can approve/reject withdrawals

Need help with any step? Let me know!
