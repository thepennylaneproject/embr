# Module 5: Monetization & Wallet System

**Complete implementation of creator monetization through tips, wallet management, Stripe Connect integration, and payout processing.**

---

## 📋 Overview

This module provides a comprehensive monetization system for Embr, enabling creators to:

- Receive tips on content and profiles
- Manage wallet balances and transaction history
- Connect bank accounts via Stripe Connect
- Request and receive payouts
- Track earnings with detailed analytics

### ✅ Acceptance Criteria Status

- ✅ **Tips process successfully to wallets** - Full tip flow with platform fees
- ✅ **Balance calculations are accurate** - Double-entry bookkeeping system
- ✅ **Stripe onboarding completes** - Express Connect integration
- ✅ **Payouts process to bank accounts** - Approval workflow + Stripe transfers
- ✅ **Transaction history is auditable** - Complete ledger with all entries

---

## 🏗️ Architecture

### Database Schema

The module adds the following models to your Prisma schema:

```
Wallet
├── Transactions (1:N)
├── LedgerEntries (1:N) - Double-entry bookkeeping
├── Payouts (1:N)
├── Tips Sent (1:N)
└── Tips Received (1:N)
```

**Key Features:**

- Double-entry bookkeeping for audit trail
- Separate tracking of available vs. pending balance
- Stripe Connect account integration
- KYC status tracking

### Backend Services

**WalletService** - Core business logic

- Wallet creation and balance management
- Tip processing with platform fees (15%)
- Double-entry ledger system
- Stripe Connect account creation
- Payout request and approval workflow
- Transaction history with filtering

**Key Methods:**

```typescript
- getOrCreateWallet(userId)
- getWalletBalance(userId)
- sendTip(senderId, recipientId, amount, postId?, message?)
- createStripeConnectAccount(userId)
- requestPayout(userId, amount, notes?)
- approvePayout(payoutId, adminId, notes?)
```

### Frontend Components

**WalletDashboard** - Main wallet interface

- Balance display (available, pending, lifetime)
- Transaction history with filtering
- Payout management
- Analytics overview

**TipButton & TipModal** - Tip flow UI

- Quick amount selection
- Custom amount entry
- Optional message attachment
- Anonymous tip option
- Real-time fee calculation

**Hooks:**

- `useWallet()` - Centralized wallet state management
- `useTransactions()` - Transaction list with pagination
- `usePayouts()` - Payout history management

---

## 🚀 Installation & Setup

### 1. Database Migration

Add the Prisma schema additions to your main schema:

```bash
# Copy schema additions
cat database/prisma-schema-additions.prisma >> prisma/schema.prisma

# Run migration
npx prisma migrate dev --name add_monetization_system
```

### 2. Environment Variables

Add to your `.env`:

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend URL for Stripe Connect redirects
FRONTEND_URL=http://localhost:3004

# Platform fee configuration (optional, defaults in code)
PLATFORM_FEE_TIP_PERCENTAGE=0.15
PLATFORM_FEE_PAYWALL_PERCENTAGE=0.20
PLATFORM_FEE_GIG_PERCENTAGE=0.15

# Payout configuration (optional)
MINIMUM_PAYOUT_AMOUNT=2000  # $20.00
PAYOUT_FEE_PERCENTAGE=0.0025  # 0.25%
PAYOUT_FEE_FIXED=25  # $0.25
```

### 3. Backend Integration

**Install dependencies:**

```bash
cd backend
npm install stripe
```

**Register the module:**

```typescript
// app.module.ts
import { WalletController } from "./controllers/wallet.controller";
import { WalletService } from "./services/wallet.service";

@Module({
  controllers: [WalletController],
  providers: [WalletService],
})
export class AppModule {}
```

### 4. Frontend Integration

**Install dependencies:**

```bash
cd frontend
npm install @stripe/stripe-js
```

**Add to your routes:**

```typescript
// App.tsx or router config
import { WalletDashboard } from './pages/WalletDashboard';

