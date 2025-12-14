import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CASHFREE_APP_ID = Deno.env.get('CASHFREE_APP_ID');
const CASHFREE_SECRET_KEY = Deno.env.get('CASHFREE_SECRET_KEY');
const CASHFREE_API_URL = 'https://sandbox.cashfree.com/pg'; // Use https://api.cashfree.com/pg for production

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, orderId, orderAmount, customerDetails, returnUrl } = await req.json();
    
    console.log('Cashfree payment request:', { action, orderId, orderAmount });

    if (action === 'create_order') {
      // Create a payment session with Cashfree
      const response = await fetch(`${CASHFREE_API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': CASHFREE_APP_ID!,
          'x-client-secret': CASHFREE_SECRET_KEY!,
          'x-api-version': '2023-08-01',
        },
        body: JSON.stringify({
          order_id: orderId,
          order_amount: orderAmount,
          order_currency: 'INR',
          customer_details: {
            customer_id: customerDetails.customerId || `cust_${Date.now()}`,
            customer_email: customerDetails.email,
            customer_phone: customerDetails.phone,
            customer_name: customerDetails.name,
          },
          order_meta: {
            return_url: returnUrl,
            notify_url: returnUrl,
          },
        }),
      });

      const data = await response.json();
      console.log('Cashfree create order response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create Cashfree order');
      }

      // Build a payment URL for redirecting the customer to the Cashfree hosted session
      const paymentUrl = `${CASHFREE_API_URL}/view/sessions/${data.payment_session_id}`;

      return new Response(JSON.stringify({
        success: true,
        paymentSessionId: data.payment_session_id,
        paymentUrl,
        orderId: data.order_id,
        orderStatus: data.order_status,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'verify_payment') {
      // Verify payment status
      const response = await fetch(`${CASHFREE_API_URL}/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'x-client-id': CASHFREE_APP_ID!,
          'x-client-secret': CASHFREE_SECRET_KEY!,
          'x-api-version': '2023-08-01',
        },
      });

      const data = await response.json();
      console.log('Cashfree verify payment response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify payment');
      }

      // Update order status in database if payment is successful
      if (data.order_status === 'PAID') {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        await supabase
          .from('orders')
          .update({ 
            payment_status: 'paid',
            status: 'confirmed',
          })
          .eq('order_number', orderId);
      }

      return new Response(JSON.stringify({
        success: true,
        orderStatus: data.order_status,
        paymentStatus: data.order_status === 'PAID' ? 'paid' : 'pending',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Cashfree payment error:', errorMessage);
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
