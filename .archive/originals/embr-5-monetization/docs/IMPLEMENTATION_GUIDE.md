# Implementation Guide: Creator Monetization Module

This guide walks you through integrating the monetization module into your Embr application.

## Phase 1: Database Setup (15 minutes)

### 1.1 Verify Prisma Schema

The database models should already exist from Module 1. Verify these models:

```prisma
// Payment account for Stripe Connect
model Payment {
  id                      String   @id @default(uuid())
  userId                  String   @unique
  stripeConnectAccountId  String?
  onboardingCompleted     Boolean  @default(false)
  chargesEnabled          Boolean  @default(false)
  payoutsEnabled          Boolean  @default(false)
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt
  user                   User     @relation(fields: [userId], references: [id])
}

// Digital wallet
model Wallet {
  id        String   @id @default(uuid())
  userId    String   @unique
  balance   Float    @default(0)
  currency  String   @default("USD")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id])
}

// Tip transactions
model Tip {
  id                     String    @id @default(uuid())
  senderId               String
  recipientId            String
  postId                 String?
  amount                 Float
  message                String?
  status                 String    @default("PENDING")
  stripePaymentIntentId  String?
  completedAt            DateTime?
  refundReason           String?
  createdAt              DateTime  @default(now())
  sender                 User      @relation("TipsSent", fields: [senderId], references: [id])
  recipient              User      @relation("TipsReceived", fields: [recipientId], references: [id])
  post                   Post?     @relation(fields: [postId], references: [id])
}

// Payout requests
model Payout {
  id              String    @id @default(uuid())
  userId          String
  amount          Float
  currency        String    @default("USD")
  status          String    @default("PENDING")
  note            String?
  stripePayoutId  String?
  approvedBy      String?
  approvedAt      DateTime?
  rejectedBy      String?
  rejectedAt      DateTime?
  rejectionReason String?
  processedAt     DateTime?
  completedAt     DateTime?
  failureReason   String?
  createdAt       DateTime  @default(now())
  user            User      @relation(fields: [userId], references: [id])
}

// Transaction ledger
model Transaction {
  id            String    @id @default(uuid())
  userId        String
  type          String
  amount        Float
  description   String
  referenceId   String?
  referenceType String?
  metadata      Json?
  createdAt     DateTime  @default(now())
  user          User      @relation(fields: [userId], references: [id])

  @@index([userId, createdAt])
  @@index([referenceId])
}
```

### 1.2 Run Migrations

```bash
cd apps/api
npx prisma generate
npx prisma db push
```

## Phase 2: Backend Integration (45 minutes)

### 2.1 Install Dependencies

```bash
cd apps/api
npm install stripe@^13.0.0 class-validator class-transformer
```

### 2.2 Configure Environment

Add to `apps/api/.env`:

```bash
# Stripe Keys (Get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Webhook Secret (Get from Stripe CLI or Dashboard)
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend URL for Stripe redirects
FRONTEND_URL=http://localhost:3004
```

### 2.3 Copy Backend Files

```bash
# From module package
cp -r backend/dto apps/api/src/monetization/
cp -r backend/services apps/api/src/monetization/
cp -r backend/controllers apps/api/src/monetization/
cp -r backend/webhooks apps/api/src/monetization/
```

### 2.4 Create Monetization Module

```typescript
// apps/api/src/monetization/monetization.module.ts
import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

// Services
import { WalletService } from "./services/wallet.service";
import { TipService } from "./services/tip.service";
import { PayoutService } from "./services/payout.service";
import { StripeConnectService } from "./services/stripe-connect.service";
import { TransactionService } from "./services/transaction.service";

// Controllers
import { WalletController } from "./controllers/wallet.controller";
import { TipController } from "./controllers/tip.controller";
import { PayoutController } from "./controllers/payout.controller";
import { StripeConnectController } from "./controllers/stripe-connect.controller";
import { StripeWebhookController } from "./webhooks/stripe-webhook.controller";

@Module({
  controllers: [
    WalletController,
    TipController,
    PayoutController,
    StripeConnectController,
    StripeWebhookController,
  ],
  providers: [
    PrismaService,
    WalletService,
    TipService,
    PayoutService,
    StripeConnectService,
    TransactionService,
  ],
  exports: [
    WalletService,
    TipService,
    PayoutService,
    StripeConnectService,
    TransactionService,
  ],
})
export class MonetizationModule {}
```

