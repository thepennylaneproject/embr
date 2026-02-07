# Acceptance Criteria Checklist

Test and verify each criterion before marking as complete.

## ✅ Criterion 1: Tips Process Successfully to Wallets

### Requirements
- [  ] Users can send tips from $0.50 to $1,000
- [  ] Tips can be sent on posts
- [  ] Tips can be sent on profile pages
- [  ] Optional message can be added to tips
- [  ] Platform fee (5%) is deducted
- [  ] Net amount (95%) is added to recipient wallet
- [  ] Tip status updates: PENDING → PROCESSING → COMPLETED

### Test Steps

1. **Setup**
   ```bash
   # Create two test users
   User A (Tipper): tipper@test.com
   User B (Creator): creator@test.com
   
   # Add test funds to User A wallet
   POST /wallet/add-funds
   { "amount": 100, "reason": "Test" }
   ```

2. **Test Preset Tip ($5)**
   - Login as User A
   - Navigate to User B's post
   - Click tip button
   - Select $5 preset
   - Add message "Great content!"
   - Submit tip
   - Expected: Tip processes successfully
   - Verify:
     - User A balance decreased by $5
     - User B balance increased by $4.75 (95%)
     - Platform receives $0.25 (5%)
     - Transaction appears in both histories
     - Notification sent to User B

3. **Test Custom Amount ($12.50)**
   - Same as above with custom amount
   - Expected: Processes correctly
   - Verify calculations: $12.50 → $11.875 to creator, $0.625 fee

4. **Test Minimum Amount ($0.50)**
   - Try tipping $0.50
   - Expected: Processes successfully

5. **Test Maximum Amount ($1,000)**
   - Try tipping $1,000
   - Expected: Processes successfully with correct fee calculation

6. **Test Validation**
   - Try tipping $0.40 (below minimum)
   - Expected: Error "Minimum tip amount is $0.50"
   
   - Try tipping $1,001 (above maximum)
   - Expected: Error "Maximum tip amount is $1,000"
   
   - Try tipping yourself
   - Expected: Error "Cannot tip yourself"
   
   - Try tipping with insufficient balance
   - Expected: Error "Insufficient balance"

7. **Test Profile Tip**
   - Navigate to User B's profile
   - Send tip without post association
   - Expected: Tip processes, no postId in record

### Verification SQL
```sql
-- Check tip record
SELECT * FROM "Tip" 
WHERE "senderId" = 'user-a-id' 
ORDER BY "createdAt" DESC 
LIMIT 1;

-- Verify wallet balance
SELECT * FROM "Wallet" 
WHERE "userId" IN ('user-a-id', 'user-b-id');

-- Check transaction ledger
SELECT * FROM "Transaction" 
WHERE "referenceType" = 'TIP' 
ORDER BY "createdAt" DESC 
LIMIT 5;
```

### Success Criteria
- [  ] All tip amounts process correctly
- [  ] Platform fee calculated accurately
- [  ] Balances update immediately
- [  ] Transaction history accurate
- [  ] Notifications sent
- [  ] All validation rules enforced

---

## ✅ Criterion 2: Balance Calculations Are Accurate

### Requirements
- [  ] Available balance shows funds ready for payout
- [  ] Pending balance shows funds in pending payouts
- [  ] Total balance = available + pending
- [  ] Transaction ledger sums to wallet balance
- [  ] Double-entry bookkeeping maintained
- [  ] Balance integrity verification passes

### Test Steps

1. **Test Balance Display**
   ```bash
   GET /wallet/balance
   ```
   Expected response:
   ```json
   {
     "available": 95.00,
     "pending": 0.00,
     "total": 95.00,
     "currency": "USD"
   }
   ```

2. **Test Available vs Pending**
   - Note current available balance
   - Create payout request for $25
   - Refresh balance
   - Expected:
     - Available decreased by $25
     - Pending increased by $25
     - Total unchanged

3. **Test Balance Integrity**
   ```bash
   GET /wallet/verify-integrity
   ```
   Expected response:
   ```json
   {
     "isValid": true,
     "calculatedBalance": 95.00,
     "actualBalance": 95.00,
     "difference": 0.00
   }
   ```

4. **Test Transaction Ledger**
   - Sum all transaction amounts
   - Compare to wallet balance
   - Expected: Exact match

