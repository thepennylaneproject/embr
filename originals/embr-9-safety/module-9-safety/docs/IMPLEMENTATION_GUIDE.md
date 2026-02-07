# Module 9: Implementation Guide

Complete step-by-step guide for implementing the Safety & Moderation module in your Embr platform.

## Prerequisites

- Modules 1 (Infrastructure) and 2 (Authentication) completed
- Node.js 18+ and npm/yarn installed
- PostgreSQL database running
- NestJS and React applications set up

## Installation Steps

### Step 1: Copy Backend Files

```bash
# Create safety module directory
mkdir -p apps/api/src/modules/safety

# Copy all backend files
cp -r module-9-safety/backend/* apps/api/src/modules/safety/
```

Your backend structure should look like:

```
apps/api/src/modules/safety/
├── controllers/
│   └── safety.controller.ts
├── services/
│   ├── reports.service.ts
│   ├── moderation-actions.service.ts
│   ├── blocking.service.ts
│   ├── appeals.service.ts
│   └── content-filter.service.ts
├── dto/
│   └── safety.dto.ts
├── guards/
│   └── roles.guard.ts
└── safety.module.ts
```

### Step 2: Create Safety Module File

Create `apps/api/src/modules/safety/safety.module.ts`:

```typescript
import { Module } from "@nestjs/common";
import { SafetyController } from "./controllers/safety.controller";
import { ReportsService } from "./services/reports.service";
import { ModerationActionsService } from "./services/moderation-actions.service";
import { BlockingService } from "./services/blocking.service";
import { AppealsService } from "./services/appeals.service";
import { ContentFilterService } from "./services/content-filter.service";
import { PrismaModule } from "../prisma/prisma.module";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [SafetyController],
  providers: [
    ReportsService,
    ModerationActionsService,
    BlockingService,
    AppealsService,
    ContentFilterService,
  ],
  exports: [ReportsService, BlockingService, ContentFilterService],
})
export class SafetyModule {}
```

### Step 3: Register Module in App

Update `apps/api/src/app.module.ts`:

```typescript
import { SafetyModule } from "./modules/safety/safety.module";

@Module({
  imports: [
    // ... existing modules
    SafetyModule,
  ],
})
export class AppModule {}
```

### Step 4: Copy Frontend Files

```bash
# Components
mkdir -p apps/web/src/components/safety
cp -r module-9-safety/frontend/components/* apps/web/src/components/safety/

# Hooks
mkdir -p apps/web/src/hooks
cp module-9-safety/frontend/hooks/useSafety.ts apps/web/src/hooks/
```

### Step 5: Copy Shared Files

```bash
# Types
cp module-9-safety/shared/types/safety.types.ts packages/types/src/

# API Client
cp module-9-safety/shared/api/safety.api.ts packages/api-client/src/
```

### Step 6: Update Exports

Update `packages/types/src/index.ts`:

```typescript
export * from "./safety.types";
```

Update `packages/api-client/src/index.ts`:

```typescript
export * from "./safety.api";
```

### Step 7: Environment Variables

No new environment variables required! The module uses your existing:

- Database connection (from Prisma)
- JWT secrets (from Auth module)

### Step 8: Database Schema

Your Prisma schema from Module 1 already includes all necessary tables:

- `Report`
- `ModerationAction`
- `Appeal`
- `BlockedUser`
- `MutedUser`
- `MutedKeyword`
- `ContentRule`
- `FilterLog`

If you need to add these, run:

```bash
cd apps/api
npx prisma migrate dev --name add_safety_tables
```

### Step 9: Verify Installation

```bash
# Start backend
cd apps/api
npm run start:dev

# Check endpoints
curl http://localhost:3004/safety/filter/rules

# Start frontend
cd apps/web
npm run dev
```

## Configuration

### Content Filtering Thresholds

Edit `backend/services/content-filter.service.ts`:

```typescript
// Adjust scoring thresholds
if (result.score >= 100) {
  result.action = FilterAction.BLOCK; // Change to 150 for less strict
} else if (result.score >= 50) {
  result.action = FilterAction.FLAG; // Change to 75 for less strict
}
```

### Auto-Escalation Settings

Edit `backend/services/reports.service.ts`:

```typescript
private async checkAutoEscalation() {
  // Auto-escalate if 5+ reports (change threshold here)
  if (reportCount >= 5) {
    // ...escalate
  }
}
```

### Role-Based Access

Update user roles in your database:

```sql
-- Make a user a moderator
UPDATE "User" SET role = 'moderator' WHERE id = 'user-id';

-- Make a user an admin
UPDATE "User" SET role = 'admin' WHERE id = 'user-id';
```

## Cron Jobs Setup

Add these cron jobs for automated cleanup:

### Clean up expired mutes

```typescript
// In your cron module
@Cron('0 * * * *') // Every hour
async cleanupExpiredMutes() {
  await this.blockingService.cleanupExpiredMutes();
}
```

### Clean up expired suspensions

```typescript
@Cron('0 * * * *') // Every hour
async cleanupExpiredActions() {
  await this.moderationActionsService.cleanupExpiredActions();
}
```

## Testing

### Unit Tests

Create `backend/services/reports.service.spec.ts`:

