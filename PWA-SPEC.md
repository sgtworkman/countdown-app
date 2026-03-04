# DaysPop PWA — Full Build Spec
**For Claude Code. Build everything. Ship to app.dayspop.com.**

## What You're Building
A Progressive Web App (PWA) countdown timer at `app.dayspop.com`. The app is deployed via Cloudflare Pages from the `dist/` folder in `github.com/sgtworkman/countdown-app`. The PWA must work offline, install to home screen on iOS/Android, and gate features behind a $2.99 one-time Stripe payment.

The current `dist/` folder has an Expo web export that may not be fully functional. Rebuild the PWA from scratch as a clean vanilla HTML/CSS/JS app — no framework dependencies, no build step, just files that deploy directly. This is simpler, faster, and more reliable than fighting Expo's web output.

---

## Tech Stack
- **Frontend:** Vanilla HTML + CSS + JavaScript (ES modules). No React, no build step.
- **Persistence:** `localStorage` only. No backend, no accounts, no login.
- **Payments:** Stripe Checkout (hosted payment page). $2.99 one-time.
- **Serverless:** Cloudflare Pages Functions (`/functions/`) — already in the repo.
- **Hosting:** Cloudflare Pages → `app.dayspop.com`

---

## File Structure
```
dist/
  index.html          ← App shell (single page app)
  app.css             ← All styles
  app.js              ← All app logic (ES module)
  manifest.json       ← PWA manifest (already exists)
  icon-192.png        ← PWA icon (already exists)
  icon-512.png        ← PWA icon (already exists)
  sw.js               ← Service worker (offline support)

functions/
  subscribe.js        ← MailerLite waitlist (already exists, don't touch)
  create-checkout.js  ← Stripe: create checkout session
  stripe-webhook.js   ← Stripe: webhook → mark Pro key as valid
  verify-pro.js       ← Stripe: verify Pro purchase by session ID
```

---

## App Screens (Single Page App — show/hide sections)

### 1. Home Screen (`#home`)
- Header: DaysPop logo (use `dayspop-logo.jpg` from `assets/logo/`) + "PRO" badge if Pro
- Countdown card list — sorted by nearest date first
- Empty state: sparkle illustration + "Add your first countdown ✨" + big + button
- FAB (floating action button): purple gradient circle "+" bottom right
- Free limit banner: if 3 events and not Pro → sticky banner "You've hit the free limit. Upgrade to Pro →"

### 2. Add / Edit Event Screen (`#add`)
- Back button → home
- Form fields:
  - Event name (text input, max 40 chars)
  - Target date (date picker — native HTML `<input type="date">`)
  - Emoji picker (30 emoji grid — see emoji list below)
  - Theme picker (8 gradient swatches — see themes below)
  - Photo background toggle (PRO only — camera roll via `<input type="file accept="image/*">`)
  - Recurring annually toggle (PRO only)
- Save button (gradient purple)
- Delete button (only in edit mode, red, with confirm)

