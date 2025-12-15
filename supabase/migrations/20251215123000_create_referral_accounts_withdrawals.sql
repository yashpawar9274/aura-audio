-- Create referral_accounts and referral_withdrawals tables
CREATE TABLE public.referral_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  account_name TEXT,
  account_number TEXT,
  ifsc TEXT,
  bank_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ensure user_id is unique so ON CONFLICT (user_id) upserts work
ALTER TABLE public.referral_accounts ADD CONSTRAINT referral_accounts_user_id_unique UNIQUE (user_id);

CREATE TABLE public.referral_withdrawals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by TEXT
);

-- Enable RLS
ALTER TABLE public.referral_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_withdrawals ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies: allow users to insert/update their own account, admins can manage
CREATE POLICY "Anyone can upsert their referral account" ON public.referral_accounts
  FOR ALL USING (auth.role() = 'anon' OR auth.role() IS NOT NULL) WITH CHECK (auth.uid() = user_id OR is_admin());

CREATE POLICY "Anyone can request withdrawal" ON public.referral_withdrawals
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage withdrawals" ON public.referral_withdrawals
  FOR ALL USING (is_admin());

CREATE POLICY "Admins can view accounts" ON public.referral_accounts
  FOR SELECT USING (is_admin());

-- Enable realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.referral_accounts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.referral_withdrawals;
