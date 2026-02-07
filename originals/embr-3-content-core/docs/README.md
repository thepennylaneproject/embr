# Embr Content Core Module

Complete implementation of content creation and feed consumption features for Embr platform.

## 📦 What's Included

### Frontend Components (React/Next.js)

- **PostCreator** - Full-featured post creation with drag-drop media upload
- **PostCard** - Post display with engagement buttons and optimistic updates
- **Feed** - Infinite scroll feed with virtualization and pull-to-refresh
- **FeedTabs** - Tab navigation for For You, Following, and Trending feeds
- **CommentSection** - Nested comment threads with infinite scroll
- **PostDetailPage** - Full post view with comments

### React Hooks

- **usePost** - Post creation and management with upload progress
- **useFeed** - Feed loading with infinite scroll and optimistic updates
- **useComments** - Comment management with nested replies

### Backend (NestJS)

- **CommentsController** - REST API for comment operations
- **CommentsService** - Business logic for comments and engagement
- **DTOs** - Validation schemas for all comment operations

### Shared

- **TypeScript Types** - Complete type definitions for posts, comments, engagement
- **API Client** - Axios-based client for all content endpoints
- **Utilities** - Helper functions and formatters

## 🎨 Design System

All components use Embr's muted coral/earth tone palette:

- **Primary**: `#E8998D` (Coral)
- **Secondary**: `#C9ADA7` (Muted Rose)
- **Accent**: `#9A8C98` (Mauve)
- **Text**: Gray-900 (Dark)
- **Background**: White/Gray-50

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# In your Next.js app
npm install axios date-fns lucide-react

