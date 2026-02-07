# Module 4: Media Processing Pipeline - Acceptance Criteria

## ✅ Testing Checklist

### 1. Large Files Upload Without Timeout

**Criteria**: Files larger than 100MB should upload successfully using multipart upload.

#### Test Cases:

- [ ] **Small Image Upload (< 5MB)**
  - Upload a 2MB JPEG image
  - Should use simple presigned URL
  - Should complete in under 30 seconds
  - Thumbnail should generate automatically
  
- [ ] **Medium Image Upload (5-10MB)**
  - Upload a 7MB PNG image
  - Should use multipart upload
  - Progress should update smoothly
  - Should complete successfully
  
- [ ] **Large Video Upload (100MB+)**
  - Upload a 150MB MP4 video
  - Should use Mux direct upload
  - Upload should not timeout
  - Progress bar should show accurate percentage
  - Speed and ETA should display
  
- [ ] **Very Large Video (500MB+)**
  - Upload a 600MB video file
  - Should handle multipart chunks properly
  - Network interruptions should not fail upload
  - Retry mechanism should work

**Verification**:
```bash
# Check S3 for uploaded file
aws s3 ls s3://embr-media/videos/2024/11/ --recursive

# Verify in database
psql -d embr -c "SELECT id, fileName, fileSize, status FROM media ORDER BY createdAt DESC LIMIT 5;"
```

---

### 2. Videos Transcode to Multiple Qualities

**Criteria**: Videos should automatically transcode to 720p, 1080p, and 1440p versions via Mux.

#### Test Cases:

- [ ] **Standard Definition Video**
  - Upload 1080p source video
  - Check Mux asset status after processing
  - Verify 720p, 1080p renditions available
  - Playback URL should work in HLS player
  
- [ ] **High Definition Video**
  - Upload 4K (2160p) source video
  - Should transcode to 720p, 1080p, 1440p
  - All renditions should be accessible
  - MP4 downloads should be available
  
- [ ] **Portrait Video (9:16)**
  - Upload vertical video (TikTok/Reels style)
  - Aspect ratio should be preserved
  - All quality levels should maintain ratio
  
- [ ] **Webhook Processing**
  - Mux webhook should fire on asset.ready
  - Database should update with playback ID
  - Thumbnail should generate from video

**Verification**:
```bash
# Check Mux asset
curl -X GET https://api.mux.com/video/v1/assets/ASSET_ID \
  -H "Authorization: Basic BASE64_ENCODED_CREDENTIALS"

# Verify playback URL
curl -I https://stream.mux.com/PLAYBACK_ID.m3u8

# Check database for Mux data
psql -d embr -c "SELECT id, muxAssetId, muxPlaybackId, duration FROM media WHERE contentType = 'video' ORDER BY createdAt DESC LIMIT 3;"
```

---

### 3. Thumbnails Generate Automatically

**Criteria**: System should automatically generate thumbnails for all uploaded images and videos.

#### Test Cases:

- [ ] **Image Thumbnail**
  - Upload JPEG image
  - Thumbnail (640x360) should generate within 5 seconds
  - Multiple sizes (small, medium, large) available
  - Thumbnail URL should be in database
  
- [ ] **Video Thumbnail**
  - Upload video to Mux
  - After processing, thumbnail should extract from frame 0
  - Thumbnail should be 1280x720
  - GIF preview should be available
  
- [ ] **Custom Video Thumbnail Time**
  - Request thumbnail at specific timestamp (e.g., 30 seconds)
  - Thumbnail should capture correct frame
  - Multiple timeline thumbnails should work
  
- [ ] **Blur Placeholder (LQIP)**
  - Small base64 placeholder should generate
  - Should be usable for progressive loading
  - Size should be < 1KB

**Verification**:
```bash
# Check thumbnail in S3
aws s3 ls s3://embr-media/thumbnails/ --recursive

# Verify thumbnail URLs
psql -d embr -c "SELECT id, fileName, thumbnailUrl FROM media WHERE thumbnailUrl IS NOT NULL LIMIT 5;"

# Test thumbnail accessibility
curl -I https://your-cdn.com/thumbnails/image/2024/11/abc123.jpg
```

---

### 4. Upload Progress Shows Accurately

**Criteria**: UI should display real-time upload progress with speed and estimated time remaining.

#### Test Cases:

- [ ] **Progress Bar Updates**
  - Start file upload
  - Progress bar should move from 0% to 100%
  - Updates should be smooth (not jumpy)
  - Percentage should display next to bar
  
