# Acceptance Criteria Checklist

## Module 5: Gigs & Jobs Marketplace

Use this checklist to verify that all acceptance criteria have been met.

---

## ✅ Criterion 1: Gigs post with complete information

### Backend Requirements
- [ ] POST `/gigs` endpoint creates gigs with all fields
- [ ] Validation enforces minimum/maximum character limits
- [ ] Budget validation ensures min ≤ max
- [ ] Skills array accepts multiple values
- [ ] Deliverables array accepts multiple values
- [ ] Optional expiration date is validated
- [ ] Draft gigs can be saved
- [ ] Gigs can be published (status change to OPEN)

### Frontend Requirements
- [ ] GigPostForm renders all required fields
- [ ] Title input with 10-200 character limit
- [ ] Description textarea with 50-5000 character limit
- [ ] Category dropdown with all 11 categories
- [ ] Budget type selection (Fixed/Hourly/Milestone)
- [ ] Budget min/max inputs with validation
- [ ] Experience level dropdown
- [ ] Duration input in days
- [ ] Skills can be added/removed dynamically
- [ ] Deliverables can be added/removed dynamically
- [ ] Save as Draft button works
- [ ] Publish button creates and publishes gig
- [ ] Character counters display correctly
- [ ] Error messages display validation failures
- [ ] Success callback triggers on completion

### Test Cases
```
1. Create a gig with all required fields
   - Title: "Need a 60-second product demo video"
   - Category: Video Editing
   - Budget: $500-$1000
   - Verify gig appears in "My Gigs"

2. Try to create invalid gig
   - Title: "Short" (< 10 chars)
   - Verify error message displays

3. Add multiple skills and deliverables
   - Skills: ["Adobe Premiere", "After Effects", "Color Grading"]
   - Deliverables: ["1080p MP4", "Source Files", "Revisions"]
   - Verify all saved correctly
```

---

## ✅ Criterion 2: Search and filters return relevant results

### Backend Requirements
- [ ] GET `/gigs` endpoint supports pagination
- [ ] Full-text search on title, description, and skills
- [ ] Category filter works
- [ ] Budget range filter works (min/max)
- [ ] Budget type filter works
- [ ] Experience level filter works
- [ ] Skills filter works (matches any skill)
- [ ] Sort by: recent, budget_high, budget_low, deadline
- [ ] Returns gigs with creator information
- [ ] Only returns OPEN status gigs
- [ ] Pagination meta included (total, pages)

### Frontend Requirements
- [ ] GigDiscovery component renders search bar
- [ ] Search input triggers text search
- [ ] Filter panel toggles open/close
- [ ] Category filter dropdown works
- [ ] Budget type filter dropdown works
- [ ] Experience level filter dropdown works
- [ ] Budget range inputs work
- [ ] Sort dropdown changes order
- [ ] "Clear all filters" resets filters
- [ ] GigCard components render for each result
- [ ] Pagination controls work correctly
- [ ] Loading state displays during fetch
- [ ] Empty state displays when no results
- [ ] Error state displays on failure

### Test Cases
```
1. Search for "video editing"
   - Enter query in search bar
   - Click Search
   - Verify results contain "video" or "editing"

2. Filter by category
   - Select "Graphic Design"
   - Verify all results are graphic design gigs

3. Filter by budget range
   - Set min: $100, max: $500
   - Verify all results within range

4. Sort by highest budget
   - Select "Highest Budget"
   - Verify results ordered by budgetMax DESC

5. Combine multiple filters
   - Category: Video Editing
   - Budget: $500-$2000
   - Experience: Expert
   - Verify results match all criteria
```

---

## ✅ Criterion 3: Applications include all needed details

### Backend Requirements
- [ ] POST `/applications` endpoint creates applications
- [ ] Validates cover letter (100-2000 chars)
- [ ] Validates proposed budget within gig range
- [ ] Validates proposed timeline
- [ ] Portfolio links validated as URLs
- [ ] Relevant experience validated (50-2000 chars)
- [ ] Milestone proposals validated (if provided)
- [ ] Milestone amounts sum to proposed budget
- [ ] Prevents duplicate applications
- [ ] Prevents applying to own gigs
- [ ] Increments application count on gig

### Frontend Requirements
- [ ] ApplicationForm renders all fields
- [ ] Cover letter textarea with 100-2000 char limit
- [ ] Proposed budget input within gig range
- [ ] Proposed timeline input
- [ ] Portfolio links can be added/removed
- [ ] URL validation for portfolio links
- [ ] Relevant experience textarea
- [ ] Milestone section shows for MILESTONE gigs
- [ ] Can add/remove milestones dynamically
- [ ] Milestone amounts sum validation
- [ ] Error messages display validation failures
- [ ] Character counters display
- [ ] Submit button disabled while submitting
- [ ] Success callback triggers on submission

### Test Cases
```
1. Submit application with all details
   - Cover letter: 150 chars
   - Budget: $750
   - Timeline: 10 days
   - Portfolio: 2 links
   - Experience: 100 chars
   - Verify application created

2. Submit with milestones
   - Milestone 1: $300, 5 days
   - Milestone 2: $450, 5 days
   - Total: $750
   - Verify milestones created

3. Try invalid submission
   - Cover letter: 50 chars (< 100)
   - Verify error message

4. Try to apply twice
   - Submit application
   - Try to submit again
   - Verify error: "already applied"
```

---

