// POST /stripe-webhook
// Handles Stripe webhook events (checkout.session.completed)
// Env vars required: STRIPE_WEBHOOK_SECRET

export async function onRequestPost(context) {
  const headers = { 'Content-Type': 'application/json' };

  try {
    const { STRIPE_WEBHOOK_SECRET } = context.env;
    if (!STRIPE_WEBHOOK_SECRET) {
      return new Response(JSON.stringify({ error: 'Not configured' }), { status: 503, headers });
    }

    const body = await context.request.text();
    const sig = context.request.headers.get('stripe-signature');

    if (!sig) {
      return new Response(JSON.stringify({ error: 'Missing signature' }), { status: 400, headers });
    }

    // Verify Stripe webhook signature
    const verified = await verifyStripeSignature(body, sig, STRIPE_WEBHOOK_SECRET);
    if (!verified) {
      return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 400, headers });
    }

    const event = JSON.parse(body);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      // Log the successful payment (no DB to update — client-side handles Pro status)
      console.log(`DaysPop PRO purchased: session=${session.id}, amount=${session.amount_total}, email=${session.customer_details?.email}`);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Webhook error' }), { status: 500, headers });
  }
}

// Stripe signature verification using Web Crypto API
async function verifyStripeSignature(payload, header, secret) {
  try {
    const parts = header.split(',').reduce((acc, part) => {
      const [key, val] = part.split('=');
      acc[key.trim()] = val;
      return acc;
    }, {});

    const timestamp = parts.t;
    const signature = parts.v1;
    if (!timestamp || !signature) return false;

    // Check timestamp tolerance (5 minutes)
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - parseInt(timestamp)) > 300) return false;

    // Compute expected signature
    const signedPayload = `${timestamp}.${payload}`;
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload));
    const expected = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');

    return expected === signature;
  } catch {
    return false;
  }
}
