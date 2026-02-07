# Module 5: Architecture & Data Flow

Visual guide to the monetization system architecture.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         EMBR PLATFORM                           │
│                                                                 │
│  ┌─────────────────┐      ┌──────────────────────────────┐    │
│  │   User Layer    │      │      Creator Layer           │    │
│  │                 │      │                              │    │
│  │  - Browse Posts │      │  - Create Content            │    │
│  │  - Send Tips    │      │  - Receive Tips              │    │
│  │  - View Wallet  │      │  - Request Payouts           │    │
│  └────────┬────────┘      └──────────────┬───────────────┘    │
│           │                              │                     │
└───────────┼──────────────────────────────┼─────────────────────┘
            │                              │
            └──────────────┬───────────────┘
                           │
                ┌──────────▼──────────┐
                │   Frontend (React)  │
                │                     │
                │  - WalletDashboard  │
                │  - TipButton        │
                │  - useWallet Hook   │
                └──────────┬──────────┘
                           │ HTTP/REST
                ┌──────────▼──────────┐
                │  Backend (NestJS)   │
                │                     │
                │  - WalletController │
                │  - WalletService    │
                └──────────┬──────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
    ┌──────▼──────┐ ┌─────▼──────┐ ┌─────▼──────┐
    │ PostgreSQL  │ │  Stripe    │ │   Redis    │
    │  Database   │ │  Connect   │ │   Cache    │
    │             │ │            │ │            │
    │  - Wallet   │ │  - Accounts│ │  - Sessions│
    │  - Txns     │ │  - Payouts │ │  - Locks   │
    │  - Ledger   │ │  - Transfers│ │            │
    └─────────────┘ └────────────┘ └────────────┘
```

---

## Tip Flow

```
┌──────────┐                                          ┌──────────┐
│  Sender  │                                          │ Receiver │
└────┬─────┘                                          └────┬─────┘
     │                                                      │
     │ 1. Click Tip Button                                 │
     ├─────────────────────────────────┐                   │
     │                                 │                   │
     │ 2. Select Amount ($5)           │                   │
     ├─────────────────────────────────┤                   │
     │                                 │                   │
     │ 3. Add Message (optional)       │                   │
     ├─────────────────────────────────┤                   │
     │                                 │                   │
     │ 4. Submit Tip                   │                   │
     │                                 ▼                   │
     │                          ┌────────────┐             │
     │                          │  Backend   │             │
     │                          │  Service   │             │
     │                          └─────┬──────┘             │
     │                                │                    │
     │                         5. Validate Balance        │
     │                                │                    │
     │                         6. Calculate Fee (15%)     │
     │                                │                    │
     │                    ┌───────────▼────────────┐      │
     │                    │   Database Transaction │      │
     │                    │                        │      │
     │         ┌──────────┼─────────────────┐      │      │
     │         │          │                 │      │      │
     │         │  a) Create Transactions    │      │      │
     │         │  b) Create Ledger Entries  │      │      │
     │         │  c) Update Wallet Balances │      │      │
     │         │  d) Create Tip Record      │      │      │
     │         │                             │      │      │
     │         └─────────────────────────────┘      │      │
     │                                               │      │
     │ 7. Balance Updated (-$5.00)                  │      │
     ◄─────────────────────────────────────────────┤      │
     │                                               │      │
     │                                               │      │
     │                          8. Balance Updated  │      │
     │                             (+$4.25 net)     │      │
     │                                               ├─────►│
     │                                               │      │
     │ 9. Success Notification                      │      │
     ◄─────────────────────────────────────────────┤      │
     │                                               │      │
     │                                        10. Tip      │
     │                                        Notification │
     │                                               ├─────►│
     │                                               │      │