### 3. Event Detail Screen (`#detail`)
- Full-screen gradient background (the event's theme color)
- If photo background: blurred photo with dark overlay
- Big emoji centered
- Event name
- Giant countdown: DD days HH:MM:SS — live ticking every second
- "days / hours / min / sec" labels
- Tap to edit (pencil icon top right)
- Back button top left

### 4. PRO Paywall Screen (`#paywall`)
- Shown when free user tries to:
  - Add a 4th event
  - Use a PRO theme
  - Add a photo background
  - Toggle recurring
- Design: bottom sheet sliding up (dark overlay behind)
- Content:
  - Sparkle icon ✨
  - "Unlock DaysPop Pro"
  - Subtitle: "One time. Forever. No subscription."
  - Price: **$2.99**
  - Feature list:
    - ✅ Unlimited countdowns (you have 3 free)
    - ✅ All 8 beautiful themes
    - ✅ Custom photo backgrounds
    - ✅ Recurring annual events
    - ✅ Support indie development ❤️
  - "Unlock for $2.99" button → Stripe Checkout
  - "Restore Purchase" link (small, below button)
  - "Maybe Later" dismiss link

### 5. Settings Screen (`#settings`)
- Back button
- Sections:
  - **Account:** PRO status badge + "Restore Purchase" button
  - **Display:** toggle seconds on/off, toggle 24h format
  - **About:** Version 1.0, privacy policy link, support email
- If free: upgrade CTA card at top

---

## Countdown Card Design
Each card on the home screen:
```
┌─────────────────────────────┐
│ 🏖️  Beach Vacation          │  ← emoji + name
│ 47 days away               │  ← big number + "days away"
│ June 15, 2026              │  ← target date formatted
└─────────────────────────────┘
```
- Background: gradient from theme (linear-gradient, 135deg)
- Text: white
- Border-radius: 20px
- Tap → Event Detail screen
- Long press (500ms) → quick delete confirm

---

## Themes (8 total — 4 free, 4 PRO)
```javascript
const THEMES = [
  { id: 'pink-purple', name: 'Sparkle',  free: true,  gradient: ['#C85FD4', '#FF6B9D'] },
  { id: 'ocean',       name: 'Ocean',    free: true,  gradient: ['#4FC3F7', '#0077B6'] },
  { id: 'sunset',      name: 'Sunset',   free: true,  gradient: ['#FF6B35', '#FF006E'] },
  { id: 'mint',        name: 'Mint',     free: true,  gradient: ['#06D6A0', '#118AB2'] },
  { id: 'gold',        name: 'Gold',     free: false, gradient: ['#FFD166', '#FF9F1C'] },
  { id: 'grape',       name: 'Grape',    free: false, gradient: ['#7B2D8B', '#4A0E8F'] },
  { id: 'dark',        name: 'Midnight', free: false, gradient: ['#1A1A2E', '#16213E'] },
  { id: 'minimal',     name: 'Cloud',    free: false, gradient: ['#F8F9FA', '#E9ECEF'] },
];
```
PRO themes show a lock icon. Tapping one opens paywall.

---

## Emoji List (30 curated)
```javascript
const EMOJIS = [
  '✈️','🏖️','🎂','🎄','🎃','🎆','💍','🎓','🏠','🐣',
  '🌸','🎵','⚽','🏋️','🍕','🎮','📚','💼','🚀','🌍',
  '❤️','⭐','🦋','🌈','🎯','🎪','🏆','🎭','🌙','✨'
];
```

---

## Free vs PRO Gates

| Feature | Free | PRO |
|---|---|---|
| Countdowns | Max 3 | Unlimited |
| Themes | 4 (Sparkle, Ocean, Sunset, Mint) | All 8 |
| Photo backgrounds | ❌ | ✅ |
| Recurring annual events | ❌ | ✅ |

**Gate logic:**
```javascript
function canAddEvent() {
  return isPro() || getEvents().length < 3;
}
function canUseTheme(themeId) {
  const theme = THEMES.find(t => t.id === themeId);
  return theme.free || isPro();
}
```

---

## Data Model (localStorage)
```javascript
// Key: 'dayspop_events'
// Value: JSON array of:
{
  id: string,          // crypto.randomUUID()
  name: string,        // "Beach Vacation"
  targetDate: string,  // "2026-06-15" (ISO date)
  emoji: string,       // "🏖️"
  themeId: string,     // "ocean"
  photoDataUrl: string|null,  // base64 image (PRO only)
  recurring: boolean,  // PRO only
  createdAt: string    // ISO datetime
}

// Key: 'dayspop_pro'
// Value: JSON { verified: true, sessionId: "cs_xxx", verifiedAt: "ISO datetime" }

// Key: 'dayspop_settings'
// Value: JSON { showSeconds: true, use24h: false }
```

---

## Stripe Integration

### Environment Variables (set in CF Pages dashboard)
```
STRIPE_SECRET_KEY=sk_live_xxx        ← Glen must provide
STRIPE_WEBHOOK_SECRET=whsec_xxx      ← from Stripe dashboard after webhook setup
STRIPE_PRICE_ID=price_xxx            ← one-time $2.99 product (Glen must create in Stripe)
```

### CF Pages Function: `functions/create-checkout.js`
```javascript
// POST /create-checkout
// Body: { successUrl, cancelUrl }
// Creates a Stripe Checkout session and returns { url, sessionId }
export async function onRequestPost(context) {
  const stripe = new StripeClient(context.env.STRIPE_SECRET_KEY);
  const { successUrl, cancelUrl } = await context.request.json();
  
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: context.env.STRIPE_PRICE_ID, quantity: 1 }],
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
  });
  
  return Response.json({ url: session.url, sessionId: session.id });
}
```
Use the official Stripe API via fetch (no npm in CF Pages Functions):
```javascript
// Stripe API base URL: https://api.stripe.com/v1
// Auth: Basic btoa(STRIPE_SECRET_KEY + ':')
// Use URLSearchParams for form-encoded bodies
```

### CF Pages Function: `functions/verify-pro.js`
```javascript
// GET /verify-pro?session_id=cs_xxx
// Verifies a Stripe session was paid and returns { verified: bool }
// Called after redirect back from Stripe with ?session_id=xxx
```

### CF Pages Function: `functions/stripe-webhook.js`
```javascript
// POST /stripe-webhook
// Handles checkout.session.completed events
// IMPORTANT: verify Stripe signature using STRIPE_WEBHOOK_SECRET
// On success: just log it (no DB to update — client-side verification handles Pro status)
```

### Pro purchase flow (client-side):
```javascript
async function startCheckout() {
  const res = await fetch('/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      successUrl: window.location.origin + '/?pro_success=1',
      cancelUrl: window.location.origin + '/?pro_cancel=1',
    })
  });
  const { url } = await res.json();
  window.location.href = url; // redirect to Stripe Checkout
}

// On app load, check for ?pro_success=1&session_id=xxx in URL
async function checkProReturn() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('pro_success') && params.get('session_id')) {
    const res = await fetch(`/verify-pro?session_id=${params.get('session_id')}`);
    const { verified } = await res.json();
    if (verified) {
      localStorage.setItem('dayspop_pro', JSON.stringify({
        verified: true,
        sessionId: params.get('session_id'),
        verifiedAt: new Date().toISOString()
      }));
      showProSuccessAnimation(); // confetti / sparkles
    }
    // Clean up URL
    window.history.replaceState({}, '', window.location.pathname);
  }
}
```

### Restore Purchase flow:
```javascript
async function restorePurchase() {
  const email = prompt('Enter the email you used to purchase:');
  if (!email) return;
  // POST /verify-pro with email → look up Stripe customer
  // If found with paid status → set localStorage pro
}
```
Note: Restore via session ID is simpler — store session_id in localStorage and re-verify against Stripe.

---

## PWA Service Worker (`dist/sw.js`)
```javascript
// Cache-first for assets, network-first for API calls
const CACHE = 'dayspop-v1';
const ASSETS = ['/', '/app.css', '/app.js', '/manifest.json', '/icon-192.png'];

self.addEventListener('install', e => e.waitUntil(
  caches.open(CACHE).then(c => c.addAll(ASSETS))
));

self.addEventListener('fetch', e => {
  if (e.request.url.includes('/create-checkout') || 
      e.request.url.includes('/verify-pro')) {
    return; // never cache payment endpoints
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
```

---

## Brand / Design System
```css
:root {
  --primary: #C85FD4;
  --secondary: #FF6B9D;
  --accent: #FFD166;
  --bg: #FDF0FF;
  --card-text: #1A1A2E;
  --font: 'Nunito', sans-serif;
  --radius: 20px;
  --shadow: 0 8px 32px rgba(200, 95, 212, 0.15);
}
```
- Font: Nunito (load from Google Fonts)
- Gradient buttons: `linear-gradient(135deg, #C85FD4, #FF6B9D)`
- Background: `#FDF0FF` (whisper lavender)
- All screens have subtle sparkle particle canvas (reuse from landing page)

---

## Animations
- Cards: fade-in on load (stagger 50ms per card)
- Screen transitions: slide-left/right (CSS transitions, 250ms)
- Countdown numbers: subtle pulse every second
- PRO paywall: slide up from bottom (transform: translateY)
- Pro unlock success: sparkle/confetti burst (CSS keyframes)

---

## Deployment
**Repo:** `github.com/sgtworkman/countdown-app`
**Deploy path:** Put the PWA files in `dist/` folder. CF Pages auto-deploys on push to `main`.
**Functions:** Put in `functions/` folder. CF Pages auto-deploys these too.
**DO NOT touch:** `site/` folder (landing page), `functions/subscribe.js` (waitlist)

After building, verify:
1. `dist/index.html` loads at app.dayspop.com
2. PWA installs via Safari "Add to Home Screen"
3. App works offline after install
4. Adding an event works and persists on reload
5. 4th event triggers paywall (Stripe env vars will be added by Glen — use mock/test mode for now)
6. All 8 themes show, PRO ones show lock icon for free users

---

## Stripe Setup (Glen must do manually after build)
1. Go to dashboard.stripe.com
2. Create product: "DaysPop Pro" — one-time $2.99
3. Copy Price ID → add to CF Pages env as `STRIPE_PRICE_ID`
4. Copy Secret Key → add to CF Pages env as `STRIPE_SECRET_KEY`
5. Create webhook → endpoint: `https://app.dayspop.com/stripe-webhook` → event: `checkout.session.completed`
6. Copy webhook secret → add as `STRIPE_WEBHOOK_SECRET`

Until Glen adds these, the app should work fully in free mode and show a "Coming soon" message when upgrade is tapped (no crash).

---

## Success Criteria
- [ ] App loads at app.dayspop.com in Safari
- [ ] "Add to Home Screen" installs it with DaysPop icon
- [ ] Create/edit/delete events works
- [ ] Countdown ticks live (days/hours/min/sec)
- [ ] Free users blocked at 3 events — paywall shown
- [ ] PRO themes locked for free users
- [ ] Stripe checkout redirect works (test mode OK)
- [ ] After payment, Pro features unlock
- [ ] Works offline after first load
- [ ] Looks great on iPhone SE and iPhone 15 Pro (test both sizes)
