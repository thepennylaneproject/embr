# Quick Implementation Guide

## 🚀 5-Minute Setup

### Step 1: Copy Files (2 minutes)

```bash
# Navigate to your Embr monorepo root
cd /path/to/embr

# Create directories
mkdir -p apps/api/src/media/{services,controllers,dto}
mkdir -p apps/web/components/media
mkdir -p apps/web/hooks
mkdir -p packages/shared/media

# Copy backend files
cp embr-media-pipeline/backend/*.service.ts apps/api/src/media/services/
cp embr-media-pipeline/backend/*.controller.ts apps/api/src/media/controllers/
cp embr-media-pipeline/backend/*.dto.ts apps/api/src/media/dto/
cp embr-media-pipeline/backend/media.module.ts apps/api/src/media/

# Copy frontend files
cp embr-media-pipeline/frontend/*.tsx apps/web/components/media/
cp embr-media-pipeline/frontend/*.ts apps/web/hooks/

# Copy shared files
cp embr-media-pipeline/shared/* packages/shared/media/
```

### Step 2: Install Dependencies (1 minute)

```bash
# Backend dependencies
cd apps/api
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner @mux/mux-node sharp

# Frontend dependencies
cd ../web
npm install axios lucide-react
```

### Step 3: Database Migration (1 minute)

Add to `prisma/schema.prisma`:

```prisma
model Media {
  id              String    @id @default(uuid())
  userId          String
  fileName        String
  fileType        String
  fileSize        Int
  contentType     String
  uploadId        String?   @unique
  fileKey         String?
  fileUrl         String?
  thumbnailUrl    String?
  thumbnailKey    String?
  muxAssetId      String?   @unique
  muxPlaybackId   String?
  playbackUrl     String?
  duration        Float?
  aspectRatio     String?
  status          String    @default("pending")
  errorMessage    String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  completedAt     DateTime?
  deletedAt       DateTime?

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  post   Post?  @relation(fields: [postId], references: [id])
  postId String?

  @@index([userId])
  @@index([status])
  @@index([contentType])
}

// Add to User model
model User {
  // ... existing fields
  media Media[]
}

// Add to Post model (if using with posts)
model Post {
  // ... existing fields
  media Media[]
}
```

Run migration:

```bash
cd apps/api
npx prisma migrate dev --name add_media_pipeline
```

### Step 4: Environment Setup (1 minute)

Add to `apps/api/.env`:

```bash
# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=embr-media
AWS_CLOUDFRONT_DOMAIN=your-cloudfront-domain.cloudfront.net  # Optional

# Mux Video
MUX_TOKEN_ID=your_mux_token_id
MUX_TOKEN_SECRET=your_mux_token_secret
MUX_WEBHOOK_SECRET=your_webhook_secret
```

### Step 5: Register Module

In `apps/api/src/app.module.ts`:

```typescript
import { MediaModule } from "./media/media.module";

@Module({
  imports: [
    // ... existing modules
    MediaModule,
  ],
})
export class AppModule {}
```

---

## 💻 Usage in Your App

### Basic Upload Component

Create `apps/web/app/upload/page.tsx`:

```typescript
'use client';

import { MediaUploader } from '@/components/media/MediaUploader';

export default function UploadPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Upload Media</h1>

      <MediaUploader
        contentType="image"
        maxSize={10 * 1024 * 1024} // 10MB
        maxFiles={5}
        onUploadComplete={(media) => {
          console.log('Uploaded:', media);
          // Redirect or update UI
        }}
        onUploadError={(error) => {
          console.error('Upload failed:', error);
        }}
      />
    </div>
  );
}
```

### Video Upload with Post Creation

```typescript
'use client';

import { useState } from 'react';
import { MediaUploader } from '@/components/media/MediaUploader';
import { contentApi } from '@shared/api/content.api';

export default function CreatePost() {
  const [caption, setCaption] = useState('');
  const [uploadedMedia, setUploadedMedia] = useState([]);

  const handleUploadComplete = (media) => {
    setUploadedMedia(media);
  };

  const handleCreatePost = async () => {
    const post = await contentApi.createPost({
      content: caption,
      mediaIds: uploadedMedia.map(m => m.id),
    });

    // Redirect to post
    window.location.href = `/posts/${post.id}`;
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create Post</h1>

      <textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="What's on your mind?"
        className="w-full p-4 border rounded-lg mb-4"
        rows={4}
      />

      <MediaUploader
        contentType="video"
        maxSize={500 * 1024 * 1024} // 500MB
        maxFiles={1}
        onUploadComplete={handleUploadComplete}
      />

      {uploadedMedia.length > 0 && (
        <button
          onClick={handleCreatePost}
          className="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg"
        >
          Create Post
        </button>
      )}
    </div>
  );
}
```

---

## 🔧 Customization

### Change Part Size for Slower Connections

In `s3-multipart.service.ts`:

```typescript
private readonly PART_SIZE = 5 * 1024 * 1024;  // Reduce to 5MB
```

### Change Video Quality Levels

In `mux-video.service.ts`:

```typescript
new_asset_settings: {
  max_resolution_tier: '1080p',  // Change to 720p for faster processing
}
```

### Custom Thumbnail Sizes

In `thumbnail.service.ts`:

```typescript
private readonly DEFAULT_SIZES = {
  small: { width: 200, height: 200 },    // Square for avatars
  medium: { width: 800, height: 450 },   // Different aspect ratio
  large: { width: 1920, height: 1080 },  // Full HD
};
```

---

## 🧪 Quick Test

```bash
# Start your services
docker-compose up -d
cd apps/api && npm run start:dev
cd apps/web && npm run dev

# Visit http://localhost:3004/upload
# Drag and drop a file
# Watch progress bar
# Check database for media record
```

---

## 🐛 Common Issues

### Issue: "Sharp installation failed"

```bash
# Solution: Rebuild sharp
cd apps/api
npm rebuild sharp --platform=linux --arch=x64
```

### Issue: "AWS credentials not found"

```bash
# Solution: Check environment variables are loaded
cd apps/api
cat .env | grep AWS

# Restart API server after adding credentials
```

### Issue: "Mux webhook signature invalid"

```bash
# Solution: Verify webhook secret matches
cd apps/api
cat .env | grep MUX_WEBHOOK_SECRET

# Check Mux dashboard webhook settings
```

### Issue: "CORS error on S3 upload"

```json
// Solution: Add CORS policy to S3 bucket
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3004", "https://your-domain.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

---

## 📚 Next Steps

1. **Configure Mux Webhooks**
   - Go to Mux dashboard
   - Add webhook URL: `https://your-api-domain.com/webhooks/mux`
   - Enable required events
   - Copy webhook secret to `.env`

2. **Set Up CloudFront (Optional)**
   - Create CloudFront distribution
   - Point to S3 bucket
   - Add CNAME
   - Update `AWS_CLOUDFRONT_DOMAIN` in `.env`

3. **Implement Cleanup Jobs**
   - Schedule cron job to delete old media
   - Clean up failed uploads after 7 days
   - Archive unused thumbnails

4. **Add Analytics**
   - Track upload success rates
   - Monitor average upload times
   - Alert on high failure rates

---

## ✅ You're Done!

Your media pipeline is ready to handle:

- ✅ Images up to 10MB
- ✅ Videos up to 1GB
- ✅ Automatic thumbnails
- ✅ Real-time progress
- ✅ Retry on failure

**Ready for Module 5: Creator Monetization!** 🎉
