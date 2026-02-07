# Embr Media Processing Pipeline

**Module 4: Complete media upload and processing infrastructure for the Embr platform.**

---

## 📦 What's Included

This module provides a production-ready media pipeline with:

- ✅ **Multipart Upload** - Large file support with S3 presigned URLs
- ✅ **Mux Integration** - Video transcoding with multiple quality levels
- ✅ **Thumbnail Generation** - Automatic image and video thumbnails
- ✅ **Upload Progress UI** - Real-time progress with retry capability
- ✅ **CDN Management** - Signed URLs for private content
- ✅ **Webhook Handling** - Automated processing callbacks

---

## 🎯 Acceptance Criteria Status

| Criteria                               | Status | Implementation                          |
| -------------------------------------- | ------ | --------------------------------------- |
| Large files upload without timeout     | ✅     | Multipart upload with 10MB chunks       |
| Videos transcode to multiple qualities | ✅     | Mux integration with 720p, 1080p, 1440p |
| Thumbnails generate automatically      | ✅     | Sharp for images, Mux for videos        |
| Upload progress shows accurately       | ✅     | Real-time progress with speed/ETA       |
| Failed uploads can be retried          | ✅     | Automatic retry up to 3 attempts        |

---

## 📁 File Structure

```
embr-media-pipeline/
├── backend/
│   ├── s3-multipart.service.ts        # S3 upload with presigned URLs
│   ├── mux-video.service.ts           # Mux transcoding & webhooks
│   ├── thumbnail.service.ts           # Image/video thumbnail generation
│   ├── media.service.ts               # Database operations
│   ├── media-upload.controller.ts     # Upload API endpoints
│   ├── mux-webhook.controller.ts      # Mux webhook handler
│   ├── media-upload.dto.ts            # Request/response DTOs
│   └── media.module.ts                # NestJS module configuration
├── frontend/
│   ├── MediaUploader.tsx              # Drag-and-drop uploader component
│   ├── UploadProgress.tsx             # Progress display with retry
│   └── useMediaUpload.ts              # Upload hook with multipart logic
├── shared/
│   ├── media.types.ts                 # TypeScript type definitions
│   └── media-api.client.ts            # API client
└── docs/
    ├── QUICK_START.md                 # Quick start guide
    ├── IMPLEMENTATION_GUIDE.md        # Detailed implementation
    ├── API_REFERENCE.md               # API documentation
    └── ACCEPTANCE_CRITERIA.md         # Testing checklist
```

---

## 🚀 Quick Start

### 1. Prerequisites

Ensure you have completed:

- Module 1: Infrastructure setup with Docker and environment variables
- Module 2: Authentication with JWT tokens
- AWS S3 bucket configured
- Mux account credentials (for video processing)

### 2. Install Dependencies

```bash
# Backend
cd apps/api
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner @mux/mux-node sharp

# Frontend
cd apps/web
npm install axios lucide-react
```

### 3. Environment Variables

Add to your `apps/api/.env`:

```bash
# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=embr-media
AWS_CLOUDFRONT_DOMAIN=d1234567890.cloudfront.net  # Optional CDN

# Mux Video
MUX_TOKEN_ID=your_mux_token_id
MUX_TOKEN_SECRET=your_mux_token_secret
MUX_WEBHOOK_SECRET=your_webhook_secret
```

### 4. Update Database Schema

Add Media table to your Prisma schema:

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
  @@index([muxAssetId])
}
```

Run migration:

```bash
npx prisma migrate dev --name add_media_table
```

### 5. Copy Files to Your Project

```bash
# From embr-media-pipeline directory