5. **Test Double-Entry**
   - Find any tip transaction
   - Expected: Two entries (debit + credit) with opposite amounts
   ```sql
   SELECT * FROM "Transaction" 
   WHERE "referenceId" = 'tip-id';
   -- Should return 2 rows: -5.00 and +4.75
   ```

6. **Test Complex Scenario**
   - Start with $100
   - Send tip of $10 (-$10)
   - Receive tip of $20 (+$19)
   - Request payout of $50 (available -$50)
   - Expected final balance:
     - Total: $109
     - Available: $59
     - Pending: $50

7. **Test Concurrent Transactions**
   - Send 5 tips simultaneously
   - All should process without race conditions
   - Final balance should be accurate

### Verification SQL
```sql
-- Verify balance integrity
SELECT 
  w."balance" as wallet_balance,
  SUM(t."amount") as calculated_balance,
  w."balance" - SUM(t."amount") as difference
FROM "Wallet" w
LEFT JOIN "Transaction" t ON w."userId" = t."userId"
WHERE w."userId" = 'user-id'
GROUP BY w."id";

-- Check for orphaned transactions
SELECT * FROM "Transaction" 
WHERE "userId" NOT IN (SELECT "id" FROM "User");
```

### Success Criteria
- [  ] Balance display accurate at all times
- [  ] Available/pending split correct
- [  ] Transaction ledger balanced
- [  ] Integrity checks pass
- [  ] No race conditions
- [  ] Double-entry maintained

---

## ✅ Criterion 3: Stripe Onboarding Completes

### Requirements
- [  ] Creator can initiate Stripe Connect account creation
- [  ] Onboarding redirects to Stripe-hosted form
- [  ] Creator can complete onboarding with test data
- [  ] Account status updates after onboarding
- [  ] Payouts enabled after completion
- [  ] Webhook updates account status

### Test Steps

1. **Test Account Creation**
   - Login as creator
   - Navigate to /settings/payouts
   - Click "Get Started"
   - Enter email
   - Expected: Redirect to Stripe onboarding

2. **Test Onboarding Form**
   Use Stripe test data:
   - Business type: Individual
   - First name: Test
   - Last name: Creator
   - DOB: 01/01/1990
   - SSN: 000-00-0000
   - Address: 123 Test St
   - City: San Francisco
   - State: CA
   - Zip: 94105
   - Phone: 000-000-0000
   - Bank routing: 110000000
   - Bank account: 000123456789
   
   Expected: Form accepts test data

3. **Test Return Flow**
   - Complete onboarding
   - Expected: Redirect to return URL
   - Application calls /stripe-connect/complete
   - Account status updates

4. **Check Account Status**
   ```bash
   GET /stripe-connect/status
   ```
   Expected response:
   ```json
   {
     "hasAccount": true,
     "isOnboarded": true,
     "chargesEnabled": true,
     "payoutsEnabled": true,
     "requiresAction": false,
     "accountId": "acct_..."
   }
   ```

5. **Test Incomplete Onboarding**
   - Start onboarding but don't complete
   - Close browser/cancel
   - Return to settings
   - Expected: "Action Required" banner
   - "Continue Setup" button available

6. **Test Re-authentication**
   - Complete onboarding
   - Get new account link
   - Expected: Can re-access Stripe dashboard

7. **Test Webhook Update**
   - Trigger account.updated webhook
   ```bash
   stripe trigger account.updated
   ```
   - Expected: Database updates with latest info

8. **Test Account Details**
   ```bash
   GET /stripe-connect/account
   ```
   Expected: Full account details including bank info

### Verification
```sql
-- Check payment record
SELECT * FROM "Payment" 
WHERE "userId" = 'user-id';

-- Should show:
-- stripeConnectAccountId: "acct_..."
-- onboardingCompleted: true
-- chargesEnabled: true
-- payoutsEnabled: true
```

### Success Criteria
- [  ] Account creation flow works
- [  ] Onboarding form accessible
- [  ] Test data accepted
- [  ] Return flow completes
- [  ] Status updates correctly
- [  ] Incomplete onboarding resumable
- [  ] Webhooks update status
- [  ] Account details retrievable

---

## ✅ Criterion 4: Payouts Process to Bank Accounts

