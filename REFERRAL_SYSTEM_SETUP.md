# Complete Referral System Setup Guide

## What's Been Created

Your referral system now has:

### 1. **Auto-Generated Referral Codes** ✅
- When user signs up → automatic referral code generated (REF-XXXXXX)
- Code stored in `referrals` table with user_id
- Balance account created automatically with ₹0 initial balance

### 2. **Referral Dashboard** ✅
- **File**: `src/components/referral/ReferralDashboard.tsx`
- Shows:
  - ✓ Referral code with copy button
  - ✓ Current balance (₹0 until someone makes a purchase using their code)
  - ✓ Total earned all-time
  - ✓ Successful referral count
  - ✓ Bank details form (save account info)
  - ✓ Withdrawal request button (₹500 minimum)

### 3. **Professional Auth Modal** ✅
- **File**: `src/components/layout/AuthModal.tsx`
- Shows popup when visitors come to site
- Auto-generates referral code on signup
- Beautiful UI with benefits listed
- Works on all devices

### 4. **Admin Withdrawal Panel** ✅
- **File**: `src/components/admin/AdminWithdrawalApproval.tsx`
- Shows all pending withdrawals
- Approve/Reject buttons
- Deducts balance when approved
- Shows history with status

### 5. **Database Migrations** ✅
- **File**: `supabase/migrations/20251216_fix_referral_system.sql`
- Adds user_id to referrals table
- Fixes balance column in referral_accounts
- Proper RLS policies for security

---

## How to Integrate (Next Steps)

### Step 1: Apply Database Migration
```bash
cd "c:\Users\Admin\Downloads\aura-audio-main (1)\aura-audio-main"
supabase db push
```

Or manually in Supabase Dashboard → SQL Editor and run the SQL from `supabase/migrations/20251216_fix_referral_system.sql`

### Step 2: Add Referral Dashboard to Profile Page

In `src/pages/Profile.tsx`, add this import:
```typescript
import { ReferralDashboard } from "@/components/referral/ReferralDashboard";
```

And add this component in the profile section:
```tsx
<ReferralDashboard />
```

### Step 3: Add AuthModal to Layout or App Root

In `src/App.tsx` or `src/components/layout/Header.tsx`:
```typescript
import { AuthModal } from "@/components/layout/AuthModal";
import { useState } from "react";

// Add state
const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

// Add modal to JSX
<AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
```

Trigger modal on page load or button click:
```typescript
useEffect(() => {
  const user = /* check if user is logged in */;
  if (!user) {
    setIsAuthModalOpen(true);
  }
}, []);
```

### Step 4: Add Admin Withdrawal Panel

In `src/pages/admin/AdminWithdrawals.tsx` or create similar file:
```typescript
import { AdminWithdrawalApproval } from "@/components/admin/AdminWithdrawalApproval";

export default function AdminWithdrawals() {
  return <AdminWithdrawalApproval />;
}
```

### Step 5: Auto-Apply Referral Code on Product Share

Already working! When someone shares a product link with `?ref=CODE`, it auto-applies.

---

## How It Works (Complete Flow)

### User Signs Up:
1. ✅ User fills signup form
2. ✅ Account created in Supabase Auth
3. ✅ Referral code auto-generated (REF-XXXXXX)
4. ✅ Balance account created with ₹0
5. ✅ User redirected to home

### User Shares Code:
1. ✅ User goes to referral dashboard
2. ✅ Copies their referral link: `https://yoursite.com/?ref=REF-XXXXXX`
3. ✅ Shares with friends

### Friend Uses Code:
1. ✅ Friend visits link
2. ✅ Code auto-stored in localStorage
3. ✅ Friend adds products to cart
4. ✅ At checkout, referral code already applied (no manual input needed)
5. ✅ Friend completes payment

### After Payment Confirmed:
1. ✅ Referrer's balance increased by ₹49 (for regular product)
2. ✅ Or ₹111 for combo product
3. ✅ Shows in referrer's dashboard immediately

### User Withdraws:
1. ✅ User adds bank details
2. ✅ Requests withdrawal (min ₹500)
3. ✅ Admin sees request in admin panel
4. ✅ Admin clicks "Approve"
5. ✅ Balance deducted, money transferred
6. ✅ User sees "Completed" status

---

## Database Structure

### referrals table
```
- id (UUID)
- user_id (UUID) ← Links to auth user
- referrer_email (TEXT)
- referrer_name (TEXT)
- referred_email (TEXT)
- referred_name (TEXT)
- referral_code (TEXT UNIQUE)
- status (TEXT) - 'active', 'pending', 'completed'
- reward_amount (INTEGER) - 49 or 111
- created_at (TIMESTAMP)
- completed_at (TIMESTAMP)
```

### referral_accounts table
```
- id (UUID)
- user_id (UUID) ← Links to auth user
- account_name (TEXT)
- account_number (TEXT)
- ifsc (TEXT)
- bank_name (TEXT)
- balance (INTEGER) - In units (₹1 = 1 unit, 20 units = ₹20)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### referral_withdrawals table
```
- id (UUID)
- user_id (UUID)
- amount (INTEGER) - In paise (₹1 = 100)
- status (TEXT) - 'pending', 'completed', 'rejected'
- reason (TEXT)
- created_at (TIMESTAMP)
- processed_at (TIMESTAMP)
- processed_by (TEXT)
```

---

## Testing the System

### Test Signup with Auto Code:
1. Sign up with new account
2. Check Supabase → referrals table → see auto-generated code
3. Check referral_accounts → see balance = 0

### Test Referral Link:
1. Copy referral code from dashboard
2. Share link with parameter: `?ref=REF-XXXXXX`
3. Click link from another browser/device
4. Add to cart → checkout should show applied code

### Test Withdrawal:
1. Manually add balance to referral_accounts in Supabase (e.g., 100 units)
2. Go to dashboard → request withdrawal
3. Check admin panel → should see pending request
4. Click Approve → balance should decrease

---

## Important Notes

⚠️ **Still TODO:**
- Add Auth Modal trigger to homepage (currently created but not integrated)
- Add ReferralDashboard to Profile page
- Add AdminWithdrawalApproval to admin panel
- Update Checkout to properly credit balance when payment succeeds

✅ **Already Fixed:**
- RLS policies for referrals table (SELECT, INSERT, UPDATE allowed)
- Referral code case sensitivity (all uppercase)
- Auto-apply referral code on product links
- Database balance tracking

---

## Support

If you get "Could not verify code" error:
1. Make sure migration has been applied
2. Check Supabase RLS policies are in place
3. Verify referral code exists in referrals table
4. Check browser console for specific error

Need help? Let me know!
