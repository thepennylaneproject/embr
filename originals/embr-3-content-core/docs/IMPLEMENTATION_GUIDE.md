# Content Core Module - Implementation Guide

Step-by-step guide to integrate the Content Core module into your Embr application.

## Prerequisites

Before starting, ensure you have:

- ✅ Authentication module completed (Module 2)
- ✅ Database migrations run with Post, Comment, Like tables
- ✅ NestJS backend running on port 3003
- ✅ Next.js frontend running on port 3004
- ✅ AWS S3 configured for media storage
- ✅ Mux configured for video processing (optional for MVP)

## Step 1: Install Dependencies

### Frontend Dependencies

```bash
cd apps/web
npm install axios date-fns lucide-react
```

### Backend Dependencies

```bash
cd apps/api
npm install @nestjs/swagger class-validator class-transformer @nestjs/event-emitter
```

## Step 2: Copy Files to Your Project

### 2.1 Frontend Files

```bash
# From the embr-content-core directory

# Copy components
cp -r frontend/components/* ../apps/web/components/content/

# Copy hooks
cp -r frontend/hooks/* ../apps/web/hooks/

# Copy shared types and API client
mkdir -p ../packages/shared/types
mkdir -p ../packages/shared/api
cp shared/types/* ../packages/shared/types/
cp shared/api/* ../packages/shared/api/
```

### 2.2 Backend Files

```bash
# Copy comments module
mkdir -p ../apps/api/src/comments
cp backend/controllers/comments.controller.ts ../apps/api/src/comments/
cp backend/services/comments.service.ts ../apps/api/src/comments/
cp backend/dto/comments.dto.ts ../apps/api/src/comments/dto/

# Create module file
cat > ../apps/api/src/comments/comments.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
EOF
```

## Step 3: Update Configurations

### 3.1 TypeScript Path Aliases

Update `apps/web/tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/components/*": ["./components/*"],
      "@/hooks/*": ["./hooks/*"],
      "@/lib/*": ["./lib/*"],
      "@shared/types": ["../../packages/shared/types/content.types"],
      "@shared/api": ["../../packages/shared/api/content.api"]
    }
  }
}
```

### 3.2 Environment Variables

Update `apps/web/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3003
```

Update `apps/api/.env`:

```bash
# Existing variables...

# For media upload
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=embr-media

# For video processing (optional)
MUX_TOKEN_ID=your_mux_token_id
MUX_TOKEN_SECRET=your_mux_token_secret
```

### 3.3 Tailwind Configuration

Update `apps/web/tailwind.config.js`:

```javascript
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coral: "#E8998D",
        rose: "#C9ADA7",
        mauve: "#9A8C98",
      },
    },
  },
  plugins: [],
};
```

## Step 4: Register Backend Modules

Update `apps/api/src/app.module.ts`:

```typescript
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EventEmitterModule } from "@nestjs/event-emitter";
// ... other imports
import { CommentsModule } from "./comments/comments.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    // ... existing modules
    CommentsModule,
  ],
})
export class AppModule {}
```

## Step 5: Create Example Pages

### 5.1 Home Page with Feed

Create `apps/web/pages/index.tsx`:

```tsx
import { useState } from "react";
import { FeedTabs, PostCreator } from "@/components/content";

export default function HomePage() {
  const [showCreator, setShowCreator] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Embr
          </h1>
          <p className="text-gray-600">Share your creativity with the world</p>
        </header>

        {/* Post Creator Button */}
        <button
          onClick={() => setShowCreator(!showCreator)}
          className="w-full mb-6 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 text-left hover:shadow-md transition-shadow"
        >
          <span className="text-gray-500">What's on your mind?</span>
        </button>

        {/* Post Creator */}
        {showCreator && (
          <PostCreator
            className="mb-6"
            onPostCreated={() => setShowCreator(false)}
            onCancel={() => setShowCreator(false)}
          />
        )}

        {/* Feed Tabs */}
        <FeedTabs />
      </div>
    </div>
  );
}
```

### 5.2 Post Detail Page

