# Module 5: Quick Start Guide

**Get the monetization system running in 15 minutes**

---

## Step 1: Database Setup (2 minutes)

```bash
# Add the schema to your existing Prisma schema
cat database/prisma-schema-additions.prisma >> ../prisma/schema.prisma

# Run migration
cd ..
npx prisma migrate dev --name add_monetization_system
npx prisma generate
```

---

## Step 2: Environment Variables (1 minute)

Add to your `.env`:

```bash
# Get these from https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE

# Your frontend URL
FRONTEND_URL=http://localhost:3004
```

---

## Step 3: Backend Integration (5 minutes)

### Install Stripe

```bash
cd backend
npm install stripe
```

### Register Module

```typescript
// backend/src/app.module.ts
import { WalletModule } from "./wallet/wallet.module";

@Module({
  imports: [
    // ... other modules
    WalletModule,
  ],
})
export class AppModule {}
```

### Create Wallet Module

```typescript
// backend/src/wallet/wallet.module.ts
import { Module } from "@nestjs/common";
import { WalletController } from "./controllers/wallet.controller";
import { WalletService } from "./services/wallet.service";
import { PrismaService } from "../prisma/prisma.service";

@Module({
  controllers: [WalletController],
  providers: [WalletService, PrismaService],
  exports: [WalletService],
})
export class WalletModule {}
```

### Copy Files

```bash
# Copy the service and controller
cp module-5-monetization/backend/services/wallet.service.ts ../backend/src/wallet/services/
cp module-5-monetization/backend/controllers/wallet.controller.ts ../backend/src/wallet/controllers/
```

---

## Step 4: Frontend Integration (5 minutes)

### Copy Components

```bash
cd frontend/src

# Copy components
mkdir -p components/wallet hooks pages/wallet
cp ../module-5-monetization/frontend/components/* components/wallet/
cp ../module-5-monetization/frontend/hooks/* hooks/
cp ../module-5-monetization/frontend/pages/* pages/wallet/
```

### Add Routes

```typescript
// frontend/src/App.tsx
import { WalletDashboard } from './pages/wallet/WalletDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ... other routes */}
        <Route path="/wallet" element={<WalletDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### Add Tip Buttons to Posts

```typescript
// frontend/src/components/PostCard.tsx
import { TipButton } from './wallet/TipButton';

function PostCard({ post }) {
  return (
    <div className="post-card">
      {/* ... post content ... */}

      <div className="post-actions">
        <TipButton
          recipientId={post.authorId}
          recipientName={post.author.displayName}
          recipientAvatar={post.author.avatarUrl}
          postId={post.id}
          size="sm"
        />
      </div>
    </div>
  );
}
```

---

## Step 5: Test It! (2 minutes)

### 1. Start Your Servers

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 2. Create a Wallet

Visit `http://localhost:3004/wallet` while logged in. A wallet will be created automatically.

### 3. Send a Test Tip

1. Navigate to any post
2. Click the tip button
3. Select $5.00
4. Add a message
5. Click "Send Tip"

### 4. Check Your Balance

Return to `/wallet` to see:

- Your balance decreased
- Transaction in history
- Ledger entries created

---

## Step 6: Stripe Connect (Optional)

To enable payouts:

```bash
# 1. Go to your wallet
http://localhost:3004/wallet

# 2. Click "Connect Bank Account"

# 3. Complete Stripe onboarding
# Use test data from: https://stripe.com/docs/connect/testing

# 4. Request a payout once balance >= $20
```

---

## 🎯 Quick Test Checklist

- [ ] Wallet page loads
- [ ] Balance shows $0.00
- [ ] Tip button appears on posts
- [ ] Can select tip amount
- [ ] Tip sends successfully
- [ ] Balance updates
- [ ] Transaction appears in history
- [ ] Stripe Connect button works
- [ ] Can request payout (after Connect)

---

## 🐛 Troubleshooting

### "Stripe is not defined"

```bash
# Install Stripe
npm install stripe
```

### "Cannot find module '@embr/shared/types'"

```bash
# Copy shared types
cp -r module-5-monetization/shared ../shared
```

### "Insufficient balance" error

Users start with $0. To test:

1. Use admin panel to add test balance
2. Or implement wallet top-up feature
3. Or seed database with test balance

```typescript
// Quick test balance
await prisma.wallet.update({
  where: { userId: "test-user-id" },
  data: { balance: 10000 }, // $100
});
```

---

## 🎨 Customization

### Change Platform Fee

```typescript
// backend/services/wallet.service.ts
const fee = Math.max(Math.round(amount * 0.1), 10); // Change to 10%
```

### Change Minimum Payout

```typescript
// backend/services/wallet.service.ts
if (amount < 5000) {
  // Change to $50
  throw new BadRequestException("Minimum payout amount is $50.00");
}
```

### Change Colors

```typescript
// tailwind.config.js
colors: {
  'embr-coral': '#YOUR_COLOR_HERE',
}
```

---

## 🚀 Next Steps

1. **Add Analytics** - Implement earnings dashboard
2. **Email Notifications** - Notify on tips received
3. **Push Notifications** - Real-time tip alerts
4. **Admin Dashboard** - Payout approval interface
5. **Wallet Top-Up** - Let users add funds
6. **Recurring Tips** - Monthly supporter system

---

## 📚 Resources

- [Full Documentation](./README.md)
- [Stripe Connect Docs](https://stripe.com/docs/connect)
- [Stripe Test Data](https://stripe.com/docs/connect/testing)
- [Double-Entry Accounting](https://en.wikipedia.org/wiki/Double-entry_bookkeeping)

---

**That's it! You now have a fully functional monetization system.** 🎉
