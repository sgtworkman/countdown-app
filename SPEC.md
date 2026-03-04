# Countdown App — Product Spec
**Project:** Family Countdown Widget App
**Target Users:** Ciara (18) and Miabella (11) — Workman family
**Handoff To:** Claude Code
**Date:** 2026-03-04

---

## Overview
A mobile app that lets users create and manage countdown timers for upcoming events (vacations, birthdays, holidays, etc.). Each countdown shows days/hours/minutes remaining with a visual card. App also serves as a home screen widget so the countdown is visible without opening the app.

---

## Platform
- **React Native + Expo** (iOS + Android, single codebase)
- **Expo SDK 52+**
- **Target:** iOS 16+ / Android 12+
- Widget support via **`@baca/react-native-update-app`** or **Expo Widgets** (expo-modules)

> If widgets prove too complex for first version, deliver as a PWA with "Add to Home Screen" — fully functional without native widget.

---

## Core Features

### 1. Event Management
- Create countdown event with:
  - **Name** (e.g., "Disney Trip!", "My Birthday 🎂")
  - **Target date** (date picker)
  - **Emoji or icon** — user picks from a set of ~30 options
  - **Color theme** — pick from 8 gradient presets (pastels, vibrant, dark)
- Edit / delete events
- Events persist locally (AsyncStorage or SQLite)
- No account required — fully offline

### 2. Countdown Display
Each event card shows:
- Event name + emoji
- **Big number: days remaining** (primary display)
- Secondary line: `X hours, X minutes` (optional toggle)
- "🎉 Today's the day!" state when countdown hits zero
- "X days ago" state for past events (optional — keep or auto-archive)

### 3. Home Screen
- List of all countdowns, sorted by nearest date
- Pull-to-refresh
- Tap card → detail view / edit
- "+" FAB button to add new event
- Empty state: friendly illustration + "Add your first countdown"

### 4. Home Screen Widget (Stretch Goal — V1.1)
- Small widget (2x2): Shows nearest upcoming event — name, days remaining, emoji
- Medium widget (4x2): Shows top 2 events
- iOS: WidgetKit via Expo Widgets module
- Android: App Widget via same module
- Widget taps → opens app

---

## Design Direction
- **Vibe:** Fun, colorful, bubbly — designed for teenage girls, not corporate
- **Font:** `Nunito` ExtraBold (headings) / Regular (body) — Google Fonts, free, works in Expo
- **Cards:** Soft gradient backgrounds, rounded corners (radius 20px), drop shadow
- **Animations:** Card entrance animation (slide up), countdown number pulse on load

---

## Brand Identity

### Logo
- **Style:** Sparkle Burst — translucent pink-purple gradient circle, glowing starburst center with bold countdown number, floating sparkles/confetti in pink, yellow, white
- **App icon shape:** Rounded square with pink-to-purple gradient background
- **Reference files:** `assets/logo/` in repo
- **Chosen by:** Miabella (target user, age 11) ✅

### Color Palette
| Role | Name | Hex |
|---|---|---|
| Primary | Vivid Purple-Pink | `#C85FD4` |
| Secondary | Coral Pink | `#FF6B9D` |
| Accent | Sunny Yellow | `#FFD166` |
| App Background | Whisper Lavender | `#FDF0FF` |
| Card Text | Dark Charcoal | `#1A1A2E` |
| Success | Mint Green | `#06D6A0` |

### Card Gradient Themes (8 total)
```typescript
export const themes = {
  'pink-purple': ['#C85FD4', '#FF6B9D'],   // 🌸 Default
  'ocean':       ['#4FC3F7', '#0077B6'],   // 🌊
  'sunset':      ['#FF6B35', '#FF006E'],   // 🌅
  'mint':        ['#06D6A0', '#118AB2'],   // 🌿
  'gold':        ['#FFD166', '#FF9F1C'],   // ⭐
  'grape':       ['#7B2D8B', '#4A0E8F'],   // 🍇
  'dark':        ['#1A1A2E', '#16213E'],   // 🖤
  'minimal':     ['#F8F9FA', '#E9ECEF'],   // 🤍
}
```

### Typography
```typescript
// Install: expo install @expo-google-fonts/nunito
import { Nunito_400Regular, Nunito_800ExtraBold } from '@expo-google-fonts/nunito'

// Usage:
// Countdown number: Nunito_800ExtraBold, size 80–120
// Event name:       Nunito_800ExtraBold, size 24
// Labels/body:      Nunito_400Regular, size 14–16
```

---

## Icons/Emoji Set
✈️ 🏖️ 🎂 🎉 🎄 🎃 🎆 🏕️ 🎓 💜 ⭐ 🌸 🦋 🎵 🐶 🌴 🏠 ❤️ 🎸 🎁 🏆 🌙 ☀️ 🦄 🐱 👑 💅 🎀 🎯 🚀

---

## Screens

