# Quick Start Guide

Get Module 5 running in 15 minutes.

## Prerequisites

- Embr backend (NestJS) running
- Embr frontend (Next.js) running
- PostgreSQL database with Prisma
- Stripe account (test mode)

## 1. Environment Setup (3 min)

```bash
# Get Stripe keys from https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...  # From Stripe CLI
FRONTEND_URL=http://localhost:3004
```

## 2. Install Dependencies (2 min)

```bash
# Backend
cd apps/api
npm install stripe class-validator class-transformer

# Frontend
cd apps/web
npm install axios
```

## 3. Copy Files (3 min)

```bash
# From module root
cp -r backend/* apps/api/src/monetization/
cp -r frontend/* apps/web/src/
cp -r shared/types/* packages/types/
cp -r shared/api/* packages/api-client/
```

## 4. Register Module (2 min)

```typescript
// apps/api/src/app.module.ts
import { MonetizationModule } from "./monetization/monetization.module";

@Module({
  imports: [
    // ...existing modules
    MonetizationModule,
  ],
})
export class AppModule {}
```

## 5. Start Webhook Listener (2 min)

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Forward webhooks
stripe listen --forward-to localhost:3003/webhooks/stripe

# Copy webhook secret to .env
```

## 6. Test It! (3 min)

```bash
# Start backend
npm run start:dev

# Test endpoints
curl http://localhost:3003/wallet
curl http://localhost:3003/stripe-connect/status

# Start frontend
npm run dev

# Visit http://localhost:3004/wallet
```

## Common URLs

- **Wallet Dashboard**: http://localhost:3004/wallet
- **Payout Settings**: http://localhost:3004/settings/payouts
- **Stripe Dashboard**: https://dashboard.stripe.com/test

## Quick Tests

### 1. Add Test Funds

```bash
POST http://localhost:3003/wallet/add-funds
{
  "amount": 100,
  "reason": "Test funds"
}
```

### 2. Send a Tip

```tsx
<TipButton
  recipientId="user-123"
  recipientName="@creator"
  onTipComplete={() => alert("Tip sent!")}
/>
```

### 3. Request Payout

1. Complete Stripe onboarding
2. Go to /wallet
3. Click "Request Payout"
4. Enter amount > $10

## Test Data

### Stripe Test Cards

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

### Test Bank Account

- Routing: `110000000`
- Account: `000123456789`

### Test Identity

- SSN: `000-00-0000`
- DOB: `01/01/1990`

## Troubleshooting

### Webhook Not Working

```bash
# Check Stripe CLI is running
stripe listen

# Verify endpoint responds
curl -X POST http://localhost:3003/webhooks/stripe
```

### Can't Request Payout

- Complete Stripe onboarding
- Ensure balance > $10
- No pending payouts

### Balance Mismatch

```bash
GET /wallet/verify-integrity
# Should return isValid: true
```

## Next Steps

1. ✅ Read full [README.md](./README.md)
2. ✅ Follow [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
3. ✅ Complete [ACCEPTANCE_CRITERIA.md](./ACCEPTANCE_CRITERIA.md)
4. ✅ Review [MODULE_SUMMARY.md](./MODULE_SUMMARY.md)

## Need Help?

Check the documentation:

- Full README: Complete setup guide
- Implementation Guide: Step-by-step integration
- Acceptance Criteria: Testing checklist
- Module Summary: Feature overview

---

**Time to first tip: ~15 minutes** 🚀
