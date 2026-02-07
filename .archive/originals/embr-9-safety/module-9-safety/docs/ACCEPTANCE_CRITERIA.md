# Module 9: Acceptance Criteria

## Overview

This document provides comprehensive test cases for all five acceptance criteria of the Safety & Moderation module.

---

## ✅ Criterion 1: Reports Create Actionable Tasks

**Requirement**: Users can report content and these reports automatically create tasks in the moderation queue.

### Test Cases

#### TC1.1: Create Post Report
**Steps**:
1. Log in as regular user
2. Navigate to a post
3. Click report button
4. Select reason "spam"
5. Add description
6. Submit report

**Expected**:
- ✅ Report created with status "pending"
- ✅ Report appears in moderation queue
- ✅ Moderators receive notification
- ✅ User sees confirmation message

#### TC1.2: Create User Report
**Steps**:
1. Log in as regular user
2. Navigate to user profile
3. Click report button
4. Select reason "harassment"
5. Submit report

**Expected**:
- ✅ User report created
- ✅ Reporter identity protected
- ✅ Queue updated immediately

#### TC1.3: Auto-Escalation
**Steps**:
1. Create 5 reports for same content
2. Check report status

**Expected**:
- ✅ After 5th report, status changes to "under_review"
- ✅ Moderators receive high-priority alert
- ✅ Auto-escalation logged

#### TC1.4: Duplicate Report Prevention
**Steps**:
1. Create report for content
2. Try to report same content again

**Expected**:
- ✅ Second report blocked
- ✅ Error message: "You have already reported this content"

---

## ✅ Criterion 2: Blocked Users Fully Restricted

**Requirement**: When a user blocks another user, all interactions are prevented bidirectionally.

### Test Cases

#### TC2.1: Block User
**Steps**:
1. User A blocks User B
2. Verify block created

**Expected**:
- ✅ Block relationship created
- ✅ Follow relationships removed
- ✅ DM conversations deleted

#### TC2.2: Blocked User Cannot Follow
**Steps**:
1. User B tries to follow User A

**Expected**:
- ✅ Follow action blocked
- ✅ Error message shown

#### TC2.3: Blocked User Cannot Message
**Steps**:
1. User B tries to send DM to User A

**Expected**:
- ✅ Message blocked
- ✅ Error: "You cannot message this user"

#### TC2.4: Content Filtering
**Steps**:
1. User A views feed
2. Check for User B's posts

**Expected**:
- ✅ User B's posts hidden from feed
- ✅ User B's comments hidden
- ✅ No notifications from User B

#### TC2.5: Bidirectional Block
**Steps**:
1. User A blocks User B
2. User B tries to view User A's profile

**Expected**:
- ✅ Profile shows "User not found" or restricted view
- ✅ User B cannot interact

#### TC2.6: Unblock User
**Steps**:
1. User A unblocks User B
2. Verify unblock

**Expected**:
- ✅ Block removed
- ✅ Both users can interact again
- ✅ Content becomes visible

---

## ✅ Criterion 3: Moderation Queue Processes Efficiently

**Requirement**: Admin moderation dashboard allows efficient processing of reports with filtering and statistics.

### Test Cases

#### TC3.1: View Queue
**Steps**:
1. Log in as moderator
2. Navigate to moderation dashboard

**Expected**:
- ✅ Dashboard loads within 2 seconds
- ✅ Queue stats displayed (pending, under review, etc.)
- ✅ Reports sorted by date (newest first)

#### TC3.2: Filter Reports
**Steps**:
1. Open moderation dashboard
2. Apply filter: status = "pending"
3. Apply filter: reason = "spam"

**Expected**:
- ✅ Filters apply instantly
- ✅ Results match filters
- ✅ Count updates correctly

#### TC3.3: Review Report
**Steps**:
1. Click on report in queue
2. Review details
3. Click "Take Action"

**Expected**:
- ✅ Full context displayed
- ✅ Reporter info shown
- ✅ Reported content visible
- ✅ Related reports shown

#### TC3.4: Approve Report
**Steps**:
1. Review report
2. Click "Take Action"
3. Select action (remove content)
4. Confirm

**Expected**:
- ✅ Report status: "action_taken"
- ✅ Content removed
- ✅ Reporter notified
- ✅ Queue updated

#### TC3.5: Dismiss Report
**Steps**:
1. Review report
2. Click "Dismiss"
3. Add note
4. Confirm

