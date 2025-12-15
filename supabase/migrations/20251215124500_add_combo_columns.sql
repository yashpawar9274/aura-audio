-- Add combo support to products
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS is_combo BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS combo_components JSONB;

-- Enable realtime on products already enabled; ensure new columns are accessible via select
