# Acceptance Criteria - Module 7: Social Graph & Discovery

Comprehensive testing checklist to verify all social connections and discovery features work correctly.

## ✅ Testing Checklist

### 1. Follow Relationships Update Correctly

#### Test 1.1: Follow User
- [ ] User can follow another user
- [ ] Follow button changes from "Follow" to "Following"
- [ ] Follower count increases by 1
- [ ] Following count increases by 1 for follower
- [ ] Notification created for followed user
- [ ] Cannot follow same user twice (error message shown)
- [ ] Cannot follow yourself (error message shown)

**Test Steps:**
```
1. Navigate to another user's profile
2. Click "Follow" button
3. Verify button changes to "Following"
4. Refresh page
5. Verify follow status persists
6. Check follower/following counts
```

**Expected Result:**
- Button UI updates immediately (optimistic)
- Counts update correctly
- Follow relationship saved in database

#### Test 1.2: Unfollow User
- [ ] User can unfollow a user they're following
- [ ] Button changes from "Following" to "Follow"
- [ ] Follower count decreases by 1
- [ ] Following count decreases by 1 for follower
- [ ] Relationship removed from database

**Test Steps:**
```
1. Navigate to a profile you're following
2. Click "Following" button
3. Confirm unfollow
4. Verify button changes to "Follow"
5. Refresh page
6. Verify unfollow status persists
```

#### Test 1.3: Follow Counts Accuracy
- [ ] Follower count matches actual followers
- [ ] Following count matches actual following
- [ ] Counts update in real-time across sessions
- [ ] Counts never go negative
- [ ] Counts survive database restarts

**Test Query:**
```sql
-- Verify counts match actual relationships
SELECT 
  u.id,
  u.username,
  p.follower_count,
  (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as actual_followers,
  p.following_count,
  (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) as actual_following
FROM users u
LEFT JOIN profiles p ON p.user_id = u.id
WHERE p.follower_count != (SELECT COUNT(*) FROM follows WHERE following_id = u.id)
   OR p.following_count != (SELECT COUNT(*) FROM follows WHERE follower_id = u.id);
```

---

### 2. Search Returns Relevant Users Quickly

#### Test 2.1: Text Search
- [ ] Search by username returns matching users
- [ ] Search by full name returns matching users
- [ ] Search by bio keywords returns relevant users
- [ ] Search is case-insensitive
- [ ] Partial matches work correctly
- [ ] Results appear within 500ms

**Test Cases:**
```javascript
// Test username search
query: "john" → should find "@john", "@johnny", "@john_doe"

// Test full name search  
query: "John Smith" → should find users with name "John Smith"

// Test bio search
query: "photographer" → should find users with "photographer" in bio

// Test case insensitivity
query: "DESIGNER" → should find "designer", "Designer", "DESIGNER"
```

#### Test 2.2: Filter by Location
- [ ] Location filter returns users in specified location
- [ ] Location search is fuzzy (e.g., "NY" finds "New York")
- [ ] Combining location with text search works
- [ ] Empty location returns all users

**Test Steps:**
```
1. Enter "New York" in location filter
2. Verify only users with NY locations appear
3. Combine with text search "photographer"
4. Verify results match both criteria
```

#### Test 2.3: Filter by Skills
- [ ] Skills filter returns users with specified skills
- [ ] Multiple skills work with OR logic
- [ ] Skills + text search combination works
- [ ] Skills dropdown shows available skills

**Test Steps:**
```
1. Select "Photography" skill
2. Verify users with photography skill appear
3. Add "Design" skill
4. Verify users with either skill appear
```

#### Test 2.4: Filter by Availability
- [ ] "Available" filter shows only available users
- [ ] "Busy" filter shows only busy users
- [ ] "Any" shows all users regardless of availability
- [ ] Availability updates in real-time

#### Test 2.5: Sort Options
- [ ] Sort by Relevance works correctly
- [ ] Sort by Followers (highest first) works
- [ ] Sort by Recent (newest users first) works
- [ ] Sort by Engagement works correctly

#### Test 2.6: Performance
- [ ] Search completes in < 500ms for 10K users
- [ ] Search completes in < 1s for 100K users
- [ ] Debouncing prevents excessive requests
- [ ] Results paginate correctly (20 per page)

---

### 3. Suggestions are Personalized

