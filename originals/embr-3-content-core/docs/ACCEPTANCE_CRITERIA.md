# Content Core Module - Acceptance Criteria

Complete testing checklist to verify all requirements are met.

## ✅ Acceptance Criterion 1: Posts with media upload successfully

### Text Posts
- [ ] User can create text-only posts without media
- [ ] Text posts support up to 500 characters
- [ ] Character counter displays remaining characters
- [ ] Character counter turns red when approaching limit
- [ ] Posts can include hashtags (automatically detected with #)
- [ ] Posts can include mentions (automatically detected with @)
- [ ] Empty posts cannot be submitted
- [ ] Post visibility can be set (Public, Followers, Private)

### Image Posts
- [ ] User can upload images via file picker
- [ ] User can drag and drop images onto upload area
- [ ] Image preview displays before posting
- [ ] Multiple image formats supported (JPG, PNG, WEBP, GIF)
- [ ] Large images are handled gracefully
- [ ] Image posts can include text caption
- [ ] User can remove image before posting
- [ ] Failed image uploads show error message

### Video Posts
- [ ] User can upload videos via file picker
- [ ] User can drag and drop videos onto upload area
- [ ] Video preview displays before posting (with controls)
- [ ] Multiple video formats supported (MP4, MOV, WEBM)
- [ ] Video upload shows progress percentage
- [ ] Video duration is displayed after upload
- [ ] Video posts can include text caption
- [ ] User can remove video before posting
- [ ] Failed video uploads show error message
- [ ] Video processing status is shown (if using Mux)

### Upload Experience
- [ ] Upload progress bar shows during upload
- [ ] Progress percentage updates smoothly
- [ ] Upload can be cancelled before completion
- [ ] Large files (>100MB) upload without timeout
- [ ] Network errors during upload are handled gracefully
- [ ] Upload retry is available after failure
- [ ] Success message appears after successful post creation
- [ ] User is redirected to feed after posting

---

## ✅ Acceptance Criterion 2: Feed loads with smooth infinite scroll

### Initial Load
- [ ] Feed loads automatically on page load
- [ ] Loading spinner shows during initial load
- [ ] At least 20 posts load initially (if available)
- [ ] Posts appear in correct order (newest first by default)
- [ ] Loading state is smooth without flashing
- [ ] Error message shows if feed fails to load
- [ ] Retry button appears on error

### Infinite Scroll
- [ ] More posts load automatically when scrolling near bottom
- [ ] Intersection observer triggers at appropriate threshold
- [ ] "Loading more" indicator appears during load
- [ ] No duplicate posts appear in feed
- [ ] Scroll position is maintained after new posts load
- [ ] Loading more posts doesn't cause layout shift
- [ ] Smooth transition when new posts appear
- [ ] "End of feed" message shows when no more posts

### Performance
- [ ] Feed scrolling is smooth (60fps)
- [ ] Large images don't cause jank
- [ ] Videos load on-demand (not all at once)
- [ ] Memory usage stays reasonable with 100+ posts
- [ ] Old posts are cleaned up when scrolling far
- [ ] Thumbnails load before full images
- [ ] Videos use poster/thumbnail until played

### Refresh
- [ ] Pull-to-refresh works on mobile
- [ ] Manual refresh button works
- [ ] Refresh loads latest posts
- [ ] Refresh doesn't duplicate existing posts
- [ ] Refresh shows loading state
- [ ] New posts appear at top after refresh
- [ ] User stays at top after refresh

### Empty States
- [ ] Empty feed shows appropriate message
- [ ] Following feed shows "Follow creators" message when empty
- [ ] Trending feed handles no trending posts
- [ ] Empty states have clear call-to-action

---

## ✅ Acceptance Criterion 3: Engagement actions reflect immediately

### Like/Unlike Posts
- [ ] Like button responds instantly to click
- [ ] Like count increments immediately
- [ ] Heart icon fills when liked
- [ ] Heart color changes to brand color when liked
- [ ] Unlike decrements count immediately
- [ ] Heart icon empties when unliked
- [ ] Multiple rapid clicks are debounced
- [ ] Failed like reverts to previous state
- [ ] Like status persists after page reload
- [ ] Like button is disabled during API call

### Like/Unlike Comments
- [ ] Comment like button responds instantly
- [ ] Comment like count updates immediately
- [ ] Failed comment like reverts gracefully
- [ ] Comment like status persists

### Comment Actions
- [ ] Comment submit button works
- [ ] New comment appears immediately at top
- [ ] Post comment count increments
- [ ] Comment form clears after submit
- [ ] Failed comment submission shows error
- [ ] Comment can be edited immediately
- [ ] Comment can be deleted immediately
- [ ] Comment delete removes from list

### Share Actions
- [ ] Share button works
- [ ] Share count increments immediately
- [ ] Native share dialog appears (if supported)
- [ ] Copy link fallback works
- [ ] Share success shows notification
- [ ] Failed share shows error message

### Bookmark Actions
- [ ] Bookmark button responds instantly
- [ ] Bookmark icon fills when bookmarked
- [ ] Bookmark persists after reload
- [ ] Unbookmark works immediately

### Optimistic Updates
- [ ] All engagement uses optimistic updates
- [ ] UI updates before API response
- [ ] Failed actions revert smoothly
- [ ] No flickering during revert
- [ ] Error messages are user-friendly
- [ ] Retry is available after failure

---

## ✅ Acceptance Criterion 4: Personalized feed shows relevant content

### For You Feed
- [ ] For You tab is available
- [ ] For You is default tab
- [ ] Algorithm considers user interests
- [ ] Algorithm considers engagement history
- [ ] Posts from followed and unfollowed creators appear
- [ ] Mix of popular and new content
- [ ] Content variety (different creators, topics)
- [ ] Feed quality improves over time with engagement

### Following Feed
- [ ] Following tab is available
- [ ] Only shows posts from followed creators
- [ ] Shows posts in chronological order
- [ ] Empty state when not following anyone
- [ ] Call-to-action to discover creators
- [ ] Updates when following new creators
- [ ] Updates when unfollowing creators

### Trending Feed
- [ ] Trending tab is available
- [ ] Shows currently popular posts
- [ ] Considers recent engagement (24-48 hours)
- [ ] Mix of different content types
- [ ] Updates regularly (not stale content)
- [ ] Viral posts appear prominently
- [ ] Trending from all creators (not just followed)

### Feed Switching
- [ ] Tabs are clearly labeled
- [ ] Active tab is visually distinct
- [ ] Tab icons are intuitive
- [ ] Smooth transition between tabs
- [ ] Each feed maintains scroll position
- [ ] Tab description text is helpful
- [ ] Mobile-friendly tab navigation

---

## ✅ Acceptance Criterion 5: Comments thread properly with replies

### Comment Display
- [ ] Comments appear below post
- [ ] Comments show user avatar
- [ ] Comments show username
- [ ] Comments show display name
- [ ] Comments show timestamp
- [ ] Comments show like count
- [ ] Comments show reply count (if has replies)
- [ ] Comments are properly formatted
- [ ] Long comments are handled gracefully

### Comment Creation
- [ ] Comment input field is clearly visible
- [ ] User can type comment
- [ ] Character limit is enforced (500 chars)
- [ ] Submit button is clearly visible
- [ ] Enter key submits comment
- [ ] New comment appears immediately
- [ ] Comment form clears after submit
- [ ] User avatar shows in input area

### Nested Replies
- [ ] Reply button is visible on each comment
- [ ] Clicking reply opens reply input
- [ ] Reply shows "replying to @username"
- [ ] Reply input can be cancelled
- [ ] Replies are indented visually
- [ ] Replies show connection to parent
- [ ] Maximum nesting level is 3
- [ ] Deep nesting is handled gracefully

### Reply Threading
- [ ] Replies appear under parent comment
- [ ] "View replies" button shows reply count
- [ ] Clicking "View replies" expands thread
- [ ] Replies load on-demand (not all at once)
- [ ] Reply count updates when reply added
- [ ] Thread can be collapsed
- [ ] Nested structure is clear

### Comment Management
- [ ] User can edit their own comments
- [ ] Edit shows "edited" indicator
- [ ] User can delete their own comments
- [ ] Delete confirmation is shown
- [ ] Deleted comments are removed from UI
- [ ] Post comment count updates on delete
- [ ] Cannot edit others' comments
- [ ] Cannot delete others' comments

### Comment Engagement
- [ ] Comments can be liked
- [ ] Comment like count updates
- [ ] Comment like is optimistic
- [ ] Failed comment like reverts
- [ ] Comment like persists
- [ ] Comment author sees like count

### Comment Pagination
- [ ] Initial comments load (20)
- [ ] "Load more" button appears if more exist
- [ ] Loading more shows indicator
- [ ] More comments append to list
- [ ] Pagination maintains position
- [ ] End of comments shows message

---

## 🎯 Overall System Tests

### Performance
- [ ] Page loads in under 3 seconds
- [ ] Feed scrolling is smooth
- [ ] Images load progressively
- [ ] No memory leaks after extended use
- [ ] Mobile performance is acceptable

### Accessibility
- [ ] All buttons have aria-labels
- [ ] Keyboard navigation works
- [ ] Screen reader announcements are clear
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators are visible

### Mobile Responsiveness
- [ ] Layout adapts to mobile screens
- [ ] Touch targets are appropriately sized
- [ ] Text is readable without zoom
- [ ] Images scale correctly
- [ ] Feed tabs work on mobile
- [ ] Comment input works on mobile

### Error Handling
- [ ] Network errors show user-friendly messages
- [ ] Failed actions can be retried
- [ ] Offline state is handled
- [ ] API errors are caught and displayed
- [ ] Validation errors are clear

### Security
- [ ] All requests include auth token
- [ ] Unauthorized users redirect to login
- [ ] XSS protection in content display
- [ ] CSRF tokens if needed
- [ ] File upload validation

---

## ✅ All Criteria Met

Once all items are checked, the Content Core module is complete and ready for production!

**Completion Date**: _________________

**Tested By**: _________________

**Notes**: _________________
