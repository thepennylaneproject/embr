# Embr: Agent Guide (Frontend Implementation)

## Mission

Bring the Embr web frontend from “standard browser chrome and ugly” to a coherent, branded, production-grade UI that cleanly wires to the completed backend.

Primary goal: ship the web app as a usable product, not a UI demo.

## Product Snapshot

Embr is a social platform with integrated freelance marketplace, monetization/wallet, messaging, moderation, and media uploads/video processing. The backend exposes REST endpoints plus Socket.io for realtime. :contentReference[oaicite:2]{index=2}

## Architecture Assumptions

- Monorepo with:
  - `apps/api` (NestJS)
  - `apps/web` (Next.js 14, Pages Router, TypeScript)
  - shared packages (types, utils, UI)
    If the repo differs, adapt to existing structure instead of inventing a new one. :contentReference[oaicite:3]{index=3}

## Operating Rules

1. Do not rewrite backend logic. Treat API contracts as source of truth.
2. Do not introduce heavy new dependencies unless needed. Prefer existing stack.
3. Implement UI in vertical slices, each slice includes:
   - page route
   - data fetching + error states
   - loading states
   - empty states
   - accessibility basics (keyboard focus, labels, aria where needed)
4. No dead UI. If a component exists, it must be wired.
5. Maintain consistent patterns: the same UI problem gets the same solution everywhere.

## Definition of Done (Frontend)

A feature slice is “done” when:

- It compiles, runs, and navigates via real routes
- It calls the API successfully (with auth where required)
- It has loading, empty, and error states
- It matches the Embr design system (tokens, type scale, spacing, components)
- It is responsive enough for mobile web
- It is accessible enough to not embarrass us

## Frontend Priorities (Build Order)

### P0: Foundation

- Global layout shell: header, nav, content container
- Auth gating: logged-in vs logged-out routes
- API client: token attach, refresh handling, error normalization
- Design tokens + base components (buttons, inputs, cards, modals, toast)
- Route skeletons for all major product areas

### P1: Social Core

- Feed (list, pagination)
- Post composer (text + media attach)
- Post detail (comments, replies)
- Profile view + edit
- Follow/unfollow, user cards

### P2: Messaging

- Conversation list
- Chat thread UI
- Realtime updates (Socket.io)
- Basic presence indicators if available

### P3: Marketplace + Money

- Gigs list + filters
- Gig detail + apply flow
- Milestones UI
- Wallet summary + transactions
- Tips UI
- Payout request flow

### P4: Safety + Notifications

- Notifications list
- Report content/user modal
- Block/mute UI
- Basic moderation surfaces if role-based access exists

## UX Requirements

- “Calm” UI, not frenetic. Reduce visual noise.
- Show intent: what page is for, what action matters, what happens next.
- Use consistent, human names: “Wallet”, “Gigs”, “Messages”, “Notifications”.
- Prefer progressive disclosure: keep surfaces simple, reveal complexity on demand.

## Testing Expectations (Lightweight)

- Add a small number of smoke tests for route rendering and critical forms if test setup already exists.
- At minimum, ensure no TypeScript errors, no broken routes, no runtime crashes on primary flows.

## Deliverables

- A working Next.js web app with styled, wired, navigable pages
- A UI system that can scale with the product’s breadth
- A short changelog per PR describing what shipped and how to verify