### Requirements
- [  ] Creator can request payout with minimum $10
- [  ] Payout request requires Stripe Connect setup
- [  ] Admin can approve/reject requests
- [  ] Approved payouts process through Stripe
- [  ] Funds transfer to bank account
- [  ] Payout status updates via webhook
- [  ] Creator receives notifications

### Test Steps

1. **Test Prerequisites**
   - Creator has completed Stripe onboarding
   - Wallet has >$10 available balance
   - No pending payout requests

2. **Test Payout Request**
   ```bash
   POST /payouts/request
   {
     "amount": 25.00,
     "note": "First payout"
   }
   ```
   Expected: Payout created with PENDING status

3. **Test Validation**
   - Try amount < $10
   - Expected: Error "Minimum payout amount is $10"
   
   - Try amount > available balance
   - Expected: Error "Insufficient balance"
   
   - Try second request while one pending
   - Expected: Error "Already have pending payout"

4. **Test Admin Review**
   - Login as admin
   ```bash
   GET /payouts/pending
   ```
   - See pending payout request
   - Review details

5. **Test Admin Approval**
   ```bash
   POST /payouts/{id}/approve
   {
     "approve": true
   }
   ```
   Expected:
   - Status changes to APPROVED
   - Payout automatically processes to Stripe
   - Status changes to PROCESSING

6. **Test Admin Rejection**
   ```bash
   POST /payouts/{id}/reject
   {
     "reason": "Insufficient verification"
   }
   ```
   Expected:
   - Status changes to REJECTED
   - Creator notified with reason
   - Funds return to available balance

7. **Test Stripe Processing**
   - Wait for Stripe to process (test mode is instant)
   - Or trigger webhook:
   ```bash
   stripe trigger payout.paid
   ```
   Expected:
   - Webhook received
   - Status updates to COMPLETED
   - Creator notified

8. **Test Failure Handling**
   - Trigger failed payout:
   ```bash
   stripe trigger payout.failed
   ```
   Expected:
   - Status updates to FAILED
   - Funds return to available balance
   - Creator notified of failure

9. **Test Payout History**
   ```bash
   GET /payouts
   ```
   Expected: List of all payouts with status

10. **Test Payout Stats**
    ```bash
    GET /payouts/stats
    ```
    Expected response:
    ```json
    {
      "totalPayouts": 3,
      "totalAmount": 125.00,
      "pendingAmount": 0.00,
      "lastPayoutDate": "2024-01-15T..."
    }
    ```

### Full Flow Test
1. Creator: Request $50 payout
2. System: Deduct from available, add to pending
3. Admin: Approve request
4. System: Create Stripe payout
5. Stripe: Process to bank
6. Webhook: Confirm completion
7. System: Update status, notify creator

### Verification SQL
```sql
-- Check payout record
SELECT * FROM "Payout" 
WHERE "userId" = 'user-id' 
ORDER BY "createdAt" DESC;

-- Verify wallet balance updated
SELECT "balance" FROM "Wallet" 
WHERE "userId" = 'user-id';

-- Check transaction recorded
SELECT * FROM "Transaction" 
WHERE "referenceType" = 'PAYOUT' 
AND "userId" = 'user-id';
```

### Success Criteria
- [  ] Payout requests create successfully
- [  ] All validation rules work
- [  ] Admin approval flow works
- [  ] Admin rejection flow works
- [  ] Stripe payouts process
- [  ] Bank transfers complete (test mode)
- [  ] Webhooks update status
- [  ] Notifications sent
- [  ] Balance updates correctly

---

## ✅ Criterion 5: Transaction History is Auditable

### Requirements
- [  ] All financial operations recorded
- [  ] Transaction ledger uses double-entry bookkeeping
- [  ] Each transaction has complete metadata
- [  ] Transaction history filterable by type/date
- [  ] Financial reports can be generated
- [  ] Audit trail is complete and immutable
- [  ] Balance integrity verifiable

### Test Steps

1. **Test Transaction Recording**
   - Perform various operations:
     - Send tip
     - Receive tip
     - Request payout
     - Receive refund
   - Check transaction history
   - Expected: All operations recorded

