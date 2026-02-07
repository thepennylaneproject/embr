# Module 5: API Reference

Complete REST API documentation for the wallet and monetization system.

---

## Base URL

```
http://localhost:3003/api/wallet
```

All endpoints require authentication via JWT Bearer token in the `Authorization` header.

---

## Authentication

```
Authorization: Bearer <jwt_token>
```

---

## Wallet Endpoints

### GET /wallet/balance

Get current user's wallet balance and summary.

**Response:**

```json
{
  "balance": 5000,
  "pendingBalance": 1000,
  "availableForPayout": 3004,
  "lifetimeEarned": 15000,
  "lifetimeSpent": 10000,
  "canRequestPayout": true,
  "nextPayoutDate": null,
  "stripeAccountStatus": "active",
  "kycStatus": "verified"
}
```

---

### GET /wallet/transactions

Get user's transaction history with pagination and filtering.

**Query Parameters:**

- `page` (number, default: 1) - Page number
- `perPage` (number, default: 20) - Results per page
- `type` (string) - Comma-separated transaction types
- `status` (string) - Comma-separated statuses
- `startDate` (ISO date) - Filter from date
- `endDate` (ISO date) - Filter to date

**Example Request:**

```
GET /wallet/transactions?page=1&perPage=20&type=tip_received,gig_payment
```

**Response:**

```json
{
  "transactions": [
    {
      "id": "txn_123",
      "type": "tip_received",
      "amount": 500,
      "fee": 75,
      "netAmount": 425,
      "status": "completed",
      "description": "Tip received from @sender",
      "createdAt": "2024-11-25T10:30:00Z",
      "completedAt": "2024-11-25T10:30:00Z",
      "relatedUser": {
        "id": "user_456",
        "username": "sender",
        "displayName": "Sender Name",
        "avatarUrl": "https://..."
      }
    }
  ],
  "total": 50,
  "page": 1,
  "perPage": 20,
  "hasMore": true
}
```

---

## Tip Endpoints

### POST /wallet/tip

Send a tip to another user.

**Request Body:**

```json
{
  "recipientId": "user_789",
  "amount": 1000,
  "postId": "post_456",
  "message": "Great content!",
  "isAnonymous": false
}
```

**Validation:**

- `amount` must be >= 100 (minimum $1.00)
- `recipientId` cannot be the same as sender
- User must have sufficient balance

**Response:**

```json
{
  "tipId": "tip_abc",
  "transactionId": "txn_def",
  "amount": 1000,
  "fee": 150,
  "newBalance": 4000,
  "recipient": {
    "id": "user_789",
    "username": "creator",
    "displayName": "Creator Name"
  }
}
```

**Error Responses:**

```json
// Insufficient balance
{
  "statusCode": 400,
  "message": "Insufficient balance. Required: $10.00, Available: $5.00",
  "error": "Bad Request"
}

// Self-tip
{
  "statusCode": 400,
  "message": "You cannot tip yourself",
  "error": "Bad Request"
}

// Below minimum
{
  "statusCode": 400,
  "message": "Minimum tip amount is $1.00",
  "error": "Bad Request"
}
```

---

### GET /wallet/tips/sent

Get tips sent by the current user.

**Query Parameters:**

- `page` (number, default: 1)
- `perPage` (number, default: 20)

**Response:**

```json
{
  "transactions": [...],
  "total": 25,
  "page": 1,
  "perPage": 20,
  "hasMore": true
}
```

---

### GET /wallet/tips/received

Get tips received by the current user.

**Query Parameters:**

- `page` (number, default: 1)
- `perPage` (number, default: 20)

**Response:**

```json
{
  "transactions": [...],
  "total": 100,
  "page": 1,
  "perPage": 20,
  "hasMore": true
}
```

---

## Stripe Connect Endpoints

### POST /wallet/connect/create

Create a Stripe Connect account and get onboarding URL.

**Request:** Empty body

**Response:**

```json
{
  "accountId": "acct_1234567890",
  "onboardingUrl": "https://connect.stripe.com/setup/e/acct_1234567890/...",
  "expiresAt": "2024-11-25T11:30:00Z"
}
```

**Notes:**

- Redirect user to `onboardingUrl` to complete Stripe onboarding
- Link expires after 30 minutes
- Use `refresh` endpoint to get a new link

---

