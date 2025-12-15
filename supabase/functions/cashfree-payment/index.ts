
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const CASHFREE_APP_ID = Deno.env.get('CASHFREE_APP_ID');
const CASHFREE_SECRET_KEY = Deno.env.get('CASHFREE_SECRET_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const CASHFREE_API_URL = Deno.env.get('CASHFREE_API_URL') || 'https://sandbox.cashfree.com/pg';

const writeLog = async (payload: any) => {
	try {
		if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return;
		const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
		await supabase.from('cashfree_logs').insert([{ action: payload.action || 'webhook', order_id: payload.orderId || payload?.data?.order?.order_id || null, request: payload.request || null, response: payload.response || payload }]);
	} catch (err) {
		console.error('cashfree log error', err);
	}
};

serve(async (req) => {
	if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

	let body: any = {};
	try {
		body = await req.json();
	} catch (e) {
		// non-json payload
		const text = await req.text().catch(() => '');
		if (text) {
			try { body = JSON.parse(text); } catch { body = {}; }
		}
	}

	// If client requests create_order
	if (body?.action === 'create_order') {
		const { orderId, orderAmount, customerDetails, returnUrl } = body;
		if (!orderId || !orderAmount) {
			return new Response(JSON.stringify({ success: false, error: 'orderId and orderAmount required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
		}

		try {
			const payload = {
				order_id: orderId,
				order_amount: orderAmount,
				order_currency: 'INR',
				customer_details: {
					customer_id: customerDetails?.customerId || `cust_${Date.now()}`,
					customer_email: customerDetails?.email,
					customer_phone: customerDetails?.phone,
					customer_name: customerDetails?.name,
				},
				order_meta: {
					return_url: returnUrl,
					notify_url: returnUrl,
				},
			};

			const resp = await fetch(`${CASHFREE_API_URL}/orders`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-client-id': CASHFREE_APP_ID || '',
					'x-client-secret': CASHFREE_SECRET_KEY || '',
					'x-api-version': '2023-08-01',
				},
				body: JSON.stringify(payload),
			});

			const data = await resp.json();
			await writeLog({ action: 'create_order', orderId, request: payload, response: data });

			if (!resp.ok) {
				return new Response(JSON.stringify({ success: false, raw: data, error: data.message || 'Cashfree create order failed' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
			}

			// Build payment URL
			let paymentUrl = null;
			if (data.payment_link) paymentUrl = data.payment_link;
			else if (data.paymentUrl) paymentUrl = data.paymentUrl;
			else if (data.redirect_url) paymentUrl = data.redirect_url;
			else if (data.order_payment_url) paymentUrl = data.order_payment_url;
			else if (data.payment_session_id) paymentUrl = `${CASHFREE_API_URL}/view/sessions/${data.payment_session_id}`;

			return new Response(JSON.stringify({ success: true, raw: data, paymentUrl, paymentSessionId: data.payment_session_id, orderId: data.order_id || orderId }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
		} catch (err: any) {
			console.error('create_order error', err);
			await writeLog({ action: 'create_order_error', request: body, response: { message: String(err) } });
			return new Response(JSON.stringify({ success: false, error: String(err) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
		}
	}

	// If webhook-like payload from Cashfree (they post notifications)
	const orderId = body?.data?.order?.order_id || body?.orderId || body?.order_id || body?.order?.order_id;
	const orderStatus = (body?.data?.order?.order_status || body?.order_status || body?.orderStatus || body?.order?.order_status || body?.order?.status || '').toString().toUpperCase();

	if (orderId) {
		// Log raw webhook
		await writeLog({ action: 'webhook', orderId, request: body, response: null });

		try {
			if (orderStatus === 'PAID' || orderStatus === 'SUCCESS') {
				if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
					const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
					await supabase.from('orders').update({ payment_status: 'paid', status: 'confirmed' }).eq('order_number', orderId);
				}
			}
		} catch (err) {
			console.error('webhook update error', err);
		}

		return new Response('OK', { status: 200, headers: corsHeaders });
	}

	return new Response(JSON.stringify({ success: false, error: 'Invalid request' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
});
