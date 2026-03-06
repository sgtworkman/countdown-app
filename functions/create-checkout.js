// POST /create-checkout
// Creates a Stripe Checkout session for DaysPop PRO ($2.99 one-time)
// Env vars required: STRIPE_SECRET_KEY, STRIPE_PRICE_ID

export async function onRequestPost(context) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'https://app.dayspop.com',
  };

  try {
    const { STRIPE_SECRET_KEY, STRIPE_PRICE_ID } = context.env;
    if (!STRIPE_SECRET_KEY || !STRIPE_PRICE_ID) {
      return new Response(JSON.stringify({ error: 'Stripe not configured' }), { status: 503, headers });
    }

    const { successUrl, cancelUrl } = await context.request.json();

    // Create Stripe Checkout Session via API
    const params = new URLSearchParams();
    params.append('mode', 'payment');
    params.append('line_items[0][price]', STRIPE_PRICE_ID);
    params.append('line_items[0][quantity]', '1');
    params.append('success_url', `${successUrl}${successUrl.includes('?') ? '&' : '?'}session_id={CHECKOUT_SESSION_ID}`);
    params.append('cancel_url', cancelUrl);
    params.append('allow_promotion_codes', 'true');

    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(STRIPE_SECRET_KEY + ':')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const session = await res.json();
    if (session.error) {
      return new Response(JSON.stringify({ error: session.error.message }), { status: 400, headers });
    }

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': 'https://app.dayspop.com',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
