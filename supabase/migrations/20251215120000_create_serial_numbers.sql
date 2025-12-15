-- Create serial_numbers table for tracking product serials and warranty
CREATE TABLE public.serial_numbers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  serial TEXT NOT NULL UNIQUE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT,
  is_sold BOOLEAN DEFAULT false,
  sold_at DATE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  warranty_start_date DATE,
  warranty_end_date DATE,
  warranty_period INTEGER DEFAULT 6,
  status TEXT DEFAULT 'available', -- available | sold | returned | void
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create warranty_checks table to log warranty lookups
CREATE TABLE public.warranty_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  serial TEXT NOT NULL,
  user_id UUID,
  result TEXT,
  details JSON,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS and policies
ALTER TABLE public.serial_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warranty_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage serial numbers" ON public.serial_numbers
FOR ALL USING (is_admin());

CREATE POLICY "Admins can view serial numbers" ON public.serial_numbers
FOR SELECT USING (is_admin());

CREATE POLICY "Anyone can insert warranty checks" ON public.warranty_checks
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view warranty checks" ON public.warranty_checks
FOR SELECT USING (is_admin());

ALTER PUBLICATION supabase_realtime ADD TABLE public.serial_numbers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.warranty_checks;
