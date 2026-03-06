// GET /verify-pro?session_id=cs_xxx
// Verifies a Stripe Checkout session was paid
// Env vars required: STRIPE_SECRET_KEY

export async function onRequestGet(context) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'https://app.dayspop.com',
  };

  try {
    const { STRIPE_SECRET_KEY } = context.env;
    if (!STRIPE_SECRET_KEY) {
      return new Response(JSON.stringify({ verified: false, error: 'Not configured' }), { status: 503, headers });
    }

    const url = new URL(context.request.url);
    const sessionId = url.searchParams.get('session_id');
    if (!sessionId || !/^cs_(test_|live_)?[a-zA-Z0-9]{10,}$/.test(sessionId)) {
      return new Response(JSON.stringify({ verified: false, error: 'Invalid session_id' }), { status: 400, headers });
    }

    // Retrieve the Checkout Session from Stripe
    const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      headers: {
        'Authorization': `Basic ${btoa(STRIPE_SECRET_KEY + ':')}`,
      },
    });

    const session = await res.json();
    if (session.error) {
      return new Response(JSON.stringify({ verified: false }), { status: 200, headers });
    }

    const verified = session.payment_status === 'paid';
    return new Response(JSON.stringify({ verified }), { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ verified: false, error: 'Server error' }), { status: 500, headers });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': 'https://app.dayspop.com',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