### POST /wallet/connect/refresh

Refresh an expired Stripe onboarding link.

**Request:** Empty body

**Response:**

```json
{
  "accountId": "acct_1234567890",
  "onboardingUrl": "https://connect.stripe.com/setup/e/acct_1234567890/...",
  "expiresAt": "2024-11-25T12:00:00Z"
}
```

---

### GET /wallet/connect/status

Update and get current Stripe account status.

**Response:**

```json
{
  "id": "wallet_123",
  "userId": "user_456",
  "stripeAccountId": "acct_1234567890",
  "stripeAccountStatus": "active",
  "kycStatus": "verified",
  "canReceivePayments": true,
  "canRequestPayouts": true,
  "updatedAt": "2024-11-25T10:30:00Z"
}
```

**Statuses:**

- `pending` - Onboarding not complete
- `active` - Fully verified and operational
- `restricted` - Action required
- `disabled` - Account disabled by Stripe

---

### GET /wallet/connect/details

Get detailed Stripe account information.

**Response:**

```json
{
  "accountId": "acct_1234567890",
  "accountStatus": "active",
  "chargesEnabled": true,
  "payoutsEnabled": true,
  "detailsSubmitted": true,
  "requiresAction": false,
  "requirementsDue": [],
  "email": "user@example.com",
  "businessName": null,
  "country": "US",
  "currency": "usd",
  "bankAccounts": [
    {
      "id": "ba_1234567890",
      "last4": "6789",
      "bankName": "STRIPE TEST BANK",
      "currency": "usd",
      "status": "verified"
    }
  ]
}
```

---

## Payout Endpoints

### POST /wallet/payout/request

Request a payout to connected bank account.

**Request Body:**

```json
{
  "amount": 5000,
  "notes": "Monthly payout"
}
```

**Validation:**

- `amount` must be >= 2000 (minimum $20.00)
- User must have sufficient balance
- Stripe account must be verified and active
- `canRequestPayouts` must be true

**Response:**

```json
{
  "payoutId": "payout_123",
  "amount": 5000,
  "fee": 37,
  "netAmount": 4963,
  "status": "pending",
  "estimatedArrival": "2024-11-30T00:00:00Z"
}
```

**Error Responses:**

```json
// Not enough balance
{
  "statusCode": 400,
  "message": "Insufficient balance. Requested: $50.00, Available: $40.00",
  "error": "Bad Request"
}

// Stripe not set up
{
  "statusCode": 403,
  "message": "Payouts not enabled. Please complete Stripe onboarding and verification.",
  "error": "Forbidden"
}

// Below minimum
{
  "statusCode": 400,
  "message": "Minimum payout amount is $20.00",
  "error": "Bad Request"
}
```

---

### GET /wallet/payouts

Get user's payout history.

**Query Parameters:**

- `page` (number, default: 1)
- `perPage` (number, default: 20)

**Response:**

```json
{
  "payouts": [
    {
      "id": "payout_123",
      "amount": 5000,
      "fee": 37,
      "netAmount": 4963,
      "status": "paid",
      "bankAccountLast4": "6789",
      "requestedAt": "2024-11-20T10:00:00Z",
      "approvedAt": "2024-11-20T14:00:00Z",
      "paidAt": "2024-11-25T10:00:00Z",
      "notes": "Monthly payout"
    }
  ],
  "total": 5,
  "page": 1,
  "perPage": 20,
  "hasMore": false
}
```

---

### GET /wallet/payouts/:payoutId

Get details of a specific payout.

**Response:**

```json
{
  "id": "payout_123",
  "amount": 5000,
  "fee": 37,
  "netAmount": 4963,
  "status": "processing",
  "stripeTransferId": "tr_1234567890",
  "stripePayoutId": "po_1234567890",
  "bankAccountLast4": "6789",
  "requestedAt": "2024-11-20T10:00:00Z",
  "approvedAt": "2024-11-20T14:00:00Z",
  "approvedBy": "admin_789",
  "notes": "Monthly payout",
  "user": {
    "id": "user_456",
    "username": "creator",
    "displayName": "Creator Name",
    "email": "creator@example.com"
  }
}
```

---

## Admin Endpoints

All admin endpoints require admin or moderator role.

### POST /wallet/admin/payout/approve

Approve a pending payout request.

**Request Body:**