```typescript
import { Test } from "@nestjs/testing";
import { ReportsService } from "./reports.service";

describe("ReportsService", () => {
  let service: ReportsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ReportsService],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  it("should create a report", async () => {
    const report = await service.createReport("user-id", {
      entityType: "post",
      entityId: "post-id",
      reason: "spam",
    });

    expect(report).toBeDefined();
    expect(report.status).toBe("pending");
  });
});
```

### Integration Tests

Create `backend/controllers/safety.controller.spec.ts`:

```typescript
import { Test } from "@nestjs/testing";
import { SafetyController } from "./safety.controller";

describe("SafetyController", () => {
  let controller: SafetyController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [SafetyController],
      providers: [
        /* mock services */
      ],
    }).compile();

    controller = module.get<SafetyController>(SafetyController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
```

### E2E Tests

Create `test/safety.e2e-spec.ts`:

```typescript
import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";

describe("Safety (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it("/safety/reports (POST)", () => {
    return request(app.getHttpServer())
      .post("/safety/reports")
      .send({
        entityType: "post",
        entityId: "test-post",
        reason: "spam",
      })
      .expect(201);
  });
});
```

## Deployment

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Cron jobs set up
- [ ] Content rules configured
- [ ] Admin users assigned
- [ ] Moderator team trained
- [ ] Analytics/monitoring enabled
- [ ] Rate limiting configured
- [ ] Backup strategy in place

### Environment-Specific Settings

#### Development

- Lenient content filtering
- Verbose logging
- Test moderator accounts

#### Staging

- Production-like filtering
- Full audit logging
- Test all workflows

#### Production

- Strict content filtering
- Performance monitoring
- 24/7 moderator coverage
- Regular queue reviews

## Monitoring

### Key Metrics to Track

1. **Report Volume**
   - Reports per day/hour
   - Average resolution time
   - Escalation rate

2. **Content Filtering**
   - Filter hit rate
   - False positive rate
   - Top matched rules

3. **User Actions**
   - Blocks per day
   - Mutes per day
   - Appeal rate

4. **Moderator Performance**
   - Actions per moderator
   - Average review time
   - Accuracy rate

### Logging

Enable detailed logging for audits:

```typescript
// In your logger config
{
  categories: ['safety', 'moderation', 'reports'],
  level: 'info',
  audit: true
}
```

## Troubleshooting

### Issue: Reports not appearing in queue

**Symptoms**: New reports don't show in moderation dashboard

**Solutions**:

1. Check user role: must be 'admin' or 'moderator'
2. Verify database connection
3. Check report status filters
4. Review console for errors

### Issue: Content filter blocking legitimate content

**Symptoms**: False positives in content filtering

**Solutions**:

1. Review matched rules in filter logs
2. Adjust scoring thresholds
3. Add exceptions to rules
4. Refine keyword matching

### Issue: Blocked user still visible

**Symptoms**: Blocked users appear in feed

**Solutions**:

1. Ensure `filterContent()` is called on feed items
2. Check block relationship in database
3. Verify cache invalidation
4. Test block endpoint directly

### Issue: Appeals not notifying moderators

**Symptoms**: Moderators don't receive appeal notifications

**Solutions**:

1. Verify NotificationsModule is imported
2. Check moderator user roles
3. Review notification settings
4. Test notification service directly

## Best Practices

1. **Regular Reviews**: Audit moderation actions monthly
2. **Training**: Train moderators on content policies
3. **Documentation**: Keep moderation guidelines updated
4. **Communication**: Notify users of policy changes
5. **Transparency**: Publish transparency reports
6. **Appeal Process**: Make appeals easy and fair
7. **Automation Balance**: Don't over-rely on filters
8. **User Education**: Guide users on reporting

## Security Considerations

1. **Access Control**: Strictly limit moderator access
2. **Audit Logging**: Log all moderation actions
3. **Privacy**: Protect reporter identity
4. **Rate Limiting**: Prevent spam reports
5. **Input Validation**: Validate all user input
6. **SQL Injection**: Use parameterized queries
7. **XSS Protection**: Sanitize user content
8. **CSRF Protection**: Use CSRF tokens

## Performance Optimization

1. **Database Indexes**: Ensure proper indexing
2. **Caching**: Cache frequently accessed data
3. **Pagination**: Always paginate lists
4. **Batch Operations**: Use bulk updates
5. **Background Jobs**: Run cleanup async
6. **Query Optimization**: Monitor slow queries
7. **Connection Pooling**: Configure pool size
8. **CDN**: Serve static assets via CDN

## Scaling

### Horizontal Scaling

- Load balance across multiple backend instances
- Use Redis for shared caching
- Queue system (BullMQ) for async jobs
- Separate read replicas for reports

### Vertical Scaling

- Increase database resources
- Optimize query performance
- Add more moderators
- Implement tiered support

## Support

For additional help:

- Review API Reference in README
- Check Acceptance Criteria document
- Examine module code comments
- Test with provided examples
- Contact Embr development team

## Next Steps

After implementing Module 9:

1. Configure content filtering rules
2. Assign moderator roles
3. Test reporting workflow
4. Train moderation team
5. Monitor queue metrics
6. Adjust thresholds as needed
7. Proceed to Module 10 (Notifications)

## Changelog

### Version 1.0.0 (Initial Release)

- Complete reporting system
- User blocking and muting
- Admin moderation dashboard
- Automated content filtering
- Appeals process
- 36 API endpoints
- Full React component library
- Comprehensive documentation