# In your NestJS backend
npm install @nestjs/swagger class-validator class-transformer @nestjs/event-emitter
```

### 2. Copy Files

```bash
# Frontend files
cp -r frontend/components/* apps/web/components/
cp -r frontend/hooks/* apps/web/hooks/
cp -r shared/* packages/shared/

# Backend files
cp -r backend/* apps/api/src/
```

### 3. Configure Environment

```bash
# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3003
```

### 4. Update Imports

Make sure your tsconfig.json has proper path aliases:

```json
{
  "compilerOptions": {
    "paths": {
      "@/components/*": ["./components/*"],
      "@/hooks/*": ["./hooks/*"],
      "@/lib/*": ["./lib/*"],
      "@shared/*": ["../../packages/shared/*"]
    }
  }
}
```

### 5. Use Components

```tsx
// pages/index.tsx - Home page with feed
import { FeedTabs, PostCreator } from "@/components";

export default function HomePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <PostCreator className="mb-6" />
      <FeedTabs />
    </div>
  );
}

// pages/post/[id].tsx - Post detail page
import { PostDetailPage } from "@/components";
import { useRouter } from "next/router";

export default function PostPage() {
  const router = useRouter();
  const { id } = router.query;

  return <PostDetailPage postId={id as string} />;
}
```

## 📝 Features

### Post Creation

- ✅ Rich text input with character counter
- ✅ Drag-and-drop media upload
- ✅ Image and video support
- ✅ Upload progress tracking
- ✅ Preview before posting
- ✅ Hashtag and mention detection
- ✅ Visibility settings (public, followers, private)

### Feed Display

- ✅ Infinite scroll with intersection observer
- ✅ Pull-to-refresh functionality
- ✅ Loading states and skeletons
- ✅ Error handling with retry
- ✅ Empty states
- ✅ Three feed types (For You, Following, Trending)

### Engagement System

- ✅ Optimistic updates for instant feedback
- ✅ Like/unlike posts and comments
- ✅ Comment with nested replies (3 levels deep)
- ✅ Share posts with native share API
- ✅ Bookmark posts
- ✅ Real-time engagement counts

### Post Detail

- ✅ Full post display
- ✅ Comment section with infinite scroll
- ✅ Nested reply threads
- ✅ Comment creation and deletion
- ✅ Back navigation

## 🎯 Acceptance Criteria

### ✅ Posts with media upload successfully

- [x] Users can create text-only posts
- [x] Users can upload images
- [x] Users can upload videos
- [x] Drag-and-drop works for images and videos
- [x] Upload progress is displayed
- [x] Preview shows before posting
- [x] Hashtags and mentions are detected automatically
- [x] Post creation has proper error handling

### ✅ Feed loads with smooth infinite scroll

- [x] Initial feed loads on page load
- [x] More posts load as user scrolls down
- [x] Loading states are smooth and clear
- [x] No duplicate posts appear
- [x] Scroll position is maintained
- [x] Feed can be refreshed manually
- [x] Empty states are displayed appropriately

### ✅ Engagement actions reflect immediately

- [x] Likes show instantly (optimistic updates)
- [x] Like counts update immediately
- [x] Comments increment count when added
- [x] Shares increment count when shared
- [x] Failed actions revert gracefully
- [x] All engagement has proper error handling

### ✅ Personalized feed shows relevant content

- [x] For You feed available
- [x] Following feed shows only followed creators
- [x] Trending feed shows popular content
- [x] Feed tabs are easy to switch
- [x] Each feed type has proper description

### ✅ Comments thread properly with replies

- [x] Users can comment on posts
- [x] Users can reply to comments (3 levels deep)
- [x] Comments display with user info
- [x] Comments can be liked
- [x] Comments can be edited by author
- [x] Comments can be deleted by author
- [x] Nested replies load on demand
- [x] Comment section has infinite scroll

## 🔧 API Endpoints Used

### Posts

- `POST /posts` - Create post
- `GET /posts/:id` - Get post by ID
- `PATCH /posts/:id` - Update post
- `DELETE /posts/:id` - Delete post
- `POST /posts/:id/like` - Like post
- `DELETE /posts/:id/like` - Unlike post

### Feed

- `GET /feed/for-you` - Get personalized feed
- `GET /feed/following` - Get following feed
- `GET /feed/trending` - Get trending feed

### Comments

- `POST /posts/:postId/comments` - Create comment
- `GET /posts/:postId/comments` - Get comments
- `GET /posts/:postId/comments/:commentId/replies` - Get replies
- `PATCH /posts/:postId/comments/:commentId` - Update comment
- `DELETE /posts/:postId/comments/:commentId` - Delete comment
- `POST /posts/:postId/comments/:commentId/like` - Like comment
- `DELETE /posts/:postId/comments/:commentId/like` - Unlike comment

### Media Upload

- `POST /upload/presigned-url` - Get S3 upload URL
- `PUT <presigned-url>` - Upload to S3
- `POST /upload/complete` - Complete upload and process

## 🧪 Testing

```bash
# Component testing
npm test

# E2E testing
npm run test:e2e

# Test specific features
npm test PostCreator
npm test Feed
npm test CommentSection
```

## 🐛 Troubleshooting

### Images not uploading

- Check S3 credentials in environment
- Verify presigned URL generation
- Check file size limits

### Feed not loading

- Verify API URL is correct
- Check authentication token
- Review browser console for errors

### Comments not appearing

- Check post ID is valid
- Verify authentication
- Review network tab for API errors

### Optimistic updates reverting

- This is expected when API calls fail
- Check error messages in console
- Verify network connectivity

## 📚 Additional Resources

- [Feed Personalization Algorithm](./docs/feed-algorithm.md)
- [Media Upload Flow](./docs/media-upload.md)
- [Engagement System](./docs/engagement.md)
- [Comment Threading](./docs/comments.md)

## 🎓 Next Steps

With the Content Core module complete, you can now:

1. **Module 4**: Media Processing Pipeline - Build Mux integration and thumbnail generation
2. **Module 5**: Creator Monetization - Add tips and wallet system
3. **Module 6**: Gigs & Jobs Marketplace - Build freelancing features

## 📞 Support

For questions or issues with this module, please:

- Review the acceptance criteria checklist
- Check the troubleshooting section
- Examine the code examples above
- Test with the provided API endpoints

---

Built with ❤️ for Embr creators
