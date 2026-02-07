# Module 5: Creator Monetization

Complete wallet system, tipping functionality, Stripe Connect integration, and payout management for Embr.

## Overview

This module enables creator monetization through:

- **Digital Wallet**: Balance tracking with available/pending breakdown
- **Tipping System**: Send tips to creators on posts and profiles
- **Stripe Connect**: Creator onboarding for receiving payments
- **Payout Requests**: Creator-initiated payouts with admin approval workflow
- **Transaction Ledger**: Double-entry bookkeeping for auditable financial records

## Package Contents

### Backend (NestJS)

- **Services**: WalletService, TipService, PayoutService, StripeConnectService, TransactionService
- **Controllers**: WalletController, TipController, PayoutController, StripeConnectController
- **Webhooks**: StripeWebhookController for handling payment events
- **DTOs**: Complete validation with class-validator

### Frontend (React/Next.js)

- **Components**: WalletOverview, TransactionHistory, TipButton, TipModal, StripeConnectOnboarding, PayoutRequest
- **Hooks**: useWallet, useTips, usePayouts, useStripeConnect
- **API Client**: Complete TypeScript API client with error handling

### Shared

- **Types**: Complete TypeScript definitions for all entities
- **API Client**: Centralized API functions with axios

## Quick Start

### Prerequisites

```bash
# Environment variables required
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=http://localhost:3004
DATABASE_URL=postgresql://...
```

### Installation

1. **Install Dependencies**

```bash
# Backend
cd apps/api
npm install stripe class-validator class-transformer

# Frontend
cd apps/web
npm install axios
```

2. **Copy Module Files**

```bash
# Backend
cp -r backend/* apps/api/src/
cp -r shared/* packages/types/

# Frontend
cp -r frontend/* apps/web/src/
```

3. **Update NestJS Module**

```typescript
// apps/api/src/app.module.ts
import {
  WalletService,
  TipService,
  PayoutService,
  StripeConnectService,
  TransactionService,
} from "./services";
import {
  WalletController,
  TipController,
  PayoutController,
  StripeConnectController,
} from "./controllers";
import { StripeWebhookController } from "./webhooks";

@Module({
  imports: [
    /* ... */
  ],
  controllers: [
    WalletController,
    TipController,
    PayoutController,
    StripeConnectController,
    StripeWebhookController,
  ],
  providers: [
    WalletService,
    TipService,
    PayoutService,
    StripeConnectService,
    TransactionService,
  ],
})
export class AppModule {}
```

4. **Configure Stripe Webhook**

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Forward webhooks to local
stripe listen --forward-to localhost:3003/webhooks/stripe

# Get webhook signing secret
stripe listen --print-secret
```

### Usage Examples

#### Frontend: Tip a Creator

```tsx
import { TipButton } from "@/components/TipButton";

<TipButton
  recipientId="user-123"
  postId="post-456"
  recipientName="@creator"
  onTipComplete={() => console.log("Tip sent!")}
  variant="button"
  size="md"
/>;
```

#### Frontend: Show Wallet Balance

```tsx
import { WalletOverview } from "@/components/WalletOverview";

<WalletOverview
  onRequestPayout={() => navigate("/payouts")}
  onViewTransactions={() => navigate("/transactions")}