```

**Fee Breakdown:**
- Tip Amount: $5.00
- Platform Fee (15%): $0.75
- Creator Receives: $4.25

---

## Payout Flow

```
┌──────────┐
│ Creator  │
└────┬─────┘
     │
     │ 1. Click "Request Payout"
     │    (Balance: $50.00)
     │
     │ 2. Enter Amount ($50)
     │
     │ 3. Add Notes (optional)
     │
     │ 4. Submit Request
     │
     ├──────────────────────────────┐
     │                              ▼
     │                       ┌────────────┐
     │                       │  Backend   │
     │                       └─────┬──────┘
     │                             │
     │                      5. Validate:
     │                         - Balance >= $50
     │                         - Stripe Connected
     │                         - KYC Verified
     │                             │
     │                   ┌─────────▼──────────┐
     │                   │  Create Payout     │
     │                   │  Status: PENDING   │
     │                   └─────────┬──────────┘
     │                             │
     │ 6. Payout Requested         │
     ◄─────────────────────────────┤
     │                             │
     │                             │
     │                    ┌────────▼────────┐
     │                    │  Admin Queue    │
     │                    └────────┬────────┘
     │                             │
     │                   ┌─────────▼──────────┐
     │                   │   Admin Reviews    │
     │                   │   - Checks KYC     │
     │                   │   - Verifies User  │
     │                   │   - Approves       │
     │                   └─────────┬──────────┘
     │                             │
     │                    ┌────────▼────────┐
     │                    │ Create Stripe   │
     │                    │ Transfer        │
     │                    └────────┬────────┘
     │                             │
     │                   ┌─────────▼──────────┐
     │                   │  Update Database   │
     │                   │  Status: PROCESSING│
     │                   │  - Deduct Balance  │
     │                   │  - Record Transfer │
     │                   └─────────┬──────────┘
     │                             │
     │                    ┌────────▼────────┐
     │                    │  Stripe Sends   │
     │                    │  to Bank        │
     │                    │  (2-5 days)     │
     │                    └────────┬────────┘
     │                             │
     │ 7. Payout Complete          │
     │    (Email Notification)     │
     ◄─────────────────────────────┘
     │
     │ Final Balance: $0.00
     │ Bank Balance: +$49.63 (after fees)
     │
```

**Payout Fee Breakdown:**
- Payout Amount: $50.00
- Platform Fee (0.25%): $0.13
- Fixed Fee: $0.25
- Total Fee: $0.38
- Bank Receives: $49.62

---

## Double-Entry Bookkeeping Flow

```
┌─────────────────────────────────────────────────────────┐
│                    TIP TRANSACTION                      │
│                                                         │
│  Sender sends $10 tip → Receiver gets $8.50 (15% fee) │
└─────────────────────────────────────────────────────────┘

┌───────────────────┐
│ Sender's Wallet   │
│ Before: $50.00    │
└──────┬────────────┘
       │
       │ CREDIT (decrease): -$10.00
       │
       ▼
┌───────────────────┐
│ Ledger Entry #1   │
│ Type: Credit      │
│ Amount: $10.00    │
│ Balance: $40.00   │
└───────────────────┘

       ╔═══════════════════════════════╗
       ║  MUST BALANCE: Debits = Credits ║
       ╚═══════════════════════════════╝

┌───────────────────┐
│ Receiver's Wallet │
│ Before: $100.00   │
└──────┬────────────┘
       │
       │ DEBIT (increase): +$8.50
       │
       ▼
┌───────────────────┐
│ Ledger Entry #2   │
│ Type: Debit       │
│ Amount: $8.50     │
│ Balance: $108.50  │
└───────────────────┘

┌───────────────────┐
│ Platform Revenue  │
│ Before: $0.00     │
└──────┬────────────┘
       │
       │ DEBIT (increase): +$1.50
       │
       ▼
┌───────────────────┐
│ Ledger Entry #3   │
│ Type: Debit       │
│ Amount: $1.50     │
│ Balance: $1.50    │
└───────────────────┘

VALIDATION:
Credits = $10.00
Debits = $8.50 + $1.50 = $10.00
✓ BALANCED
```

---

## Database Entity Relationships

```
┌────────────┐
│    User    │
│            │
│  id        │
│  email     │
│  username  │
└─────┬──────┘
      │
      │ 1:1
      │
┌─────▼──────┐          ┌────────────────┐
│   Wallet   │ 1:N      │  Transaction   │
│            ├─────────►│                │
│  id        │          │  id            │
│  userId    │          │  walletId      │
│  balance   │          │  type          │
│  pending   │          │  amount        │
│            │          │  fee           │
│            │          │  status        │
└─────┬──────┘          └────────┬───────┘
      │                          │
      │ 1:N                      │ 1:N
      │                          │
