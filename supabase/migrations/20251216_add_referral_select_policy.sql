-- Fix referrals table RLS policies
-- The original migration only had INSERT policy, missing SELECT and UPDATE
-- This migration adds the necessary policies for referral code verification and updates

-- Drop old policies that don't allow read/update operations
DROP POLICY IF EXISTS "Anyone can create referral" ON public.referrals;
DROP POLICY IF EXISTS "Anyone can verify referral codes" ON public.referrals;
DROP POLICY IF EXISTS "Users can view their own referrals" ON public.referrals;

-- SELECT Policy: Allow anyone to verify/read referral codes
CREATE POLICY "Anyone can read referrals" ON public.referrals
FOR SELECT USING (true);

-- INSERT Policy: Allow anyone to create referral codes
CREATE POLICY "Anyone can create referral" ON public.referrals
FOR INSERT WITH CHECK (true);

-- UPDATE Policy: Allow anyone to update referral records (for marking as completed/pending)
CREATE POLICY "Anyone can update referral records" ON public.referrals
FOR UPDATE USING (true) WITH CHECK (true);

-- DELETE Policy: Only admins can delete
DROP POLICY IF EXISTS "Admins can manage referrals" ON public.referrals;
CREATE POLICY "Admins can manage referrals" ON public.referrals
FOR DELETE USING (is_admin());
