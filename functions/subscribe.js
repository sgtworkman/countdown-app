export async function onRequestPost(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://dayspop.com',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const { email, name } = await context.request.json();
    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Invalid email' }), { status: 400, headers: corsHeaders });
    }

    const ML_API_KEY = context.env.ML_API_KEY;
    const ML_GROUP_ID = '181051922836359101';

    const res = await fetch(`https://api.mailerlite.com/api/v2/groups/${ML_GROUP_ID}/subscribers`, {
      method: 'POST',
      headers: {
        'X-MailerLite-ApiKey': ML_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, name: name || '', resubscribe: true }),
    });

    const data = await res.json();
    if (data.id || data.email) {
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
    }
    return new Response(JSON.stringify({ error: 'Signup failed' }), { status: 400, headers: corsHeaders });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers: corsHeaders });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': 'https://dayspop.com',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
