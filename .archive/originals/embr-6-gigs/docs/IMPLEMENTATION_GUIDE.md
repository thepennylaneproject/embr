# Implementation Guide

Complete step-by-step guide for integrating Module 5: Gigs & Jobs Marketplace into Embr.

---

## Prerequisites

Before starting, ensure you have:

- ✅ Module 1 completed (Infrastructure & Database)
- ✅ Module 2 completed (Authentication & User Management)
- ✅ Stripe account created and API keys obtained
- ✅ Basic understanding of NestJS and React

---

## Part 1: Backend Implementation

### Step 1: Install Dependencies

```bash
cd apps/api
npm install stripe@13.10.0 class-validator class-transformer
```

### Step 2: Configure Environment Variables

Add to `apps/api/.env`:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3004
```

### Step 3: Copy Backend Files

Copy files from this module to your project:

```bash
# Controllers
cp backend/controllers/gigs.controller.ts apps/api/src/gigs/controllers/
cp backend/controllers/applications.controller.ts apps/api/src/gigs/controllers/
cp backend/controllers/escrow.controller.ts apps/api/src/gigs/controllers/

# Services
cp backend/services/gigs.service.ts apps/api/src/gigs/services/
cp backend/services/applications.service.ts apps/api/src/gigs/services/
cp backend/services/escrow.service.ts apps/api/src/gigs/services/

# DTOs
cp backend/dto/gig.dto.ts apps/api/src/gigs/dto/
```

### Step 4: Create Gigs Module

Create `apps/api/src/gigs/gigs.module.ts`:

```typescript
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GigsController } from "./controllers/gigs.controller";
import { ApplicationsController } from "./controllers/applications.controller";
import {
  EscrowController,
  MilestonesController,
} from "./controllers/escrow.controller";
import { GigsService } from "./services/gigs.service";
import { ApplicationsService } from "./services/applications.service";
import { EscrowService } from "./services/escrow.service";
import { Gig } from "./entities/gig.entity";
import { Application } from "./entities/application.entity";
import { GigMilestone } from "./entities/milestone.entity";
import { Escrow } from "./entities/escrow.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Gig, Application, GigMilestone, Escrow])],
  controllers: [
    GigsController,
    ApplicationsController,
    EscrowController,
    MilestonesController,
  ],
  providers: [GigsService, ApplicationsService, EscrowService],
  exports: [GigsService, ApplicationsService, EscrowService],
})
export class GigsModule {}
```

### Step 5: Register Module in AppModule

Update `apps/api/src/app.module.ts`:

```typescript
import { GigsModule } from "./gigs/gigs.module";

@Module({
  imports: [
    // ... other modules
    GigsModule,
  ],
})
export class AppModule {}
```

### Step 6: Verify Database Entities

The entities should already exist from Module 1. Verify they match:

```bash
# Check Prisma schema includes:
# - Gig
# - Application
# - GigMilestone
# - Escrow
# - GigReview (optional)
# - Dispute (optional)
```

### Step 7: Test Backend Endpoints

Start your API server:

```bash
cd apps/api
npm run start:dev
```

Test with curl or Postman:

```bash
# Get all gigs
curl http://localhost:4000/gigs

# Create a gig (requires auth token)
curl -X POST http://localhost:4000/gigs \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Gig",
    "description": "This is a test gig description...",
    "category": "VIDEO_EDITING",
    "budgetType": "FIXED",
    "budgetMin": 100,
    "budgetMax": 500,
    "experienceLevel": "INTERMEDIATE",
    "estimatedDuration": 7,
    "skills": ["Premiere Pro"],
    "deliverables": ["Final video"]
  }'