### 1. Home Screen (`/`)
```
[Header: "Countdowns" + Settings gear]
[Card: 🏖️ Disney Trip — 47 days]
[Card: 🎂 Miabella's Birthday — 12 days]
[Card: 🎓 Graduation — 83 days]
[+ Add Event FAB]
```

### 2. Add / Edit Event (`/add`, `/edit/:id`)
```
[Back button]
[Event Name input — "What are you counting down to?"]
[Date Picker]
[Emoji picker — scrollable grid]
[Color theme selector — horizontal scroll]
[Save button]
```

### 3. Event Detail (`/event/:id`)
```
[Full-screen card with selected gradient]
[Emoji — large, centered]
[Event name]
[BIG countdown number]
["days" label]
[Hours : Minutes : Seconds — optional live ticker]
[Edit | Delete buttons]
```

### 4. Settings (`/settings`)
```
[Default color theme]
[Show seconds toggle]
[Show past events toggle]
[App icon color (if supported)]
[About / version]
```

---

## Data Model

```typescript
interface CountdownEvent {
  id: string;           // UUID
  name: string;         // "Disney Trip!"
  targetDate: string;   // ISO date string "2026-06-15"
  emoji: string;        // "✈️"
  colorTheme: ColorTheme;
  createdAt: string;
  notifyOnDay?: boolean; // future: push notification on the day
}

type ColorTheme = 
  | 'pink-purple'
  | 'ocean'
  | 'sunset'
  | 'mint'
  | 'gold'
  | 'grape'
  | 'dark'
  | 'minimal';
```

---

## Tech Stack
```
expo init countdown-app --template blank-typescript
```

### Dependencies
```json
{
  "expo": "~52.0.0",
  "react-native": "0.76.x",
  "expo-router": "^4.0.0",
  "@react-native-async-storage/async-storage": "^2.0.0",
  "react-native-reanimated": "^3.0.0",
  "expo-haptics": "~14.0.0",
  "expo-status-bar": "^2.0.0",
  "date-fns": "^3.0.0",
  "react-native-uuid": "^2.0.0"
}
```

### File Structure
```
app/
  _layout.tsx          # Root layout, navigation
  index.tsx            # Home screen (countdown list)
  add.tsx              # Add event screen
  event/[id].tsx       # Event detail/edit screen
  settings.tsx         # Settings
components/
  CountdownCard.tsx    # Reusable countdown card
  EmojiPicker.tsx      # Emoji grid selector
  ThemePicker.tsx      # Color theme selector
  CountdownNumber.tsx  # Animated big number display
hooks/
  useCountdowns.ts     # CRUD + storage logic
  useCountdown.ts      # Live countdown calculation hook
constants/
  themes.ts            # Gradient color definitions
  emojis.ts            # Curated emoji list
```

---

## MVP Scope (V1.0 — Ship This First)
- [ ] Create / edit / delete events
- [ ] Home screen list sorted by date
- [ ] Event detail with live countdown (days/hours/min/sec)
- [ ] 8 color themes + emoji picker
- [ ] Custom photo background per event (from camera roll)
- [ ] Recurring events toggle (annual repeat for birthdays)
- [ ] Local persistence (no backend, no login)
- [ ] iOS + Android builds via Expo

## V1.1 (After MVP)
- [ ] Home screen widget (iOS + Android)
- [ ] Lock screen widget (iOS 16+)
- [ ] Apple Watch complication
- [ ] Push notification — alert X days before event (user sets how many days)
- [ ] Progress bar view ("73% of the wait is over")
- [ ] Share countdown as image (screenshot-ready card for Instagram/iMessage)
- [ ] Days Since mode (count up from a past date)
- [ ] Multiple profiles (Ciara vs Miabella)

## Monetization
**Free tier:**
- Up to 3 countdowns
- 4 basic color themes
- Emoji only (no custom photos)
- Home screen widget (1 event)

**PRO — $2.99 one-time unlock:**
- Unlimited countdowns
- All 8 color themes
- Custom photo backgrounds
- Lock screen widget
- Apple Watch widget
- Recurring events
- Share as image
- Priority sort / pinned events

**Tip Jar (Buy me a coffee):**
- In Settings → "Support the App" 
- 3 consumable IAP tiers: ☕ $1 / 🧁 $3 / 🍕 $5
- Use RevenueCat for IAP management (handles both iOS + Android)

**Add to spec dependencies:**
```json
"react-native-purchases": "^7.0.0"  // RevenueCat SDK
```

---

## Notes for Claude Code
- Keep it simple — no backend, no auth, no cloud sync in V1
- Test on iOS simulator primarily (Ciara + Miabella both on iPhone)
- The emoji + photo picker UX is important — make it tactile and fun
- Use `expo-router` for navigation (file-based routing)
- Haptic feedback on save/delete actions (`expo-haptics`)
- Gate PRO features with a simple `isPro` boolean from RevenueCat
- Show PRO paywall as a bottom sheet modal — not a full screen
- No ads, no tracking — this is a family app
- PRO paywall copy: "Unlock everything — one time, forever. No subscription." 
