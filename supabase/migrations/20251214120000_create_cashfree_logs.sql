-- Create cashfree_logs table to store raw Cashfree requests and responses
CREATE TABLE IF NOT EXISTS public.cashfree_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  action TEXT,
  order_id TEXT,
  request JSONB,
  response JSONB
);

ALTER TABLE public.cashfree_logs ENABLE ROW LEVEL SECURITY;

-- Allow admins to view logs
CREATE POLICY "Admins can view logs" ON public.cashfree_logs
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can insert logs" ON public.cashfree_logs
  FOR INSERT WITH CHECK (public.is_admin());