### 2.5 Register Module

```typescript
// apps/api/src/app.module.ts
import { MonetizationModule } from "./monetization/monetization.module";

@Module({
  imports: [
    // ... other modules
    MonetizationModule,
  ],
})
export class AppModule {}
```

### 2.6 Configure Webhook Raw Body

The Stripe webhook requires raw body access. Update your main.ts:

```typescript
// apps/api/src/main.ts
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Enable raw body for webhooks
  });

  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();

  await app.listen(3003);
}
bootstrap();
```

### 2.7 Test Backend

```bash
npm run start:dev

# Test endpoints
curl http://localhost:3003/wallet
curl http://localhost:3003/stripe-connect/status
```

## Phase 3: Frontend Integration (45 minutes)

### 3.1 Install Dependencies

```bash
cd apps/web
npm install axios
```

### 3.2 Copy Frontend Files

```bash
# From module package
cp -r frontend/components apps/web/src/components/monetization/
cp -r frontend/hooks apps/web/src/hooks/monetization/
cp -r shared/types packages/types/monetization/
cp -r shared/api packages/api-client/monetization/
```

### 3.3 Configure API Base URL

```typescript
// apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3003
```

### 3.4 Create Wallet Page

```tsx
// apps/web/src/app/wallet/page.tsx
"use client";

import { WalletOverview } from "@/components/monetization/WalletOverview";
import { TransactionHistory } from "@/components/monetization/TransactionHistory";
import { PayoutRequest } from "@/components/monetization/PayoutRequest";

export default function WalletPage() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Your Wallet</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <WalletOverview />
          <TransactionHistory />
        </div>

        <div>
          <PayoutRequest />
        </div>
      </div>
    </div>
  );
}
```

### 3.5 Add Tip Buttons to Posts

```tsx
// In your PostCard component
import { TipButton } from "@/components/monetization/TipButton";

<TipButton
  recipientId={post.userId}
  postId={post.id}
  recipientName={post.user.profile.displayName}
  onTipComplete={() => {
    // Refresh post or show success
    toast.success("Tip sent!");
  }}
/>;
```

### 3.6 Create Settings Page for Payouts

```tsx
// apps/web/src/app/settings/payouts/page.tsx
"use client";

import { StripeConnectOnboarding } from "@/components/monetization/StripeConnectOnboarding";

export default function PayoutSettingsPage() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Payout Settings</h1>
      <StripeConnectOnboarding
        onComplete={() => {
          // Redirect or show success
          router.push("/wallet");
        }}
      />
    </div>
  );
}
```

## Phase 4: Stripe Configuration (30 minutes)

### 4.1 Create Stripe Account

1. Go to https://dashboard.stripe.com/register
2. Create test account
3. Complete business verification

### 4.2 Get API Keys

1. Navigate to Developers > API keys
2. Copy test mode keys:
   - Secret key (sk*test*...)
   - Publishable key (pk*test*...)

### 4.3 Enable Connect

1. Go to Connect > Settings
2. Enable Connect for your account
3. Configure branding (optional)

### 4.4 Set Up Webhooks

**Option A: Stripe CLI (Recommended for Development)**

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS
# or download from https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3003/webhooks/stripe

# Copy webhook signing secret to .env
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Option B: Stripe Dashboard (For Production)**

1. Go to Developers > Webhooks
2. Add endpoint: `https://your-domain.com/webhooks/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payout.paid`
   - `payout.failed`
   - `account.updated`
