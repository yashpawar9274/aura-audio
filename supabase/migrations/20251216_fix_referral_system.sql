-- Complete referral system fix

-- Add user_id to referrals table to link to auth users
ALTER TABLE public.referrals
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Fix referral_accounts to handle balance properly
ALTER TABLE public.referral_accounts
ADD COLUMN IF NOT EXISTS balance INTEGER DEFAULT 0;

-- Update RLS policies for referrals table
DROP POLICY IF EXISTS "Anyone can create referral" ON public.referrals;
DROP POLICY IF EXISTS "Anyone can verify referral codes" ON public.referrals;
DROP POLICY IF EXISTS "Users can view their own referrals" ON public.referrals;
DROP POLICY IF EXISTS "Anyone can read referrals" ON public.referrals;
DROP POLICY IF EXISTS "Anyone can update referral records" ON public.referrals;
DROP POLICY IF EXISTS "Admins can manage referrals" ON public.referrals;
DROP POLICY IF EXISTS "Admins can view all referrals" ON public.referrals;

-- SELECT: Anyone can read referrals (for verification and viewing)
CREATE POLICY "Anyone can read referrals" ON public.referrals
FOR SELECT USING (true);

-- INSERT: Anyone can create referral codes
CREATE POLICY "Anyone can create referrals" ON public.referrals
FOR INSERT WITH CHECK (true);

-- UPDATE: Anyone can update referrals
CREATE POLICY "Anyone can update referrals" ON public.referrals
FOR UPDATE USING (true) WITH CHECK (true);

-- DELETE: Only admins can delete
CREATE POLICY "Admins can delete referrals" ON public.referrals
FOR DELETE USING (is_admin());

-- Update referral_accounts RLS policies
DROP POLICY IF EXISTS "Anyone can upsert their referral account" ON public.referral_accounts;
DROP POLICY IF EXISTS "Anyone can view accounts" ON public.referral_accounts;
DROP POLICY IF EXISTS "Admins can view accounts" ON public.referral_accounts;

CREATE POLICY "Users can view own account" ON public.referral_accounts
FOR SELECT USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can update own account" ON public.referral_accounts
FOR UPDATE USING (auth.uid() = user_id OR is_admin()) WITH CHECK (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can insert own account" ON public.referral_accounts
FOR INSERT WITH CHECK (auth.uid() = user_id OR is_admin());

-- Update referral_withdrawals RLS policies
DROP POLICY IF EXISTS "Anyone can request withdrawal" ON public.referral_withdrawals;
DROP POLICY IF EXISTS "Admins can manage withdrawals" ON public.referral_withdrawals;

CREATE POLICY "Users can view own withdrawals" ON public.referral_withdrawals
FOR SELECT USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can request withdrawal" ON public.referral_withdrawals
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage withdrawals" ON public.referral_withdrawals
FOR ALL USING (is_admin());