```

---

## Part 2: Frontend Implementation

### Step 1: Copy Frontend Files

```bash
# Components
cp frontend/components/*.tsx apps/web/src/components/gigs/

# Hooks
cp frontend/hooks/useGig.ts apps/web/src/hooks/

# API Client
cp shared/api/gigs.api.ts apps/web/src/api/

# Types
cp shared/types/gig.types.ts apps/web/src/types/
```

### Step 2: Update API Client Configuration

Ensure `apps/web/src/api/client.ts` exists and exports `apiClient`:

```typescript
import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:4000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 errors and refresh token
    return Promise.reject(error);
  },
);
```

### Step 3: Add Routes

Update `apps/web/src/App.tsx`:

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GigDiscovery } from './components/gigs/GigDiscovery';
import { GigPostForm } from './components/gigs/GigPostForm';
import { GigManagementDashboard } from './components/gigs/GigManagementDashboard';
import { GigDetailPage } from './components/gigs/GigDetailPage'; // You may need to create this
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/gigs" element={<GigDiscovery />} />
        <Route path="/gigs/:id" element={<GigDetailPage />} />

        {/* Protected routes */}
        <Route
          path="/gigs/post"
          element={
            <ProtectedRoute>
              <GigPostForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gigs/dashboard"
          element={
            <ProtectedRoute>
              <GigManagementDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
```

### Step 4: Test Frontend Components

Start your web app:

```bash
cd apps/web
npm run dev
```

Navigate to:

- `http://localhost:3004/gigs` - Browse gigs
- `http://localhost:3004/gigs/post` - Post a new gig
- `http://localhost:3004/gigs/dashboard` - Manage gigs

---

## Part 3: Stripe Integration

### Step 1: Set Up Stripe Webhooks

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-api-domain.com/webhooks/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `transfer.created`
4. Copy webhook signing secret to `.env`

### Step 2: Create Webhook Handler

Create `apps/api/src/webhooks/stripe.controller.ts`:

```typescript
import {
  Controller,
  Post,
  Req,
  Headers,
  BadRequestException,
} from "@nestjs/common";
import { Request } from "express";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

@Controller("webhooks")
export class StripeWebhookController {
  @Post("stripe")
  async handleWebhook(
    @Req() request: Request,
    @Headers("stripe-signature") signature: string,
  ) {
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        request.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } catch (err) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        // Update escrow status in database
        break;
      case "payment_intent.payment_failed":
        // Handle failed payment
        break;
      // Handle other events
    }

    return { received: true };
  }
}
```

### Step 3: Test Stripe Integration

Use Stripe test cards:

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Auth required: `4000 0025 0000 3155`

---

## Part 4: Testing

### Unit Tests

Create test files for services:

```typescript
// gigs.service.spec.ts
import { Test } from "@nestjs/testing";
import { GigsService } from "./gigs.service";

describe("GigsService", () => {
  let service: GigsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [GigsService],
    }).compile();

    service = module.get<GigsService>(GigsService);
  });

  it("should create a gig", async () => {
    const gig = await service.create("user-id", {
      title: "Test Gig",
      // ... other fields
    });
    expect(gig).toBeDefined();
    expect(gig.title).toBe("Test Gig");
  });
});
```

### Integration Tests

Test complete workflows:

```typescript
describe("Gig Workflow (e2e)", () => {
  it("should complete full gig lifecycle", async () => {
    // 1. Create gig
    // 2. Submit application
    // 3. Accept application
    // 4. Fund escrow
    // 5. Submit milestone
    // 6. Approve milestone
    // 7. Complete gig
  });
});
```

---

## Part 5: Deployment

### Step 1: Environment Variables

Set production environment variables:

```bash
# Production API
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...
DATABASE_URL=postgresql://...
```

### Step 2: Database Migrations

Migrations should already be in place from Module 1. Verify:

```bash
npx prisma migrate status
npx prisma migrate deploy
```

### Step 3: Deploy

Follow your existing deployment process from Module 1:

```bash
# Deploy API
git push origin main
# Railway auto-deploys

# Deploy Web
npm run build
vercel deploy --prod
```

### Step 4: Configure Stripe Webhook URL

Update webhook endpoint URL to production URL.

---

## Part 6: Monitoring & Maintenance

### Health Checks

Add gigs-specific health checks:

```typescript
@Get('health/gigs')
async checkGigsHealth() {
  const openGigs = await this.gigsService.count({ status: 'OPEN' });
  const activeEscrows = await this.escrowService.count({ status: 'FUNDED' });

  return {
    status: 'healthy',
    openGigs,
    activeEscrows,
    timestamp: new Date(),
  };
}
```

### Logging

Add structured logging:

```typescript
this.logger.log(`Gig created: ${gig.id} by ${creatorId}`);
this.logger.log(`Application accepted: ${app.id} for gig ${gig.id}`);
this.logger.log(
  `Milestone approved: ${milestone.id}, releasing $${milestone.amount}`,
);
```

### Metrics

Track important metrics:

- Gigs posted per day
- Application submission rate
- Application acceptance rate
- Average time to completion
- Escrow amounts held
- Payment release frequency

---

## Common Issues & Solutions

### Issue: "Stripe error: Invalid API Key"

**Solution:** Verify `STRIPE_SECRET_KEY` in `.env` is correct and starts with `sk_test_` or `sk_live_`

### Issue: Applications not creating milestones

**Solution:** Ensure `milestones` array is included in request body and amounts sum to proposed budget

### Issue: Escrow not funding

**Solution:**

1. Check Stripe test mode enabled
2. Verify payment method is valid
3. Check webhook logs in Stripe dashboard

### Issue: Unauthorized errors

**Solution:** Verify JWT token is being sent in Authorization header

### Issue: TypeScript errors

**Solution:** Ensure all types from `gig.types.ts` are imported correctly

---

## Next Steps

After successful implementation:

1. ✅ Test all acceptance criteria
2. ✅ Configure monitoring and alerts
3. ✅ Set up error tracking (Sentry)
4. ✅ Create user documentation
5. ✅ Train support team on features
6. ✅ Announce feature to users
7. ✅ Monitor for bugs and feedback
8. ✅ Plan enhancements (Module 6+)

---

## Support Resources

- **Stripe Documentation:** https://stripe.com/docs/api
- **NestJS Documentation:** https://docs.nestjs.com
- **React Router:** https://reactrouter.com
- **TypeORM:** https://typeorm.io

## Questions?

Refer to:

- `README.md` for quick start
- `ACCEPTANCE_CRITERIA.md` for testing checklist
- `API_REFERENCE.md` for endpoint documentation