4. Copy webhook signing secret

### 4.5 Test Webhook

```bash
# Trigger test event
stripe trigger payment_intent.succeeded

# Check your logs
# Should see: "Received webhook: payment_intent.succeeded"
```

## Phase 5: Testing (30 minutes)

### 5.1 Create Test Users

```bash
# Use your auth system or seed script
POST /auth/signup
{
  "email": "creator@example.com",
  "password": "password123"
}

POST /auth/signup
{
  "email": "tipper@example.com",
  "password": "password123"
}
```

### 5.2 Test Wallet Creation

Wallets are automatically created on first access:

```bash
GET /wallet
# Should create wallet with $0 balance
```

### 5.3 Add Test Funds

```bash
POST /wallet/add-funds
{
  "amount": 100,
  "reason": "Test funds"
}
```

### 5.4 Test Tipping Flow

1. Login as tipper
2. Find post or profile
3. Click tip button
4. Select amount
5. Verify payment processes
6. Check recipient wallet increased
7. Check transaction history

### 5.5 Test Stripe Connect Onboarding

1. Login as creator
2. Go to settings/payouts
3. Click "Get Started"
4. Fill form with test data:
   - SSN: 000-00-0000
   - DOB: 01/01/1901
   - Bank Account: 000123456789 / 110000000
5. Complete onboarding
6. Verify account is active

### 5.6 Test Payout Request

1. Ensure wallet has >$10
2. Go to wallet page
3. Request payout
4. Login as admin
5. Approve payout
6. Wait for webhook
7. Verify payout completed

## Phase 6: Production Deployment

### 6.1 Switch to Live Mode

```bash
# Update .env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_... # from live webhook
```

### 6.2 Configure Production Webhook

1. Add webhook in Stripe Dashboard
2. Use production URL
3. Enable SSL/HTTPS
4. Update webhook secret

### 6.3 Enable Monitoring

```typescript
// Add monitoring service
import * as Sentry from "@sentry/node";

// In TransactionService
this.logger.error("Balance mismatch", { userId, difference });
Sentry.captureException(new Error("Balance integrity check failed"));
```

### 6.4 Set Payout Limits

```typescript
// In PayoutService
const DAILY_PAYOUT_LIMIT = 1000; // $1,000
const MONTHLY_PAYOUT_LIMIT = 10000; // $10,000

// Add checks before processing
```

### 6.5 Configure Alerts

Set up alerts for:

- Failed webhooks
- Balance mismatches
- Failed payouts
- High tip volumes
- Suspicious activity

## Troubleshooting

### Webhook Not Receiving Events

```bash
# Check Stripe CLI
stripe listen --forward-to localhost:3003/webhooks/stripe

# Verify endpoint
curl -X POST http://localhost:3003/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"type": "test"}'
```

### Balance Mismatch

```bash
# Run integrity check
GET /wallet/verify-integrity

# Review transaction history
GET /wallet/transactions

# Check for failed transactions
```

### Tip Payment Fails

1. Check Stripe logs in Dashboard
2. Verify payment method is valid
3. Check amount limits
4. Review error in application logs
5. Test with different payment method

### Onboarding Incomplete

1. Check Stripe Connect dashboard
2. Review required information
3. Clear browser cache
4. Use incognito mode
5. Check account verification status

## Next Steps

1. ✅ Complete acceptance criteria testing
2. ✅ Set up monitoring and alerts
3. ✅ Document admin procedures
4. ✅ Train support team
5. ✅ Create user help documentation
6. ✅ Plan marketing for monetization features
7. ✅ Set platform fee strategy
8. ✅ Configure tax reporting (if required)

## Resources

- [Stripe Connect Documentation](https://stripe.com/docs/connect)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Double-Entry Bookkeeping](https://en.wikipedia.org/wiki/Double-entry_bookkeeping)
