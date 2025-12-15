-- Add coupon code fields to site_settings
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS coupon_code TEXT,
ADD COLUMN IF NOT EXISTS coupon_discount INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS coupon_active BOOLEAN DEFAULT false;