#### Test 3.1: Similar Interests Recommendations
- [ ] Users with similar skills appear in suggestions
- [ ] Skill overlap correlates with ranking
- [ ] Users already followed are excluded
- [ ] Current user is excluded from suggestions

**Test Steps:**
```
1. Create user with skills: ["Photography", "Design"]
2. Create other users with various skill overlaps
3. Request similar interest recommendations
4. Verify users with matching skills rank higher
```

#### Test 3.2: Mutual Connection Recommendations
- [ ] Users followed by people you follow appear
- [ ] Mutual connection count is accurate
- [ ] Higher mutual counts rank higher
- [ ] "Followed by X, Y, and 3 others" text is correct

**Test Steps:**
```
1. User A follows users B, C, D
2. Users B, C, D all follow user E
3. Request mutual connection recommendations for user A
4. Verify user E appears with "Followed by B, C, and 1 other"
```

#### Test 3.3: Trending User Recommendations
- [ ] Users with high recent engagement appear
- [ ] Trending score calculation is accurate
- [ ] Timeframe filtering works (day/week/month)
- [ ] Smaller creators get visibility (engagement rate)

**Test Steps:**
```
1. Create users with varying follower counts
2. Generate recent posts with engagement
3. Calculate expected trending scores
4. Request trending recommendations
5. Verify ranking matches expected order
```

#### Test 3.4: General Recommendations
- [ ] Mix of different recommendation types
- [ ] Results are diverse (not all from one source)
- [ ] Shuffle provides variety on refresh
- [ ] Minimum 5 recommendations returned
- [ ] Recommendations update daily

---

### 4. Discovery Surfaces Quality Content

#### Test 4.1: Trending Creators Display
- [ ] Trending list shows creators by timeframe
- [ ] Day/Week/Month toggle works correctly
- [ ] Engagement score is displayed and accurate
- [ ] Verified badge shows for verified users
- [ ] Rank numbers (1, 2, 3) display correctly

**Test Steps:**
```
1. Navigate to Discovery page
2. View "Trending" tab
3. Switch between Day/Week/Month
4. Verify different creators appear
5. Check engagement scores are accurate
```

#### Test 4.2: Category Filtering
- [ ] Category filter shows creators in category
- [ ] Categories match user skills
- [ ] Category counts are accurate
- [ ] "All Categories" shows everyone

**Test Steps:**
```
1. Click "Photography" category
2. Verify only photographers appear
3. Check follower counts and engagement
4. Switch to different category
```

#### Test 4.3: Discovery Page Layout
- [ ] Search bar is prominent at top
- [ ] Trending/Suggested tabs work smoothly
- [ ] Sidebar shows categories and stats
- [ ] Infinite scroll works on long lists
- [ ] Loading states display correctly
- [ ] Empty states show helpful messages

#### Test 4.4: Quality Signals
- [ ] Verified users rank higher
- [ ] Complete profiles rank higher
- [ ] Active users (recent posts) rank higher
- [ ] High engagement users rank higher
- [ ] Spam/low-quality users filtered out

---

### 5. Mutual Connections Display Properly

#### Test 5.1: Mutual Followers Display
- [ ] Shows users who both follow you and target user
- [ ] Avatar stack displays correctly (max 3)
- [ ] "+X more" count is accurate
- [ ] Names are clickable and link to profiles
- [ ] Tooltips show on avatar hover

**Test Steps:**
```
1. Navigate to a user profile
2. View "Mutual Connections" section
3. Verify avatars display in stack
4. Hover over avatars to see names
5. Click avatar to navigate to profile
```

#### Test 5.2: Mutual Following Display
- [ ] Shows users you both follow
- [ ] Count is accurate
- [ ] List is scrollable if many mutuals
- [ ] Updates when follow relationships change

#### Test 5.3: No Mutuals State
- [ ] Section hidden when no mutual connections
- [ ] No errors or broken UI
- [ ] Graceful handling of empty data

**Test Steps:**
```
1. Create two users with no mutual connections
2. View profile of one user while logged in as other
3. Verify no mutual connections section appears
4. No console errors logged
```

#### Test 5.4: Performance
- [ ] Mutual connections load quickly (< 300ms)
- [ ] Efficient SQL queries (no N+1 problems)
- [ ] Cached appropriately
- [ ] Pagination works for many mutuals

---

## Performance Benchmarks