/>;
```

#### Backend: Create Tip

```typescript
// POST /tips
{
  "recipientId": "user-123",
  "postId": "post-456", // optional
  "amount": 5.00,
  "preset": "MEDIUM",
  "message": "Great content!"
}
```

## Features

### 1. Wallet System

**Balance Tracking**

- Available balance (withdrawable immediately)
- Pending balance (in payouts)
- Total balance

**Transaction History**

- Complete ledger with double-entry bookkeeping
- Filter by type (tips, payouts, fees, refunds)
- Date range filtering
- Pagination

**Balance Verification**

- Integrity checks ensure calculated balance matches actual balance
- Automatic reconciliation
- Audit trail for all transactions

### 2. Tipping

**Tip Amounts**

- Preset amounts: $1 (Small), $5 (Medium), $10 (Large)
- Custom amounts: $0.50 - $1,000
- Platform fee: 5%

**Tip Flow**

1. User selects amount and adds optional message
2. Payment processed through Stripe
3. Net amount (95%) added to recipient wallet
4. Platform fee (5%) recorded separately
5. Notification sent to recipient

**Features**

- Tip on posts or profiles
- Anonymous or with message
- Real-time balance updates
- Transaction history with details

### 3. Stripe Connect

**Creator Onboarding**

1. Create Express Connect account
2. Complete Stripe onboarding form
3. Verify identity and bank details
4. Enable payouts

**Account Management**

- Check onboarding status
- View connected bank accounts
- Re-authenticate if needed
- Account details display

**Security**

- Stripe-hosted onboarding (no sensitive data stored)
- Automatic webhook updates
- Account verification requirements
- PCI compliance through Stripe

### 4. Payout System

**Payout Requests**

- Minimum: $10
- Maximum: Available balance
- Optional note for reference
- One pending request at a time

**Approval Workflow**

1. Creator submits payout request
2. Admin reviews request
3. Admin approves or rejects
4. If approved, payout processed to Stripe
5. Stripe sends to bank account
6. Status updated via webhook

**Payout Timeline**

- Request → Pending
- Admin approval → Approved
- Stripe processing → Processing
- Bank transfer → Completed
- Typical time: 2-5 business days

### 5. Double-Entry Bookkeeping

**Transaction Ledger**

- Every transaction has debit and credit entries
- Balance integrity verification
- Complete audit trail
- Financial reporting

**Transaction Types**

- `TIP_RECEIVED` / `TIP_SENT`
- `PAYOUT`
- `FEE` (platform fees)
- `REFUND`
- `ADJUSTMENT` (admin actions)

## API Endpoints

### Wallet

- `GET /wallet` - Get wallet details
- `GET /wallet/balance` - Get balance breakdown
- `GET /wallet/stats` - Get earning statistics
- `GET /wallet/transactions` - Get transaction history
- `GET /wallet/financial-summary` - Get summary for date range

### Tips

- `POST /tips` - Create a tip
- `GET /tips` - Get tips (sent/received)
- `GET /tips/stats` - Get tip statistics
- `GET /tips/post/:postId` - Get tips for post
- `POST /tips/:id/refund` - Refund tip (admin)

### Payouts

- `POST /payouts/request` - Request payout
- `GET /payouts` - Get payout history
- `GET /payouts/stats` - Get payout statistics
- `GET /payouts/pending` - Get pending payouts (admin)
- `POST /payouts/:id/approve` - Approve payout (admin)
- `POST /payouts/:id/reject` - Reject payout (admin)

### Stripe Connect

- `POST /stripe-connect/account` - Create account
- `GET /stripe-connect/status` - Get account status
- `GET /stripe-connect/account` - Get account details
- `POST /stripe-connect/account-link` - Get onboarding link
- `POST /stripe-connect/complete` - Complete onboarding

### Webhooks

- `POST /webhooks/stripe` - Handle Stripe events

## Testing

### Manual Testing

1. **Create Test User Wallets**

```bash
# Using seed script or API
POST /wallet/add-funds
{
  "amount": 100,
  "reason": "Test funds"
}
```

2. **Test Tip Flow**

```bash
# Create tip
POST /tips
{
  "recipientId": "user-123",
  "amount": 5.00,
  "message": "Test tip"
}

# Verify wallet balance updated
GET /wallet/balance

# Check transaction history
GET /wallet/transactions
```

3. **Test Stripe Connect**

```bash
# Start onboarding
POST /stripe-connect/account
{
  "email": "creator@example.com",
  "country": "US"
}

# Use test data: https://stripe.com/docs/connect/testing
```

4. **Test Payout Request**

```bash
# Request payout
POST /payouts/request
{
  "amount": 25.00,
  "note": "Test payout"
}

# Approve (as admin)
POST /payouts/{id}/approve
```

### Stripe Test Mode

Use Stripe test mode for development:

- Test credit card: `4242 4242 4242 4242`
- Test Connect accounts: Use provided test data
- Webhook testing: Use Stripe CLI

### Balance Verification

```bash
# Verify wallet integrity
GET /wallet/verify-integrity

# Should return:
{
  "isValid": true,
  "calculatedBalance": 100.00,
  "actualBalance": 100.00,
  "difference": 0.00
}
```

## Troubleshooting

### Common Issues

**Webhook Errors**

- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Check Stripe CLI is forwarding events
- Ensure webhook endpoint is accessible

**Insufficient Balance**

- Check available vs. pending balance
- Verify no pending payouts
- Review transaction history

**Onboarding Issues**

- Clear browser cache
- Use incognito mode
- Verify Stripe account is in test mode
- Check account requirements in Stripe dashboard

**Payout Failures**

- Verify Stripe Connect account is active
- Check bank account details
- Review payout limits and restrictions

## Security Considerations

1. **Payment Data**
   - Never store credit card details
   - Use Stripe.js for client-side tokenization
   - PCI compliance through Stripe

2. **Webhooks**
   - Always verify webhook signatures
   - Use HTTPS in production
   - Log all webhook events

3. **Admin Actions**
   - Require admin role for approvals
   - Log all admin actions
   - Rate limit payout requests

4. **Balance Protection**
   - Verify balance before payouts
   - Use database transactions
   - Implement double-entry bookkeeping

## Production Checklist

- [ ] Switch to live Stripe keys
- [ ] Configure production webhook URL
- [ ] Set up monitoring and alerts
- [ ] Enable fraud detection
- [ ] Configure payout schedules
- [ ] Set platform fee percentage
- [ ] Test full payout cycle
- [ ] Document admin procedures
- [ ] Set up customer support flow
- [ ] Enable transaction exports

## Support

For issues or questions:

1. Check [Stripe Connect docs](https://stripe.com/docs/connect)
2. Review [Stripe webhook guide](https://stripe.com/docs/webhooks)
3. Test with Stripe CLI
4. Check application logs