2. **Test Transaction Structure**
   ```bash
   GET /wallet/transactions?limit=1
   ```
   Expected response includes:
   ```json
   {
     "id": "uuid",
     "userId": "user-id",
     "type": "TIP_RECEIVED",
     "amount": 4.75,
     "description": "Tip from @username",
     "referenceId": "tip-id",
     "referenceType": "TIP",
     "metadata": {
       "grossAmount": 5.00,
       "platformFee": 0.25,
       "netAmount": 4.75
     },
     "createdAt": "2024-01-15T..."
   }
   ```

3. **Test Filtering**
   - Filter by type:
   ```bash
   GET /wallet/transactions?type=TIP_RECEIVED
   ```
   
   - Filter by date:
   ```bash
   GET /wallet/transactions?startDate=2024-01-01&endDate=2024-01-31
   ```
   
   - Pagination:
   ```bash
   GET /wallet/transactions?page=2&limit=20
   ```

4. **Test Financial Summary**
   ```bash
   GET /wallet/financial-summary?startDate=2024-01-01&endDate=2024-01-31
   ```
   Expected response:
   ```json
   {
     "totalReceived": 150.00,
     "totalSent": 50.00,
     "totalFees": 7.50,
     "totalPayouts": 75.00,
     "netIncome": 142.50
   }
   ```

5. **Test Double-Entry Verification**
   - For each tip, verify two entries exist:
   ```sql
   SELECT * FROM "Transaction" 
   WHERE "referenceId" = 'tip-id';
   ```
   Expected:
   - Entry 1: Sender, amount=-5.00, type=DEBIT
   - Entry 2: Recipient, amount=+4.75, type=CREDIT
   - Entry 3: Platform, amount=+0.25, type=CREDIT

6. **Test Audit Trail**
   - Generate complete transaction report
   - Verify chronological order
   - Check all transactions have:
     - Unique ID
     - User ID
     - Type
     - Amount
     - Description
     - Reference (if applicable)
     - Timestamp

7. **Test Immutability**
   - Try to modify transaction
   - Expected: Not possible (no update endpoint)
   - Historical records preserved

8. **Test Balance Reconciliation**
   ```bash
   GET /wallet/verify-integrity
   ```
   - Run for multiple users
   - Expected: All pass integrity check

9. **Test Export Capability**
   - Fetch all transactions for period
   - Export to CSV format
   - Verify can be opened in Excel
   - All columns readable and accurate

### Verification SQL
```sql
-- Complete audit trail
SELECT 
  t."createdAt",
  u."email",
  t."type",
  t."amount",
  t."description",
  t."referenceType",
  t."referenceId"
FROM "Transaction" t
JOIN "User" u ON t."userId" = u."id"
ORDER BY t."createdAt" DESC;

-- Verify double-entry for all tips
SELECT 
  "referenceId",
  COUNT(*) as entry_count,
  SUM("amount") as net_balance
FROM "Transaction"
WHERE "referenceType" = 'TIP'
GROUP BY "referenceId"
HAVING COUNT(*) < 2; -- Should return 0 rows

-- Check for orphaned transactions
SELECT * FROM "Transaction"
WHERE "referenceType" IS NOT NULL
AND "referenceId" NOT IN (
  SELECT "id" FROM "Tip"
  UNION ALL
  SELECT "id" FROM "Payout"
);
```

### Success Criteria
- [  ] All operations recorded
- [  ] Double-entry maintained
- [  ] Complete metadata stored
- [  ] Filtering works correctly
- [  ] Financial reports accurate
- [  ] Audit trail complete
- [  ] Records immutable
- [  ] Balance integrity maintained
- [  ] Export functionality works

---

## Final Verification

### Complete System Test

1. **End-to-End Flow**
   - User A sends $10 tip to User B
   - User B requests $50 payout
   - Admin approves payout
   - Payout completes
   - Verify all records correct

2. **Performance Test**
   - Create 1000 transactions
   - Query transaction history
   - Expected: Response < 1 second

3. **Concurrency Test**
   - Simulate 10 simultaneous tips
   - All should process correctly
   - No balance discrepancies

4. **Error Recovery Test**
   - Simulate Stripe failure
   - Verify error handling
   - Check balance not affected

### Sign-Off

- [  ] All 5 acceptance criteria met
- [  ] All test cases pass
- [  ] Documentation reviewed
- [  ] Performance acceptable
- [  ] Security reviewed
- [  ] Ready for production

**Tester Name**: ___________________
**Date**: ___________________
**Signature**: ___________________