<Route path="/wallet" element={<WalletDashboard />} />
```

**Use the TipButton on posts:**

```typescript
import { TipButton } from '@/components/TipButton';

<TipButton
  recipientId={post.authorId}
  recipientName={post.author.displayName}
  recipientAvatar={post.author.avatarUrl}
  postId={post.id}
/>
```

---

## 💡 Usage Examples

### 1. Sending a Tip

**Frontend:**

```typescript
import { useWallet } from '@/hooks/useWallet';

function PostCard({ post }) {
  const { sendTip } = useWallet();

  const handleTip = async () => {
    try {
      const result = await sendTip(
        post.authorId,
        500, // $5.00 in cents
        post.id,
        'Great content!',
        false // not anonymous
      );

      console.log('Tip sent:', result);
      // Show success message
    } catch (error) {
      console.error('Tip failed:', error);
      // Show error message
    }
  };

  return <TipButton onClick={handleTip} />;
}
```

**Backend API:**

```typescript
POST /api/wallet/tip
{
  "recipientId": "user-123",
  "amount": 500,
  "postId": "post-456",
  "message": "Great content!",
  "isAnonymous": false
}

Response:
{
  "tipId": "tip-789",
  "transactionId": "txn-abc",
  "amount": 500,
  "fee": 75,
  "newBalance": 2500,
  "recipient": {
    "id": "user-123",
    "username": "creator",
    "displayName": "Creator Name"
  }
}
```

### 2. Stripe Connect Onboarding

**Frontend:**

```typescript
import { useWallet } from '@/hooks/useWallet';

function StripeOnboarding() {
  const { createStripeAccount } = useWallet();

  const startOnboarding = async () => {
    try {
      const { onboardingUrl } = await createStripeAccount();

      // Redirect to Stripe
      window.location.href = onboardingUrl;
    } catch (error) {
      console.error('Onboarding failed:', error);
    }
  };

  return (
    <button onClick={startOnboarding}>
      Connect Bank Account
    </button>
  );
}
```

### 3. Requesting a Payout

**Frontend:**

```typescript
import { useWallet } from '@/hooks/useWallet';

function RequestPayout() {
  const { balance, requestPayout } = useWallet();

  const handlePayout = async () => {
    try {
      const result = await requestPayout(
        balance.balance, // Payout full balance
        'Monthly payout request'
      );

      console.log('Payout requested:', result);
      // Show success message
    } catch (error) {
      console.error('Payout failed:', error);
      // Show error message
    }
  };

  return (
    <button
      onClick={handlePayout}
      disabled={balance.balance < 2000}
    >
      Request Payout ({formatCurrency(balance.balance)})
    </button>
  );
}
```

### 4. Admin Payout Approval

**Backend:**

```typescript
POST /api/wallet/admin/payout/approve
{
  "payoutId": "payout-123",
  "notes": "Approved for processing"
}