## ✅ Criterion 4: Escrow holds and releases funds properly

### Backend Requirements
- [ ] Escrow created when application accepted
- [ ] POST `/escrow/:id/fund` integrates with Stripe
- [ ] PaymentIntent created with `capture_method: manual`
- [ ] Funds held until milestone approval
- [ ] POST `/escrow/:id/release-milestone` releases payment
- [ ] Stripe capture called for milestone amount
- [ ] Milestone status updates to APPROVED
- [ ] All milestones approved → escrow RELEASED
- [ ] Refund functionality works
- [ ] Disputed status prevents releases

### Frontend Requirements
- [ ] Escrow status visible in dashboard
- [ ] Fund button triggers Stripe payment
- [ ] Payment method selection works
- [ ] Loading state during payment processing
- [ ] Success/error messages display
- [ ] Milestone submission button works
- [ ] Approve/reject buttons for client
- [ ] Payment release confirmation
- [ ] Released amount displays correctly
- [ ] All statuses display with appropriate colors

### Test Cases
```
1. Fund escrow with Stripe test card
   - Card: 4242 4242 4242 4242
   - Verify escrow status → FUNDED
   - Check Stripe dashboard

2. Submit and approve milestone
   - Freelancer submits milestone
   - Client approves milestone
   - Verify payment released
   - Check Stripe capture

3. Submit and reject milestone
   - Freelancer submits milestone
   - Client rejects with feedback
   - Verify status → REJECTED
   - Verify no payment released

4. Complete all milestones
   - Approve all milestones
   - Verify escrow status → RELEASED
   - Verify total amount released
```

---

## ✅ Criterion 5: Both parties can manage gig lifecycle

### Backend Requirements
- [ ] GET `/gigs/my-gigs` returns user's posted gigs
- [ ] GET `/applications/my-applications` returns user's applications
- [ ] POST `/gigs/:id/cancel` cancels gigs
- [ ] POST `/gigs/:id/complete` marks complete
- [ ] POST `/applications/:id/accept` accepts application
- [ ] POST `/applications/:id/reject` rejects application
- [ ] POST `/applications/:id/withdraw` withdraws application
- [ ] POST `/milestones/:id/submit` submits milestone
- [ ] POST `/milestones/:id/approve` approves milestone
- [ ] POST `/milestones/:id/reject` rejects milestone
- [ ] Proper authorization on all endpoints
- [ ] Status transitions validated

### Frontend Requirements
- [ ] GigManagementDashboard renders
- [ ] "My Gigs Posted" tab works
- [ ] "My Applications" tab works
- [ ] "Active Work" tab works
- [ ] Gig cards show all details
- [ ] Application cards show all details
- [ ] Milestone cards show all details
- [ ] Status badges display correctly
- [ ] Action buttons contextual to status
- [ ] View Details button navigates
- [ ] View Applications button navigates
- [ ] Cancel/Complete buttons work
- [ ] Accept/Reject buttons work
- [ ] Withdraw button works
- [ ] Submit milestone button works
- [ ] Approve/Reject milestone buttons work
- [ ] Loading states display
- [ ] Error messages display
- [ ] Data refreshes after actions

### Test Cases
```
1. Client manages gig
   - View My Gigs
   - Click View Applications
   - Accept an application
   - Verify gig status → IN_PROGRESS
   - Verify other applications → REJECTED

2. Freelancer manages application
   - View My Applications
   - See PENDING status
   - Withdraw application
   - Verify status → WITHDRAWN

3. Freelancer manages milestones
   - View Active Work
   - Submit milestone
   - Wait for approval
   - Verify status → SUBMITTED

4. Client completes gig
   - All milestones approved
   - Click Mark Complete
   - Verify gig status → COMPLETED

5. Test authorization
   - Try to accept application for others' gig
   - Verify 403 Forbidden error
```

---

## 🎯 Integration Tests

### Complete Workflow Test
```
1. Client posts gig
2. Freelancer searches and finds gig
3. Freelancer applies with milestones
4. Client views applications
5. Client accepts application
6. Escrow created automatically
7. Client funds escrow
8. Freelancer submits milestone 1
9. Client approves milestone 1
10. Payment released for milestone 1
11. Freelancer submits milestone 2
12. Client approves milestone 2
13. Payment released for milestone 2
14. Client marks gig complete
15. Verify all statuses correct
```

---

## 📊 Performance Checks

- [ ] Gig search returns in < 500ms
- [ ] Application submission completes in < 1s
- [ ] Escrow funding completes in < 3s
- [ ] Dashboard loads in < 1s
- [ ] Pagination handles 1000+ gigs
- [ ] Concurrent applications don't create race conditions
- [ ] Database queries optimized with indexes
- [ ] N+1 query problems prevented

---

## 🔒 Security Checks

- [ ] All endpoints require authentication
- [ ] Authorization prevents unauthorized actions
- [ ] SQL injection prevented
- [ ] XSS prevented in frontend
- [ ] Stripe keys secured in environment
- [ ] Payment amounts validated server-side
- [ ] User can't approve own milestones
- [ ] User can't fund escrow for others
- [ ] User can't release payments for own work

---

## ✨ Final Verification

Once all checkboxes above are complete:

- [ ] All 5 acceptance criteria met
- [ ] All test cases pass
- [ ] Integration test passes
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Documentation complete
- [ ] Code reviewed
- [ ] Ready for production

**Module Status: COMPLETE** ✅