**Expected**:
- ✅ Report status: "dismissed"
- ✅ Reporter notified
- ✅ No action taken on content

#### TC3.6: Bulk Actions
**Steps**:
1. Select multiple reports (same type)
2. Choose bulk action
3. Apply

**Expected**:
- ✅ All selected reports updated
- ✅ Stats refresh
- ✅ Success message shown

#### TC3.7: Queue Statistics
**Steps**:
1. View dashboard
2. Check statistics panel

**Expected**:
- ✅ Total pending count
- ✅ Total under review count
- ✅ Average resolution time
- ✅ Reports by reason breakdown
- ✅ Real-time updates

---

## ✅ Criterion 4: Auto-Filters Catch Obvious Violations

**Requirement**: Automated content filtering detects and flags spam, harassment, and inappropriate content.

### Test Cases

#### TC4.1: Spam Detection
**Steps**:
1. Create post with spam keywords: "click here buy now"
2. Submit post

**Expected**:
- ✅ Post blocked
- ✅ Message: "Content violates community guidelines"
- ✅ Filter log created
- ✅ User spam score increased

#### TC4.2: Harassment Detection
**Steps**:
1. Create comment with harassment: "you should kill yourself"
2. Submit comment

**Expected**:
- ✅ Comment blocked immediately
- ✅ Action type: BLOCK
- ✅ Matched rules logged

#### TC4.3: Suspicious Link Detection
**Steps**:
1. Post content with bit.ly link
2. Submit

**Expected**:
- ✅ Content flagged (not blocked)
- ✅ Moderator notified
- ✅ User can still post but warned

#### TC4.4: NSFW Detection
**Steps**:
1. Post with NSFW keywords
2. Without NSFW label
3. Submit

**Expected**:
- ✅ Content hidden from sensitive users
- ✅ Filter action: HIDE
- ✅ Prompt to add NSFW label

#### TC4.5: Excessive Caps
**Steps**:
1. Post: "THIS IS YELLING WITH CAPS"
2. Submit

**Expected**:
- ✅ Content flagged
- ✅ Warning message
- ✅ Still allowed to post

#### TC4.6: Repeated Characters
**Steps**:
1. Post with spam: "aaaaaaaaaa buy now!!!!!!"
2. Submit

**Expected**:
- ✅ Spam score increased
- ✅ Flagged for review
- ✅ Multiple rules matched

#### TC4.7: Custom Content Rules
**Steps**:
1. Admin creates rule: keywords = ["scam", "fake"]
2. Action = BLOCK
3. User posts: "This is a scam"

**Expected**:
- ✅ Custom rule applied
- ✅ Content blocked
- ✅ Rule logged in matched rules

#### TC4.8: User Spam Score
**Steps**:
1. User posts 5 flagged items in 24h
2. Check spam score

**Expected**:
- ✅ Spam score > 100
- ✅ Risk level: "high"
- ✅ Additional filtering applied

#### TC4.9: False Positive Handling
**Steps**:
1. Legitimate content flagged
2. Moderator reviews
3. Adjusts filter rules

**Expected**:
- ✅ Rule modified
- ✅ Threshold adjusted
- ✅ Future similar content allowed

---

## ✅ Criterion 5: Appeals Route to Review Properly

**Requirement**: Users can appeal moderation actions and appeals are reviewed by moderators.

### Test Cases

#### TC5.1: Create Appeal
**Steps**:
1. User receives suspension
2. Navigate to moderation history
3. Click "Appeal"
4. Write reason (50+ characters)
5. Submit

**Expected**:
- ✅ Appeal created with status "pending"
- ✅ Moderators notified
- ✅ User sees confirmation

#### TC5.2: Appeal Non-Appealable Action
**Steps**:
1. User has non-appealable ban
2. Try to appeal

**Expected**:
- ✅ Appeal button disabled/hidden
- ✅ Message: "This action cannot be appealed"

#### TC5.3: Duplicate Appeal Prevention
**Steps**:
1. Create appeal
2. Try to appeal same action again

**Expected**:
- ✅ Second appeal blocked
- ✅ Error: "You have already appealed this action"

#### TC5.4: View Appeals Queue
**Steps**:
1. Log in as moderator
2. Navigate to appeals

**Expected**:
- ✅ All pending appeals shown
- ✅ Appeal details visible
- ✅ User history accessible