// Or reject:
POST /api/wallet/admin/payout/reject
{
  "payoutId": "payout-123",
  "reason": "Verification required",
  "notes": "Please update KYC documents"
}
```

---

## 🔐 Security Considerations

### 1. Double-Entry Bookkeeping

All financial transactions use double-entry accounting:

- Debits and credits must always balance
- Every transaction creates matching ledger entries
- Wallet balances are recalculated from ledger
- Provides complete audit trail

### 2. Platform Fees

Platform fees are automatically calculated and deducted:

- **Tips:** 15% fee (minimum $0.10)
- **Paywall content:** 20% fee
- **Gig payments:** 15% fee

Fee calculation is server-side to prevent tampering.

### 3. Payout Approval Workflow

1. Creator requests payout
2. Payout enters `pending` status
3. Admin reviews and approves/rejects
4. On approval, Stripe transfer is created
5. Status updates to `processing` → `paid`

### 4. Stripe Connect Security

- Express Connect accounts for simplified onboarding
- KYC verification through Stripe
- Payouts only enabled after verification
- Bank account information stored only in Stripe

---

## 📊 Database Schema Details

### Wallet Model

```typescript
model Wallet {
  id                    String    @id @default(uuid())
  userId                String    @unique
  balance               Int       // Available balance in cents
  pendingBalance        Int       // Funds in escrow
  lifetimeEarned        Int       // All-time earnings
  lifetimeSpent         Int       // All-time spending
  stripeAccountId       String?   @unique
  stripeAccountStatus   StripeAccountStatus
  kycStatus             KycStatus
  canReceivePayments    Boolean
  canRequestPayouts     Boolean
  createdAt             DateTime
  updatedAt             DateTime
}
```

### Transaction Model

```typescript
model Transaction {
  id                    String            @id
  walletId              String
  type                  TransactionType   // tip_sent, tip_received, etc.
  amount                Int               // In cents (+ or -)
  fee                   Int               // Platform fee
  netAmount             Int               // After fee
  status                TransactionStatus
  description           String
  relatedUserId         String?
  relatedPostId         String?
  relatedGigId          String?
  stripePaymentIntentId String?
  stripeTransferId      String?
  metadata              Json?
  createdAt             DateTime
  completedAt           DateTime?
}
```

### LedgerEntry Model (Double-Entry)

```typescript
model LedgerEntry {
  id              String          @id
  transactionId   String
  walletId        String
  entryType       LedgerEntryType // debit or credit
  amount          Int             // Always positive
  balance         Int             // Wallet balance after entry
  description     String
  createdAt       DateTime
}
```

### Payout Model

```typescript
model Payout {
  id                String        @id
  userId            String
  walletId          String
  amount            Int           // Requested amount
  fee               Int           // Transfer fee
  netAmount         Int           // Amount sent to bank
  status            PayoutStatus  // pending, approved, etc.
  stripeTransferId  String?
  stripePayoutId    String?
  bankAccountLast4  String?
  requestedAt       DateTime
  approvedAt        DateTime?
  approvedBy        String?       // Admin user ID
  paidAt            DateTime?
  rejectedAt        DateTime?
  rejectionReason   String?
  notes             String?
  transactionId     String        @unique
}
```

---

## 🧪 Testing

### Unit Tests

```typescript
// wallet.service.spec.ts
describe("WalletService", () => {
  it("should send tip and deduct from sender balance", async () => {
    const result = await service.sendTip(
      senderId,
      recipientId,
      1000, // $10.00
    );

    expect(result.amount).toBe(1000);
    expect(result.fee).toBe(150); // 15%
    expect(result.newBalance).toBe(previousBalance - 1000);
  });

  it("should prevent tips below minimum amount", async () => {
    await expect(
      service.sendTip(senderId, recipientId, 50), // $0.50
    ).rejects.toThrow("Minimum tip amount is $1.00");
  });

  it("should prevent tipping yourself", async () => {
    await expect(service.sendTip(userId, userId, 1000)).rejects.toThrow(
      "You cannot tip yourself",
    );
  });
});
```

### Integration Tests

```typescript
describe("Tip Flow (E2E)", () => {
  it("should complete full tip transaction", async () => {
    // 1. Send tip
    const tipResult = await request(app)
      .post("/api/wallet/tip")
      .send({ recipientId, amount: 1000 })
      .expect(200);

    // 2. Verify sender balance decreased
    const senderBalance = await request(app)
      .get("/api/wallet/balance")
      .expect(200);

    expect(senderBalance.body.balance).toBe(previousBalance - 1000);

    // 3. Verify recipient balance increased
    const recipientBalance = await getRecipientBalance(recipientId);
    expect(recipientBalance).toBe(previousRecipientBalance + 850); // 15% fee

    // 4. Verify ledger entries balance
    const ledgerEntries = await getLedgerEntries(tipResult.body.transactionId);
    const totalDebits = sum(ledgerEntries.filter((e) => e.type === "debit"));
    const totalCredits = sum(ledgerEntries.filter((e) => e.type === "credit"));
    expect(totalDebits).toBe(totalCredits);
  });
});
```

---

## 📈 Analytics & Reporting

The module provides analytics endpoints:

```typescript
GET /api/wallet/analytics/earnings?period=month
GET /api/wallet/analytics/spending?period=month
GET /api/wallet/analytics/top-posts
GET /api/wallet/analytics/top-tippers
```

These can be used to build creator dashboards showing:

- Earnings over time
- Top earning content
- Top supporters
- Revenue by type (tips, paywall, gigs)

---

## 🔄 Webhook Integration

Handle Stripe webhooks for real-time updates:

```typescript
@Post('webhooks/stripe')
async handleStripeWebhook(@Body() event: Stripe.Event) {
  switch (event.type) {
    case 'account.updated':
      // Update Stripe Connect account status
      await this.walletService.updateStripeAccountStatus(userId);
      break;

    case 'payout.paid':
      // Mark payout as completed
      await this.walletService.markPayoutPaid(payoutId);
      break;

    case 'payout.failed':
      // Mark payout as failed
      await this.walletService.markPayoutFailed(payoutId, reason);
      break;
  }
}
```

---

## 🎨 Design System Integration

The UI components use Embr's muted coral design system:

**Colors:**

- Primary: `#E8998D` (embr-coral)
- Secondary: `#C9ADA7` (embr-clay)
- Tertiary: `#9A8C98` (embr-mauve)

