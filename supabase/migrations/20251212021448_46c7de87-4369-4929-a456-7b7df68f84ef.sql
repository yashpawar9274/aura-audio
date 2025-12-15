-- Create notify_me table for product launch notifications
CREATE TABLE public.notify_me (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notified BOOLEAN DEFAULT false,
  notified_at TIMESTAMP WITH TIME ZONE
);

-- Create referrals table for refer and earn
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_email TEXT NOT NULL,
  referrer_name TEXT,
  referred_email TEXT NOT NULL,
  referred_name TEXT,
  referral_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  reward_amount INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create warranty_cards table
CREATE TABLE public.warranty_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  product_name TEXT NOT NULL,
  product_serial TEXT,
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  warranty_period INTEGER NOT NULL DEFAULT 12,
  warranty_end_date DATE NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE
);

-- Add contact details to site_settings
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS contact_email TEXT DEFAULT 'support@airpodsstore.in',
ADD COLUMN IF NOT EXISTS contact_phone TEXT DEFAULT '+91 1800-123-4567',
ADD COLUMN IF NOT EXISTS contact_address TEXT DEFAULT '123 Tech Park, Bangalore, India 560001',
ADD COLUMN IF NOT EXISTS business_hours TEXT DEFAULT 'Mon - Sat: 9:00 AM - 8:00 PM';

-- Enable RLS on new tables
ALTER TABLE public.notify_me ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warranty_cards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notify_me
CREATE POLICY "Anyone can subscribe for notifications" ON public.notify_me
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage notify_me" ON public.notify_me
FOR ALL USING (is_admin());

CREATE POLICY "Admins can view all notify_me" ON public.notify_me
FOR SELECT USING (is_admin());

-- RLS Policies for referrals
CREATE POLICY "Anyone can create referral" ON public.referrals
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage referrals" ON public.referrals
FOR ALL USING (is_admin());

CREATE POLICY "Admins can view all referrals" ON public.referrals
FOR SELECT USING (is_admin());

-- RLS Policies for warranty_cards (staff = admin in this case)
CREATE POLICY "Admins can manage warranty cards" ON public.warranty_cards
FOR ALL USING (is_admin());

CREATE POLICY "Admins can view all warranty cards" ON public.warranty_cards
FOR SELECT USING (is_admin());

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.notify_me;
ALTER PUBLICATION supabase_realtime ADD TABLE public.referrals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.warranty_cards;