#### TC5.5: Approve Appeal
**Steps**:
1. Moderator reviews appeal
2. Finds merit
3. Approves with note
4. Confirms

**Expected**:
- ✅ Appeal status: "approved"
- ✅ Original action revoked
- ✅ User restriction lifted
- ✅ User notified

#### TC5.6: Deny Appeal
**Steps**:
1. Moderator reviews appeal
2. Finds no merit
3. Denies with explanation
4. Confirms

**Expected**:
- ✅ Appeal status: "denied"
- ✅ Original action remains
- ✅ User notified with reason

#### TC5.7: Appeal Statistics
**Steps**:
1. Admin views appeal stats
2. Check metrics

**Expected**:
- ✅ Total appeals count
- ✅ Approval rate %
- ✅ Average resolution time
- ✅ Appeals by action type

#### TC5.8: User Appeal History
**Steps**:
1. User views own appeal history

**Expected**:
- ✅ All user's appeals listed
- ✅ Status of each shown
- ✅ Can view details
- ✅ Cannot edit submitted appeals

---

## Performance Benchmarks

### Response Times
- Report submission: < 1 second
- Queue loading: < 2 seconds
- Content filtering: < 500ms
- Appeal creation: < 1 second
- Block user: < 500ms

### Throughput
- 100+ reports/minute supported
- 1000+ content checks/second
- 50+ moderator actions/minute
- Real-time queue updates

### Scalability
- Handles 100K+ users
- 1M+ reports in database
- 10K+ active moderators
- Horizontal scaling supported

---

## Regression Test Suite

Run this suite before each release:

```bash
# Unit tests
npm test safety.service.spec.ts

# Integration tests  
npm test safety.controller.spec.ts

# E2E tests
npm run test:e2e -- safety

# Load tests
npm run test:load -- safety
```

---

## Manual Testing Checklist

### Pre-Release Checklist

#### Reports
- [ ] Can create post report
- [ ] Can create user report
- [ ] Can create message report
- [ ] Auto-escalation works
- [ ] Duplicate prevention works
- [ ] Queue displays correctly
- [ ] Filters apply correctly
- [ ] Bulk actions work
- [ ] Stats accurate

#### Blocking
- [ ] Block user works
- [ ] Unblock user works
- [ ] Content hidden from feed
- [ ] DMs blocked
- [ ] Follows removed
- [ ] Bidirectional blocking
- [ ] Profile restrictions

#### Muting
- [ ] Mute user works
- [ ] Unmute user works
- [ ] Temporary mutes expire
- [ ] Keyword muting works
- [ ] Content filtered correctly

#### Content Filtering
- [ ] Spam detected
- [ ] Harassment detected
- [ ] NSFW detected
- [ ] Custom rules apply
- [ ] Scoring accurate
- [ ] False positives minimal

#### Moderation
- [ ] Dashboard loads fast
- [ ] Queue processes efficiently
- [ ] Actions apply correctly
- [ ] Notifications sent
- [ ] Stats accurate
- [ ] History tracked

#### Appeals
- [ ] Can create appeal
- [ ] Can approve appeal
- [ ] Can deny appeal
- [ ] Notifications work
- [ ] Stats accurate
- [ ] History visible

---

## Success Metrics

### Key Performance Indicators (KPIs)

1. **Report Resolution Time**
   - Target: < 24 hours average
   - Critical: < 1 hour for high-priority

2. **Filter Accuracy**
   - Target: 95%+ true positive rate
   - Target: < 5% false positive rate

3. **User Satisfaction**
   - Target: 80%+ satisfied with moderation
   - Target: < 10% appeal rate

4. **Queue Efficiency**
   - Target: 0 backlog at end of day
   - Target: < 100 pending at any time

5. **System Performance**
   - Target: < 2s page load times
   - Target: 99.9% uptime
   - Target: < 500ms API response time

---

## Sign-Off

**Module 9 is complete when:**

- ✅ All 5 acceptance criteria met
- ✅ All test cases pass
- ✅ Performance benchmarks met
- ✅ Documentation complete
- ✅ Security audit passed
- ✅ Load testing passed
- ✅ Stakeholder approval received

**Approved By**:
- [ ] Tech Lead
- [ ] Product Manager
- [ ] Security Team
- [ ] QA Team

**Date**: _________________