**Tailwind Config:**

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        "embr-coral": "#E8998D",
        "embr-clay": "#C9ADA7",
        "embr-mauve": "#9A8C98",
      },
    },
  },
};
```

---

## 🚨 Error Handling

The service provides specific error types:

```typescript
-InsufficientBalanceError - PayoutNotAllowedError - StripeAccountNotSetupError;
```

Frontend should handle these gracefully:

```typescript
try {
  await sendTip(recipientId, amount);
} catch (error) {
  if (error.name === "InsufficientBalanceError") {
    showModal("Please add funds to your wallet");
  } else if (error.name === "PayoutNotAllowedError") {
    showModal("Complete Stripe onboarding to request payouts");
  } else {
    showModal("Something went wrong. Please try again.");
  }
}
```

---

## 📦 Deliverables

### Backend

- ✅ WalletService with full business logic
- ✅ WalletController with all API endpoints
- ✅ Complete DTOs with validation
- ✅ Prisma schema additions
- ✅ Double-entry bookkeeping system

### Frontend

- ✅ WalletDashboard component
- ✅ TipButton and TipModal components
- ✅ useWallet React hook
- ✅ Transaction list component
- ✅ Payout request modal
- ✅ Stripe Connect onboarding flow

### Shared

- ✅ Complete TypeScript types
- ✅ Utility functions (formatCurrency, calculateFee)
- ✅ Error classes

---

## 🔮 Future Enhancements

1. **Subscriptions** - Monthly creator subscriptions
2. **Scheduled Payouts** - Automatic weekly/monthly payouts
3. **Currency Support** - Multi-currency wallets
4. **Tax Reporting** - Automated 1099 generation
5. **Recurring Tips** - Monthly supporter system
6. **Gift Cards** - Embr balance gift codes
7. **Wallet Top-Up** - Credit card → wallet balance
8. **Tip Multipliers** - Special events with 2x tips

---

## 📞 Support

For questions or issues:

1. Check this documentation
2. Review the code comments
3. Test with Stripe test mode
4. Check Stripe Connect documentation

---

**Module 5 Status: ✅ COMPLETE**

All acceptance criteria met:

- ✅ Tips process successfully
- ✅ Accurate balance calculations
- ✅ Stripe onboarding functional
- ✅ Payouts to bank accounts
- ✅ Auditable transaction history
