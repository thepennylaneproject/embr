# Embr: Styling, Scope, Voice

## Scope

Embr is a multi-surface product: social feed, messaging, gigs, wallet, moderation, media uploads, notifications. The UI must scale across “everyday social” and “money and safety” flows without feeling like multiple apps glued together. :contentReference[oaicite:4]{index=4}

This doc governs:

- visual system (tokens, components, layout)
- interaction patterns (states, feedback)
- copy voice (microcopy, tone)
- boundaries (what we do not do)

---

## Brand Feel (Interpretation)

Embr should feel like:

- quiet strength
- warmth without being childish
- safe, clean, breathable
- grounded, not tech-bro glossy

Key motif from logo: sunrise warmth over layered landscape, with a “guardian” bird mark. Translate into UI via soft gradients, layered surfaces, and gentle contrast.

---

## Color System (Tokens)

Source palette: :contentReference[oaicite:5]{index=5}

### Core Neutrals (Ink and Ivory Base)

- Ink: `--ebony-clay: #293241`
- Slate: `--pale-sky: #6b7b82`
- Mist: `--hit-gray: #aeb7bd`
- Ivory: `--pearl-bush: #e6e1d2`

### Accents (Warm + Sea Glass)

- Warm 1: `--contessa: #c37e67`
- Warm 2: `--tumbleweed: #d99f84`
- Sun: `--calico: #e2c895`
- Sea glass: `--gulf-stream: #8bbbb6`

### Usage Rules

- Ink + Ivory do the heavy lifting. Accents guide attention.
- One primary accent per screen. Do not rainbow the UI.
- Sea glass is for secondary highlights (links, focus rings, “success-ish” moments).
- Warm tones are for primary CTAs, creator moments, “post”, “publish”, “support”.
- Avoid pure black or pure white. Keep contrast high enough for accessibility, but soften the edges.

---

## Typography

- Default: modern readable sans for UI
- Serif is allowed for brand moments (titles, hero headings) but should not dominate dense screens like messaging and wallet.
- Type scale should be simple:
  - Page title
  - Section header
  - Body
  - Meta (timestamps, counts, helper text)

---

## Layout Principles

- Use a stable app shell: persistent nav, predictable content width.
- Use “surface layers” instead of heavy borders:
  - Base background (soft)
  - Card surface (slightly raised)
  - Active surface (slightly more contrast)
- Spacing rhythm:
  - Small: 8
  - Medium: 12 or 16
  - Large: 24 or 32
    Keep it consistent.

---

## Component Rules

### Buttons

- Primary: warm tone
- Secondary: ink outline or slate fill
- Destructive: reserved for truly destructive actions
  Never put two primary buttons next to each other.

### Forms

- Always show clear labels
- Show inline validation, not surprise errors after submit
- For financial actions, confirm with a review step

### States (Required Everywhere)

- Loading: skeleton or spinner plus short hint
- Empty: explain what it means, show the next action
- Error: plain language + retry where possible

---

## Voice and Microcopy

### Voice

- Calm, direct, human.
- No corporate hype, no hustle-culture.
- Use plain language, especially for money and safety.
- Avoid guilt, manipulation, or “growth” language.

### Examples

Good:

- “Add a caption”
- “Send tip”
- “Request payout”
- “Report this post”
- “You can undo this for 10 seconds”

Avoid:

- “Boost your personal brand”
- “Crush your goals”
- “Engage your audience”
- “You won’t believe…”

### Safety Copy

When a user reports or blocks:

- Confirm action clearly
- Explain what changes
- Offer next steps without overwhelm

### Money Copy

For wallet, tips, payouts:

- Always show amounts, fees, and timing in one place
- Avoid ambiguity. If timing is unknown, say so.
- Never use playful language for payouts and disputes.

---

## Non-Negotiables

- No dark patterns
- No confusing “mystery meat” icons without labels
- No infinite novelty animations
- No unreadable contrast
- No copy that shames users into engagement

---

## MVP UI Scope (Web)

P0:

- App shell, auth pages, design system, route scaffolding

P1:

- Feed, post composer, post detail/comments, profiles

P2:

- Messaging surfaces + realtime

P3:

- Gigs + wallet + payouts + tips

P4:

- Notifications, reporting, block/mute, basic moderation access if applicable

Everything beyond this is backlog.