- [ ] **Upload Speed Display**
  - During upload, speed should show (e.g., "2.5 MB/s")
  - Speed should be relatively accurate
  - Should adapt to network changes
  
- [ ] **Time Remaining Estimate**
  - ETA should display (e.g., "2m 15s left")
  - Should update as upload progresses
  - Should be reasonably accurate
  
- [ ] **Multipart Upload Progress**
  - For large files with multiple parts
  - Progress should account for all parts
  - Should not jump between parts
  - Overall percentage should be accurate
  
- [ ] **Multiple Concurrent Uploads**
  - Upload 3 files simultaneously
  - Each should have separate progress bar
  - Progress should not interfere between uploads
  - All should complete successfully

**Verification**:
```typescript
// Check progress in browser console
console.log(uploads.map(u => ({
  file: u.fileName,
  progress: u.progress,
  speed: u.speed,
  eta: u.estimatedTimeRemaining
})));
```

---

### 5. Failed Uploads Can Be Retried

**Criteria**: If upload fails, user should be able to retry without re-selecting file.

#### Test Cases:

- [ ] **Network Interruption**
  - Start upload
  - Disable network mid-upload
  - UI should show error state
  - Click retry button
  - Upload should resume/restart successfully
  
- [ ] **Server Error (500)**
  - Mock 500 error from backend
  - Upload should fail gracefully
  - Error message should display
  - Retry should work after server recovers
  
- [ ] **Authentication Error (401)**
  - Use expired JWT token
  - Upload should fail with auth error
  - User should re-authenticate
  - Retry with new token should work
  
- [ ] **Automatic Retry**
  - Configure max retries = 3
  - Fail first 2 attempts (mock)
  - Should auto-retry with exponential backoff
  - Should succeed on 3rd attempt
  
- [ ] **Cancel and Retry**
  - Start upload
  - Click cancel button
  - Status should show "cancelled"
  - Click retry
  - Upload should restart fresh

**Verification**:
```typescript
// Test retry logic
const { retryUpload, uploads } = useMediaUpload();

// Find failed upload
const failedUpload = uploads.find(u => u.status === 'error');
if (failedUpload) {
  retryUpload(failedUpload.id);
}

// Check retry count in upload state
console.log('Retry attempts:', uploadStates.current.get(uploadId)?.retryCount);
```

---

## 🎯 Integration Tests

### End-to-End Upload Flow

- [ ] User selects file via drag-and-drop
- [ ] File validates (size, type)
- [ ] Upload initiates with correct method (simple/multipart/mux)
- [ ] Progress updates in real-time
- [ ] Upload completes successfully
- [ ] Media record created in database
- [ ] Thumbnail generates (if applicable)
- [ ] Video processes via Mux (if video)
- [ ] Webhook updates status
- [ ] User can view uploaded media

### Error Handling

- [ ] File too large: Shows clear error message
- [ ] Wrong file type: Prevents upload with explanation
- [ ] Network failure: Shows retry option
- [ ] Server error: Displays user-friendly message
- [ ] Partial upload: Can resume or restart

### Performance

- [ ] 10MB file uploads in < 10 seconds (good connection)
- [ ] 100MB file uploads in < 2 minutes (good connection)
- [ ] Progress bar never freezes
- [ ] UI remains responsive during upload
- [ ] Multiple uploads don't block each other

---

## 📊 Metrics to Track

After deployment, monitor these metrics:

- **Upload Success Rate**: > 95%
- **Average Upload Time**: < 30 seconds for 10MB
- **Retry Success Rate**: > 80%
- **Thumbnail Generation Time**: < 5 seconds
- **Mux Processing Time**: < 2 minutes per minute of video
- **Failed Upload Reasons**: Track and categorize

---

## ✅ Sign-Off

### Development Team

- [ ] All acceptance criteria tests passed
- [ ] Code reviewed and approved
- [ ] Documentation complete
- [ ] No critical bugs

### QA Team

- [ ] Manual testing completed
- [ ] Edge cases tested
- [ ] Error scenarios verified
- [ ] Performance benchmarks met

### Product Owner

- [ ] User experience approved
- [ ] Feature complete per requirements
- [ ] Ready for production deployment

---

## 📝 Notes

**Date Tested**: _____________

**Tester Name**: _____________

**Environment**: [ ] Local [ ] Staging [ ] Production

**Issues Found**: _____________

**Additional Comments**: _____________
