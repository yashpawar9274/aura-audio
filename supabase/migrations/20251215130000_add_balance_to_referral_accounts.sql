-- Add balance column to referral_accounts to track available balance
ALTER TABLE public.referral_accounts
ADD COLUMN IF NOT EXISTS balance INTEGER DEFAULT 0;

-- Backfill existing accounts if needed (optional - leave as 0)
-- UPDATE public.referral_accounts SET balance = 0 WHERE balance IS NULL;