┌─────▼──────┐          ┌────────▼───────┐
│  Payout    │          │ LedgerEntry    │
│            │          │                │
│  id        │          │  id            │
│  walletId  │          │  transactionId │
│  amount    │          │  entryType     │
│  status    │          │  amount        │
│  stripe... │          │  balance       │
└────────────┘          └────────────────┘

      ┌────────────┐
      │    Tip     │
      │            │
      │  id        │
      │  senderId  │
      │  receiverId│
      │  amount    │
      │  fee       │
      │  postId    │
      └────────────┘
```

---

## Stripe Connect Flow

```
┌──────────┐
│ Creator  │
└────┬─────┘
     │
     │ 1. Click "Connect Bank Account"
     │
     ├────────────────────────┐
     │                        ▼
     │                 ┌────────────┐
     │                 │  Backend   │
     │                 └─────┬──────┘
     │                       │
     │                2. Create Stripe
     │                   Connect Account
     │                       │
     │                       ▼
     │                 ┌───────────┐
     │                 │  Stripe   │
     │                 │   API     │
     │                 └─────┬─────┘
     │                       │
     │                3. Generate
     │                   Onboarding URL
     │                       │
     │ 4. Redirect           │
     ◄───────────────────────┤
     │                       │
     ▼                       │
┌────────────────┐           │
│  Stripe Page   │           │
│                │           │
│  - Enter Name  │           │
│  - Add Bank    │           │
│  - Verify ID   │           │
└────────┬───────┘           │
         │                   │
         │ 5. Complete Form  │
         │                   │
         ├───────────────────►
         │                   │
         │              6. Verify
         │                 Info
         │                   │
         │ 7. Redirect Back  │
         ◄───────────────────┤
         │                   │
         ▼                   │
┌────────────────┐           │
│   Success!     │           │
│                │           │
│  ✓ Connected   │           │
│  ✓ Verified    │           │
│  ✓ Can Payout  │           │
└────────────────┘           │
                             │
                      8. Webhook:
                      account.updated
                             │
                             ▼
                      ┌────────────┐
                      │  Backend   │
                      │            │
                      │  Update    │
                      │  Wallet    │
                      │  Status    │
                      └────────────┘
```

---

## File Organization

```
module-5-monetization/
│
├── backend/
│   ├── controllers/
│   │   └── wallet.controller.ts
│   │       ├── GET  /balance
│   │       ├── GET  /transactions
│   │       ├── POST /tip
│   │       ├── POST /payout/request
│   │       └── POST /admin/payout/approve
│   │
│   └── services/
│       └── wallet.service.ts
│           ├── getOrCreateWallet()
│           ├── sendTip()
│           ├── requestPayout()
│           ├── approvePayout()
│           └── createStripeConnectAccount()
│
├── frontend/
│   ├── components/
│   │   └── TipButton.tsx
│   │       ├── TipButton (main)
│   │       └── TipModal
│   │
│   ├── hooks/
│   │   └── useWallet.ts
│   │       ├── refreshBalance()
│   │       ├── sendTip()
│   │       └── requestPayout()
│   │
│   └── pages/
│       └── WalletDashboard.tsx
│           ├── Balance cards
│           ├── Transaction list
│           └── Payout interface
│
├── shared/
│   └── types/
│       └── monetization.types.ts
│           ├── Interfaces
│           ├── Enums
│           └── Utility functions
│
├── database/
│   └── prisma-schema-additions.prisma
│       ├── Wallet model
│       ├── Transaction model
│       ├── LedgerEntry model
│       ├── Tip model
│       └── Payout model
│
└── docs/
    ├── README.md
    ├── QUICKSTART.md
    ├── API_REFERENCE.md
    └── ARCHITECTURE.md (this file)
```

---

## Tech Stack

```
┌─────────────────────────────────────────┐
│             FRONTEND                    │
│                                         │
│  React + Next.js                        │
│  TypeScript                             │
│  Tailwind CSS                           │
│  React Hooks                            │
└───────────────┬─────────────────────────┘
                │ REST API
