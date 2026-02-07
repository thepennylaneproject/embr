# Implementation Guide - Module 7: Social Graph & Discovery

Complete step-by-step guide to integrate the social connections and discovery features into your Embr application.

## Prerequisites

- ✅ Module 1: Infrastructure & Deployment (PostgreSQL, Docker)
- ✅ Module 2: Authentication & User Management (JWT, profiles)
- ✅ Module 3: Content Core (posts, feeds)
- Node.js 18+
- PostgreSQL 14+
- Existing Embr application running

## Table of Contents

1. [Database Setup](#database-setup)
2. [Backend Integration](#backend-integration)
3. [Frontend Integration](#frontend-integration)
4. [API Configuration](#api-configuration)
5. [Testing](#testing)
6. [Deployment](#deployment)

---

## 1. Database Setup

### Verify Schema

Ensure your Prisma schema includes the Follow model (should be from Module 1):

```prisma
model Follow {
  id          String   @id @default(uuid())
  followerId  String
  followingId String
  createdAt   DateTime @default(now())

  follower  User @relation("UserFollowers", fields: [followerId], references: [id], onDelete: Cascade)
  following User @relation("UserFollowing", fields: [followingId], references: [id], onDelete: Cascade)

  @@unique([followerId, followingId])
  @@index([followerId])
  @@index([followingId])
  @@map("follows")
}
```

### Update Profile Model

Add follower counts to Profile model if not present:

```prisma
model Profile {
  // ... existing fields
  followerCount  Int      @default(0)
  followingCount Int      @default(0)
  skills         String[]
  availability   String?  // 'available' | 'busy'
}
```

### Run Migration

```bash
cd apps/api
npx prisma migrate dev --name add_social_features
npx prisma generate
```

### Create Indexes (Optional but Recommended)

```sql
-- For better search performance
CREATE INDEX IF NOT EXISTS idx_users_username_search ON users USING gin(to_tsvector('english', username));
CREATE INDEX IF NOT EXISTS idx_profiles_fullname_search ON profiles USING gin(to_tsvector('english', full_name));
CREATE INDEX IF NOT EXISTS idx_profiles_bio_search ON profiles USING gin(to_tsvector('english', bio));
CREATE INDEX IF NOT EXISTS idx_profiles_skills ON profiles USING gin(skills);

-- For follow queries
CREATE INDEX IF NOT EXISTS idx_follows_composite ON follows(follower_id, following_id);
```

---

## 2. Backend Integration

### Step 1: Copy Backend Files

```bash
# From module-7-social-graph directory
cp -r backend/controllers/* apps/api/src/controllers/
cp -r backend/services/* apps/api/src/services/
cp -r backend/dto/* apps/api/src/dto/
```

### Step 2: Create Optional JWT Auth Guard

Create `apps/api/src/auth/guards/optional-jwt-auth.guard.ts`:

```typescript
import { Injectable, ExecutionContext } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard("jwt") {
  handleRequest(err: any, user: any) {
    // Return user if available, or null if not authenticated
    return user || null;
  }

  canActivate(context: ExecutionContext) {
    // Always allow the request to proceed
    return super.canActivate(context) as Promise<boolean> | boolean;
  }
}
```

### Step 3: Register Module

Update `apps/api/src/app.module.ts`:

```typescript
import { FollowsController } from "./controllers/follows.controller";
import { UserDiscoveryController } from "./controllers/user-discovery.controller";
import { FollowsService } from "./services/follows.service";
import { UserDiscoveryService } from "./services/user-discovery.service";

@Module({
  imports: [
    // ... existing imports
  ],
  controllers: [
    // ... existing controllers
    FollowsController,
    UserDiscoveryController,
  ],
  providers: [
    // ... existing providers
    FollowsService,
    UserDiscoveryService,
  ],
})
export class AppModule {}
```

### Step 4: Update CORS Settings

Ensure CORS is configured in `main.ts`:

```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || "http://localhost:3004",
  credentials: true,
});
```

### Step 5: Test Backend

```bash
cd apps/api
npm run start:dev
```

Test endpoints:

```bash
# Get trending creators (no auth required)
curl http://localhost:4000/api/discovery/trending

# Follow a user (requires auth)
curl -X POST http://localhost:4000/api/follows \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"followingId": "user-id-here"}'
```

---

## 3. Frontend Integration

### Step 1: Copy Frontend Files

```bash
# From module-7-social-graph directory
cp -r frontend/components/* apps/web/src/components/
cp -r frontend/hooks/* apps/web/src/hooks/
cp -r frontend/pages/* apps/web/src/pages/
```

### Step 2: Copy Shared Files

```bash
# Types
cp shared/types/social.types.ts packages/types/src/

# API Client
cp shared/api/social.api.ts packages/api-client/src/
```

### Step 3: Update API Base Client

Ensure your base API client (`packages/api-client/src/base.ts`) exists:

```typescript
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
```

### Step 4: Add Environment Variables

Create/update `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### Step 5: Add Discovery Route

Update `apps/web/src/app/discover/page.tsx`:

```tsx
import { DiscoveryPage } from "../../pages/DiscoveryPage";

export default function DiscoverRoute() {
  return <DiscoveryPage />;
}
```

### Step 6: Add Follow Button to Profile

Update your profile page component:

```tsx
import { FollowButton } from "@/components/FollowButton";
import { MutualConnections } from "@/components/MutualConnections";

export default function ProfilePage({ userId, isOwnProfile }) {
  return (
    <div>
      {/* Profile header */}
      {!isOwnProfile && (
        <>
          <FollowButton
            userId={userId}
            initialIsFollowing={profile.isFollowing}
            size="lg"
          />
          <MutualConnections userId={userId} limit={5} />
        </>
      )}
      {/* Rest of profile */}
    </div>
  );
}
```

---

## 4. API Configuration

### Environment Variables (Backend)

Create/update `apps/api/.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/embr"
JWT_SECRET="your-secret-key"
FRONTEND_URL="http://localhost:3004"
```

### Environment Variables (Frontend)

Create/update `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_APP_URL=http://localhost:3004
```

---

## 5. Testing

### Backend Testing

```bash
cd apps/api

# Run unit tests
npm run test

# Test specific service
npm run test follows.service.spec.ts
```

### Manual API Testing

Use the included Postman collection or test with curl:

```bash
# 1. Get auth token
TOKEN=$(curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.accessToken')

# 2. Follow a user
curl -X POST http://localhost:4000/api/follows \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"followingId":"target-user-id"}'

# 3. Get followers
curl -X GET "http://localhost:4000/api/follows/followers/user-id?page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"

# 4. Search users
curl -X GET "http://localhost:4000/api/discovery/search?query=photographer&location=new+york" \
  -H "Authorization: Bearer $TOKEN"

# 5. Get recommendations
curl -X GET "http://localhost:4000/api/discovery/recommended?context=mutual_connections&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### Frontend Testing

```bash
cd apps/web

# Start dev server
npm run dev

# Navigate to pages
open http://localhost:3004/discover
open http://localhost:3004/profile/username
```

### Component Testing

Test each component in isolation:

1. **FollowButton**: Click follow/unfollow, verify UI updates
2. **UserSearchBar**: Type queries, verify results appear
3. **SuggestedUsers**: Verify recommendations load
4. **TrendingCreators**: Switch timeframes, verify updates
5. **MutualConnections**: Verify mutual followers display

---

## 6. Deployment

### Backend Deployment (Railway/Heroku)

```bash
# Build
cd apps/api
npm run build

# Set environment variables
railway env set DATABASE_URL="postgresql://..."
railway env set JWT_SECRET="..."

# Deploy
railway up
```

### Frontend Deployment (Vercel)

```bash
cd apps/web

# Build
npm run build

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
NEXT_PUBLIC_API_URL=https://api.embr.app
```

### Post-Deployment Verification

1. Test follow/unfollow functionality
2. Verify search returns results
3. Check recommendations load correctly
4. Test trending creators by timeframe
5. Verify mutual connections display
6. Check mobile responsiveness
7. Test with different user roles

---

## Common Issues & Solutions

### Issue: "Cannot read property 'id' of undefined"

**Solution**: Ensure JWT auth is properly configured and tokens are being sent.

### Issue: Search returns no results

**Solution**:

- Verify database has users
- Check text search indexes
- Ensure query syntax is correct

### Issue: Recommendations are empty

**Solution**:

- User needs to follow others first
- Verify follow relationships in database
- Check that users have profiles with skills

### Issue: Follow button doesn't update

**Solution**:

- Check browser console for errors
- Verify API endpoint URLs
- Ensure optimistic update logic is working

### Issue: CORS errors

**Solution**:

```typescript
// In apps/api/src/main.ts
app.enableCors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
});
```

---

## Performance Optimization

### Database Indexes

Ensure these indexes exist for optimal performance:

```sql
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
CREATE INDEX idx_profiles_follower_count ON profiles(follower_count DESC);
CREATE INDEX idx_users_verified ON users(verified);
```

### Caching (Optional)

Add Redis caching for expensive queries:

```typescript
// In user-discovery.service.ts
async getTrendingCreators(dto: GetTrendingCreatorsDto) {
  const cacheKey = `trending:${dto.timeframe}:${dto.category}`;

  // Check cache
  const cached = await this.redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // Query database
  const result = await this.queryTrending(dto);

  // Cache for 10 minutes
  await this.redis.setex(cacheKey, 600, JSON.stringify(result));

  return result;
}
```

---

## Next Steps

1. ✅ Complete acceptance criteria testing
2. ✅ Monitor performance metrics
3. ✅ Gather user feedback
4. Consider adding:
   - Advanced search filters (min followers, engagement rate)
   - User blocking/muting
   - Suggested follows on signup
   - Follow requests for private accounts
   - Activity feed for followed users

## Support

For issues or questions:

- Check [ACCEPTANCE_CRITERIA.md](./ACCEPTANCE_CRITERIA.md) for testing
- Review [MODULE_SUMMARY.md](./MODULE_SUMMARY.md) for architecture
- See [README.md](./README.md) for quick reference