# Backend services
cp backend/*.service.ts ../apps/api/src/media/services/
cp backend/*.controller.ts ../apps/api/src/media/controllers/
cp backend/*.dto.ts ../apps/api/src/media/dto/
cp backend/media.module.ts ../apps/api/src/media/

# Frontend components
cp frontend/*.tsx ../apps/web/components/media/
cp frontend/*.ts ../apps/web/hooks/

# Shared types
cp shared/* ../packages/shared/media/
```

### 6. Register Module

In `apps/api/src/app.module.ts`:

```typescript
import { MediaModule } from "./media/media.module";

@Module({
  imports: [
    // ... other modules
    MediaModule,
  ],
})
export class AppModule {}
```

### 7. Configure Mux Webhooks

Set up webhook endpoint in Mux dashboard:

```
https://your-api-domain.com/webhooks/mux
```

Enable these events:

- `video.asset.ready`
- `video.asset.errored`
- `video.upload.asset_created`
- `video.upload.errored`

---

## 💻 Usage Examples

### Basic Image Upload

```typescript
import { MediaUploader } from '@/components/media/MediaUploader';

function ProfileImageUpload() {
  return (
    <MediaUploader
      contentType="image"
      maxSize={10 * 1024 * 1024} // 10MB
      maxFiles={1}
      accept="image/jpeg,image/png"
      onUploadComplete={(media) => {
        console.log('Uploaded:', media);
      }}
    />
  );
}
```

### Video Upload with Progress

```typescript
import { MediaUploader } from '@/components/media/MediaUploader';

function VideoUpload() {
  const handleComplete = (media) => {
    // Video will be processing
    // Webhook will update status when ready
    console.log('Upload complete, processing started');
  };

  return (
    <MediaUploader
      contentType="video"
      maxSize={1024 * 1024 * 1024} // 1GB
      maxFiles={1}
      onUploadComplete={handleComplete}
    />
  );
}
```

### Manual Upload with Hook

```typescript
import { useMediaUpload } from '@/hooks/useMediaUpload';

function CustomUploader() {
  const { uploadFiles, uploads, cancelUpload, retryUpload } = useMediaUpload({
    onComplete: (results) => console.log('Done:', results),
    onError: (error) => console.error('Error:', error),
  });

  const handleFileSelect = async (files: FileList) => {
    await uploadFiles(Array.from(files), 'image');
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => handleFileSelect(e.target.files)}
      />
      {uploads.map(upload => (
        <div key={upload.id}>
          {upload.fileName}: {upload.progress}%
          {upload.status === 'error' && (
            <button onClick={() => retryUpload(upload.id)}>
              Retry
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Get Signed URL for Private Video

```typescript
import { mediaApi } from "@shared/media-api.client";

async function playPrivateVideo(mediaId: string) {
  const { signedUrl, expiresAt } = await mediaApi.getSignedUrl(
    mediaId,
    3600, // 1 hour
  );

  // Use with video player
  videoPlayer.src = signedUrl;
}
```

---

## 🔧 Configuration Options

### S3MultipartService

```typescript
// Default configuration
const PART_SIZE = 10 * 1024 * 1024; // 10MB chunks
const MULTIPART_THRESHOLD = 5 * 1024 * 1024; // Use multipart for files > 5MB
```

### MuxVideoService

```typescript
// Video quality settings
const newAssetSettings = {
  playbackPolicy: ["public"], // or ['signed'] for private
  mp4Support: "standard", // 'none', 'audio-only', or 'standard'
  normalizeAudio: true, // Audio normalization
  maxResolution: "high", // 'low' (720p), 'medium' (1080p), 'high' (1440p)
};
```

### ThumbnailService

```typescript
// Thumbnail sizes
const DEFAULT_SIZES = {
  small: { width: 320, height: 180 },
  medium: { width: 640, height: 360 },
  large: { width: 1280, height: 720 },
};
```

---

## 🎨 UI Components

### MediaUploader Props

```typescript
interface MediaUploaderProps {
  accept?: string; // File MIME types
  maxSize?: number; // Max file size in bytes
  maxFiles?: number; // Max number of files
  contentType?: "image" | "video" | "document";
  onUploadComplete?: (media: any[]) => void;
  onUploadError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}
```

### UploadProgress Props

```typescript
interface UploadProgressProps {
  uploads: UploadProgressItem[];
  onCancel?: (uploadId: string) => void;
  onRetry?: (uploadId: string) => void;
  onDismiss?: (uploadId: string) => void;
  position?: "top-right" | "bottom-right" | "bottom-left" | "top-left";
  maxVisible?: number;
}
```

---

## 📡 API Endpoints

### Upload Endpoints

| Method | Endpoint                           | Description                      |
| ------ | ---------------------------------- | -------------------------------- |
| POST   | `/media/upload/initiate`           | Start upload, get presigned URLs |
| POST   | `/media/upload/complete`           | Finalize simple upload           |
| POST   | `/media/upload/complete-multipart` | Finalize multipart upload        |
| POST   | `/media/upload/abort`              | Cancel upload                    |
| GET    | `/media/upload/:id/status`         | Check upload status              |

### Media Endpoints

| Method | Endpoint                | Description                        |
| ------ | ----------------------- | ---------------------------------- |
| GET    | `/media/:id`            | Get media by ID                    |
| GET    | `/media`                | List user's media                  |
| GET    | `/media/:id/signed-url` | Get signed URL for private content |
| DELETE | `/media/:id`            | Delete media                       |
| GET    | `/media/stats`          | Get user's media statistics        |

### Webhook Endpoints

| Method | Endpoint        | Description         |
| ------ | --------------- | ------------------- |
| POST   | `/webhooks/mux` | Mux webhook handler |

---

## 🧪 Testing

### Test Upload Flow

```bash
# 1. Start services
docker-compose up -d

# 2. Run API
cd apps/api && npm run start:dev

# 3. Run frontend
cd apps/web && npm run dev

# 4. Test small file (< 5MB)
curl -X POST http://localhost:3003/api/media/upload/initiate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "test.jpg",
    "fileType": "image/jpeg",
    "fileSize": 1048576,
    "contentType": "image"
  }'

# 5. Test large file (> 5MB) - should use multipart
# 6. Test video upload - should use Mux
```

### Verify Mux Webhooks

```bash
# Send test webhook
curl -X POST http://localhost:3003/webhooks/mux \
  -H "mux-signature: test" \
  -H "mux-timestamp: $(date +%s)" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "video.asset.ready",
    "data": {
      "id": "test-asset-id",
      "playback_ids": [{"id": "test-playback-id", "policy": "public"}],
      "duration": 120.5,
      "aspect_ratio": "16:9"
    }
  }'
```

---

## 🔍 Troubleshooting

### Upload Fails Immediately

**Symptom**: Upload returns 400 or 403 error  
**Solution**: Check AWS credentials and S3 bucket permissions

```bash
# Verify AWS credentials
aws s3 ls s3://your-bucket-name --profile your-profile
```

### Multipart Upload Stuck

**Symptom**: Progress stops at partial completion  
**Solution**: Check part size and network stability

```typescript
// Reduce part size for slower connections
const PART_SIZE = 5 * 1024 * 1024; // 5MB instead of 10MB
```

### Mux Video Not Processing

**Symptom**: Video stuck in "processing" status  
**Solution**: Verify Mux webhooks are configured

```bash
# Check webhook logs in Mux dashboard
# Ensure webhook secret matches environment variable
```

### Thumbnails Not Generating

**Symptom**: thumbnailUrl is null after upload  
**Solution**: Check Sharp dependency and image format

```bash
# Reinstall Sharp with proper bindings
npm rebuild sharp
```

---

## 🚀 Production Deployment

### Performance Optimizations

1. **Enable CDN**: Configure CloudFront in front of S3
2. **Optimize Thumbnails**: Use WebP format for better compression
3. **Background Jobs**: Move thumbnail generation to queue
4. **Cleanup Jobs**: Schedule deletion of old media

### Security Best Practices

1. **Presigned URL Expiry**: Keep expiry times short (1 hour)
2. **Webhook Verification**: Always verify Mux webhook signatures
3. **File Type Validation**: Validate both MIME type and file extension
4. **Size Limits**: Enforce strict file size limits

### Monitoring

Track these metrics:

- Upload success rate
- Average upload time
- Failed upload reasons
- Storage usage per user
- Mux transcoding time

---

## 📚 Additional Resources

- [AWS S3 Multipart Upload Guide](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html)
- [Mux Direct Uploads](https://docs.mux.com/guides/video/upload-files-directly)
- [Sharp Image Processing](https://sharp.pixelplumbingltd.co.uk/)

---

## 🎉 What's Next?

With Module 4 complete, you're ready for:

**Module 5: Creator Monetization** (Tips & Wallet)

- Stripe Connect integration
- Embr credits system
- Tip buttons and transactions
- Wallet management

**Module 6: Gigs & Jobs Marketplace**

- Gig listings and bookings
- Escrow payments
- Job board integration
- Creator profiles

---

## 📝 License

Part of the Embr platform. All rights reserved.