Create `apps/web/pages/post/[id].tsx`:

```tsx
import { useRouter } from "next/router";
import { PostDetailPage } from "@/components/content";
import { useAuth } from "@/hooks/useAuth";

export default function PostPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  if (!id || typeof id !== "string") {
    return null;
  }

  return <PostDetailPage postId={id} currentUserId={user?.id} />;
}
```

### 5.3 Profile Page with User Posts

Create `apps/web/pages/[username].tsx`:

```tsx
import { useRouter } from "next/router";
import { Feed } from "@/components/content";

export default function ProfilePage() {
  const router = useRouter();
  const { username } = router.query;

  // You would fetch user data here

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Posts by @{username}</h1>

        {/* User's posts - you would customize the Feed component for this */}
        <Feed />
      </div>
    </div>
  );
}
```

## Step 6: Test the Implementation

### 6.1 Start Services

```bash
# Terminal 1 - Backend
cd apps/api
npm run start:dev

# Terminal 2 - Frontend
cd apps/web
npm run dev
```

### 6.2 Test Checklist

Navigate to `http://localhost:3004` and test:

- [ ] Home page loads with feed tabs
- [ ] Click "What's on your mind?" to open post creator
- [ ] Create a text-only post
- [ ] Create a post with an image
- [ ] Create a post with a video
- [ ] Test drag-and-drop media upload
- [ ] Switch between feed tabs (For You, Following, Trending)
- [ ] Scroll down to trigger infinite scroll
- [ ] Click like button (should update immediately)
- [ ] Click comment button to navigate to post detail
- [ ] Add a comment on a post
- [ ] Reply to a comment
- [ ] Like a comment
- [ ] Edit your own comment
- [ ] Delete your own comment
- [ ] Test pull-to-refresh on feed

## Step 7: Verify API Endpoints

Test backend endpoints using curl or Postman:

```bash
# Get auth token first
TOKEN="your_jwt_token"

# Test feed endpoint
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3003/feed/for-you

# Test comment creation
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Great post!"}' \
  http://localhost:3003/posts/{postId}/comments

# Test like post
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:3003/posts/{postId}/like
```

## Step 8: Common Issues & Solutions

### Issue: Components not finding types

**Solution**: Make sure TypeScript path aliases are configured correctly in tsconfig.json

### Issue: API requests failing

**Solution**:

1. Check `NEXT_PUBLIC_API_URL` is set correctly
2. Verify backend is running on port 3003
3. Check auth token is being sent in requests

### Issue: Images not uploading

**Solution**:

1. Verify AWS S3 credentials in `.env`
2. Check S3 bucket permissions
3. Review presigned URL generation

### Issue: Feed not loading

**Solution**:

1. Check database has posts
2. Verify authentication is working
3. Check browser console for errors

### Issue: Optimistic updates not working

**Solution**: This is expected - optimistic updates should revert on API failure

## Step 9: Database Seeding (Optional)

Create some test data:

```bash
cd apps/api
npm run seed
```

Or manually create test posts via the API:

```bash
# Create test post
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "text",
    "content": "Hello Embr! This is my first post.",
    "visibility": "public"
  }' \
  http://localhost:3003/posts
```

## Step 10: Production Considerations

Before deploying to production:

1. **Media Upload**: Ensure S3 bucket has proper CORS configuration
2. **Video Processing**: Configure Mux webhooks for video processing
3. **Rate Limiting**: Add rate limiting to comment and like endpoints
4. **Caching**: Consider adding Redis caching for feed endpoints
5. **CDN**: Use CloudFront or similar CDN for media delivery
6. **Monitoring**: Set up error tracking (Sentry) and analytics
7. **Testing**: Write unit and E2E tests for critical paths

## Next Steps

✅ Content Core module is complete!

You can now proceed to:

- **Module 4**: Media Processing Pipeline
- **Module 5**: Creator Monetization
- **Module 6**: Gigs & Jobs Marketplace

---

Need help? Review the README.md for detailed feature documentation and troubleshooting tips.