### Response Times
- [ ] Follow/unfollow: < 200ms
- [ ] Get followers: < 300ms (20 results)
- [ ] User search: < 500ms
- [ ] Recommendations: < 800ms
- [ ] Trending creators: < 600ms
- [ ] Mutual connections: < 300ms

### Database Queries
- [ ] All list queries use LIMIT
- [ ] Proper indexes on foreign keys
- [ ] No full table scans
- [ ] Connection pooling configured
- [ ] Query plans optimized

### Frontend Performance
- [ ] Search debounced (300ms)
- [ ] Infinite scroll smooth (no jank)
- [ ] Images lazy loaded
- [ ] Optimistic UI updates instant
- [ ] No memory leaks on navigation

---

## Security Tests

### Authentication
- [ ] Unauthenticated users can't follow
- [ ] Unauthenticated users can view public profiles
- [ ] JWT tokens validated on protected endpoints
- [ ] Expired tokens handled gracefully

### Authorization
- [ ] Users can't modify other users' follows
- [ ] Users can't see private profile data
- [ ] Admin endpoints require admin role
- [ ] Rate limiting prevents abuse

### Input Validation
- [ ] SQL injection prevented
- [ ] XSS attacks prevented
- [ ] Invalid UUIDs rejected
- [ ] Malicious query strings filtered
- [ ] File uploads (if any) validated

---

## Edge Cases

### Data Integrity
- [ ] Duplicate follows prevented (unique constraint)
- [ ] Orphaned follows cleaned up (cascade delete)
- [ ] Concurrent follow/unfollow handled correctly
- [ ] Race conditions don't cause bugs

### Error Handling
- [ ] Network errors show friendly messages
- [ ] 404 errors handled (user not found)
- [ ] 500 errors don't break UI
- [ ] Retry logic for failed requests
- [ ] Offline mode graceful degradation

### Unusual Scenarios
- [ ] User with 0 followers handled
- [ ] User with 100K+ followers handled
- [ ] User with no profile picture handled
- [ ] User with very long bio handled
- [ ] User with special characters in name handled

---

## Accessibility

- [ ] Keyboard navigation works
- [ ] Screen readers can navigate
- [ ] ARIA labels present
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators visible
- [ ] Skip links provided

---

## Mobile Responsiveness

- [ ] Follow button accessible on mobile
- [ ] Search bar usable on small screens
- [ ] Cards stack properly on mobile
- [ ] Touch targets > 44x44px
- [ ] No horizontal scroll
- [ ] Smooth animations on mobile

---

## Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari
- [ ] Mobile Chrome

---

## Final Checklist

### Before Release
- [ ] All acceptance criteria passing
- [ ] Performance benchmarks met
- [ ] Security audit completed
- [ ] Accessibility audit completed
- [ ] Mobile testing completed
- [ ] Browser testing completed
- [ ] Load testing completed (1000+ concurrent users)
- [ ] Error monitoring set up (Sentry)
- [ ] Analytics tracking set up
- [ ] Documentation complete

### Post-Release Monitoring
- [ ] Error rates < 0.1%
- [ ] API response times within SLA
- [ ] Database query performance stable
- [ ] Follow/unfollow success rate > 99%
- [ ] Search results quality monitored
- [ ] User feedback collected

---

## Testing Automation

### Unit Tests
```bash
# Run all tests
npm run test

# Run specific service tests
npm run test follows.service.spec.ts
npm run test user-discovery.service.spec.ts

# Coverage report
npm run test:cov
```

### Integration Tests
```bash
# Run API integration tests
npm run test:e2e

# Test specific endpoint
npm run test:e2e -- --grep "follows controller"
```

### Load Tests
```bash
# Run load tests with k6
k6 run load-tests/follow-system.js
k6 run load-tests/search-users.js
k6 run load-tests/recommendations.js
```

---

## Success Metrics

After completing all tests, the module should achieve:

- ✅ **100% of acceptance criteria passing**
- ✅ **< 0.1% error rate**
- ✅ **> 99% follow success rate**
- ✅ **< 500ms average search response time**
- ✅ **> 95% user satisfaction** (from feedback)
- ✅ **Zero critical security issues**
- ✅ **100% uptime** (excluding planned maintenance)

---

## Sign-off

Module completed and tested by: _______________

Date: _______________

Approved by: _______________

Date: _______________