```json
{
  "payoutId": "payout_123",
  "notes": "Approved for processing"
}
```

**Response:**

```json
{
  "id": "payout_123",
  "status": "processing",
  "stripeTransferId": "tr_1234567890",
  "approvedAt": "2024-11-25T10:30:00Z",
  "approvedBy": "admin_789"
}
```

---

### POST /wallet/admin/payout/reject

Reject a pending payout request.

**Request Body:**

```json
{
  "payoutId": "payout_123",
  "reason": "Verification required",
  "notes": "Please update KYC documents"
}
```

**Response:**

```json
{
  "id": "payout_123",
  "status": "rejected",
  "rejectedAt": "2024-11-25T10:30:00Z",
  "rejectionReason": "Verification required",
  "notes": "Please update KYC documents"
}
```

---

### GET /wallet/admin/payouts/pending

Get all pending payouts for admin review.

**Query Parameters:**

- `page` (number, default: 1)
- `perPage` (number, default: 50)

**Response:**

```json
{
  "payouts": [
    {
      "id": "payout_123",
      "userId": "user_456",
      "amount": 5000,
      "fee": 37,
      "netAmount": 4963,
      "status": "pending",
      "requestedAt": "2024-11-25T10:00:00Z",
      "user": {
        "username": "creator",
        "displayName": "Creator Name",
        "email": "creator@example.com"
      }
    }
  ],
  "total": 10,
  "page": 1,
  "perPage": 50,
  "hasMore": false
}
```

---

## Error Codes

### 400 Bad Request

- Invalid request body
- Validation failed
- Business logic error (insufficient balance, below minimum, etc.)

### 401 Unauthorized

- Missing or invalid JWT token
- Token expired

### 403 Forbidden

- Missing required role (for admin endpoints)
- Action not allowed (Stripe not set up, KYC not verified, etc.)

### 404 Not Found

- Resource not found (payout ID, user ID, etc.)

### 500 Internal Server Error

- Unexpected server error
- Database error
- Stripe API error

---

## Rate Limits

- **Standard endpoints:** 100 requests per minute
- **Tip endpoint:** 10 requests per minute (to prevent spam)
- **Admin endpoints:** 200 requests per minute

Rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1700000000
```

---

## Webhooks

### POST /wallet/webhooks/stripe

Handle Stripe webhooks for real-time updates.

**Stripe Event Types:**

- `account.updated` - Stripe Connect account status changed
- `payout.paid` - Payout successfully sent
- `payout.failed` - Payout failed
- `transfer.created` - Transfer created
- `transfer.updated` - Transfer updated

**Security:**

- Verify webhook signature using `STRIPE_WEBHOOK_SECRET`
- Return 200 OK immediately
- Process event asynchronously

---

## Testing

### Test Mode

All Stripe operations use test mode by default with test API keys.

**Test Cards:**

- Success: `4242 4242 4242 4242`
- Declined: `4000 0000 0000 0002`
- Insufficient funds: `4000 0000 0000 9995`

**Test Bank Accounts:**

```
Routing: 110000000
Account: 000123456789
```

### Postman Collection

Import the Postman collection from `/docs/postman-collection.json`.

---

## Code Examples

### cURL

```bash
# Get balance
curl -X GET \
  http://localhost:3003/api/wallet/balance \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'

# Send tip
curl -X POST \
  http://localhost:3003/api/wallet/tip \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "recipientId": "user_123",
    "amount": 1000,
    "message": "Great content!"
  }'
```

### JavaScript/Fetch

```javascript
// Get balance
const balance = await fetch("/api/wallet/balance", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
const data = await balance.json();

// Send tip
const tip = await fetch("/api/wallet/tip", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    recipientId: "user_123",
    amount: 1000,
    message: "Great content!",
  }),
});
const result = await tip.json();
```

### Axios

```javascript
import axios from "axios";

// Get balance
const { data } = await axios.get("/api/wallet/balance", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Send tip
const { data: tip } = await axios.post(
  "/api/wallet/tip",
  {
    recipientId: "user_123",
    amount: 1000,
    message: "Great content!",
  },
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  },
);
```

---

## Support

For API questions:

1. Check this reference
2. Review code examples
3. Test in Postman
4. Check Stripe API docs

---

**API Version: 1.0**
**Last Updated: November 25, 2024**