┌───────────────▼─────────────────────────┐
│             BACKEND                     │
│                                         │
│  NestJS                                 │
│  TypeScript                             │
│  class-validator                        │
│  JWT Authentication                     │
└───────────────┬─────────────────────────┘
                │
        ┌───────┼────────┐
        │       │        │
┌───────▼───┐ ┌─▼─────┐ ┌▼────────┐
│ PostgreSQL│ │Stripe │ │ Redis   │
│           │ │       │ │         │
│  Prisma   │ │Connect│ │ Cache   │
└───────────┘ └───────┘ └─────────┘
```

---

## Security Layers

```
┌──────────────────────────────────────────────┐
│  Layer 1: Authentication                     │
│  ✓ JWT tokens                                │
│  ✓ Session management                        │
└──────────────┬───────────────────────────────┘
               │
┌──────────────▼───────────────────────────────┐
│  Layer 2: Authorization                      │
│  ✓ Role-based access control                │
│  ✓ User ownership validation                │
└──────────────┬───────────────────────────────┘
               │
┌──────────────▼───────────────────────────────┐
│  Layer 3: Input Validation                   │
│  ✓ class-validator DTOs                     │
│  ✓ Amount limits                            │
│  ✓ Type checking                            │
└──────────────┬───────────────────────────────┘
               │
┌──────────────▼───────────────────────────────┐
│  Layer 4: Business Logic                     │
│  ✓ Balance checks                           │
│  ✓ Fee calculation                          │
│  ✓ Double-entry validation                  │
└──────────────┬───────────────────────────────┘
               │
┌──────────────▼───────────────────────────────┐
│  Layer 5: Database Transactions              │
│  ✓ ACID properties                          │
│  ✓ Rollback on error                        │
│  ✓ Isolation levels                         │
└──────────────┬───────────────────────────────┘
               │
┌──────────────▼───────────────────────────────┐
│  Layer 6: External Services                  │
│  ✓ Stripe webhook verification              │
│  ✓ API key security                         │
│  ✓ PCI compliance                           │
└──────────────────────────────────────────────┘
```

---

## Performance Considerations

### Database Indexes

```sql
-- Wallet lookups
CREATE INDEX idx_wallet_user_id ON Wallet(userId);
CREATE INDEX idx_wallet_stripe_id ON Wallet(stripeAccountId);

-- Transaction queries
CREATE INDEX idx_transaction_wallet ON Transaction(walletId);
CREATE INDEX idx_transaction_type ON Transaction(type);
CREATE INDEX idx_transaction_date ON Transaction(createdAt);
CREATE INDEX idx_transaction_status ON Transaction(status);

-- Ledger audit trail
CREATE INDEX idx_ledger_transaction ON LedgerEntry(transactionId);
CREATE INDEX idx_ledger_wallet ON LedgerEntry(walletId);
CREATE INDEX idx_ledger_date ON LedgerEntry(createdAt);

-- Tip queries
CREATE INDEX idx_tip_sender ON Tip(senderId);
CREATE INDEX idx_tip_receiver ON Tip(receiverId);
CREATE INDEX idx_tip_post ON Tip(postId);

-- Payout admin queue
CREATE INDEX idx_payout_status ON Payout(status);
CREATE INDEX idx_payout_user ON Payout(userId);
CREATE INDEX idx_payout_date ON Payout(requestedAt);
```

### Caching Strategy

```
┌─────────────────────────────────────┐
│          Redis Cache                │
├─────────────────────────────────────┤
│                                     │
│  wallet:balance:{userId}            │
│  TTL: 60 seconds                    │
│  → Wallet balance summary           │
│                                     │
│  wallet:transactions:{userId}:page:{n}│
│  TTL: 5 minutes                     │
│  → Transaction history pages        │
│                                     │
│  stripe:account:{accountId}         │
│  TTL: 1 hour                        │
│  → Stripe account details           │
│                                     │
│  payout:pending                     │
│  TTL: 1 minute                      │
│  → Admin payout queue               │
│                                     │
└─────────────────────────────────────┘
```

---

**Architecture Version: 1.0**  
**Last Updated: November 25, 2024**
