# Direct Messaging API Reference

Complete API documentation for Embr's Direct Messaging system.

## Table of Contents

- [REST API Endpoints](#rest-api-endpoints)
- [WebSocket Events](#websocket-events)
- [TypeScript Types](#typescript-types)
- [Error Codes](#error-codes)
- [Rate Limits](#rate-limits)

---

## REST API Endpoints

Base URL: `https://api.embr.com` (or `http://localhost:3003` for development)

All endpoints require `Authorization: Bearer {accessToken}` header.

### Conversations

#### Get Conversations

```
GET /messaging/conversations
```

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | number | No | 1 | Page number (1-indexed) |
| limit | number | No | 20 | Results per page (1-100) |
| search | string | No | - | Search query for filtering |

**Response:** `GetConversationsResponse`

```json
{
  "conversations": [
    {
      "id": "uuid",
      "otherUser": {
        "id": "uuid",
        "username": "johndoe",
        "profile": {
          "displayName": "John Doe",
          "avatarUrl": "https://...",
          "isVerified": true
        }
      },
      "lastMessage": {
        "id": "uuid",
        "content": "Hey, how are you?",
        "type": "text",
        "status": "read",
        "createdAt": "2025-01-01T12:00:00Z"
      },
      "unreadCount": 3,
      "lastMessageAt": "2025-01-01T12:00:00Z"
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 20,
  "totalPages": 3,
  "hasMore": true
}
```

---

#### Create Conversation

```
POST /messaging/conversations
```

**Request Body:**

```json
{
  "participantId": "uuid",
  "initialMessage": "Hi! I saw your portfolio." // Optional
}
```

**Response:** `CreateConversationResponse`

```json
{
  "conversation": {
    "id": "uuid",
    "participant1Id": "uuid",
    "participant2Id": "uuid",
    "lastMessageAt": "2025-01-01T12:00:00Z",
    "createdAt": "2025-01-01T12:00:00Z",
    "participant1": {
      /* UserPreview */
    },
    "participant2": {
      /* UserPreview */
    },
    "lastMessage": null,
    "unreadCount": 0
  },
  "message": {
    /* MessageWithSender - if initialMessage provided */
  }
}
```

---

#### Delete Conversation

```
DELETE /messaging/conversations/:conversationId
```

**Response:**

```json
{
  "message": "Conversation deleted successfully"
}
```

---

### Messages

#### Get Messages

```
GET /messaging/conversations/:conversationId/messages
```

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | number | No | 1 | Page number |
| limit | number | No | 50 | Messages per page (1-100) |
| before | string | No | - | Message ID (cursor pagination) |
| after | string | No | - | Message ID (cursor pagination) |

**Response:** `GetMessagesResponse`

```json
{
  "messages": [
    {
      "id": "uuid",
      "conversationId": "uuid",
      "senderId": "uuid",
      "content": "Hello!",
      "mediaUrl": null,
      "type": "text",
      "status": "read",
      "createdAt": "2025-01-01T12:00:00Z",
      "readAt": "2025-01-01T12:05:00Z",
      "sender": {
        "id": "uuid",
        "username": "johndoe",
        "profile": {
          "displayName": "John Doe",
          "avatarUrl": "https://...",
          "isVerified": true
        }
      }
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 50,
  "totalPages": 3,
  "hasMore": true,
  "hasMoreBefore": false,
  "hasMoreAfter": true
}
```

---

#### Send Message

```
POST /messaging/messages
```

**Request Body:**

```json
{
  "conversationId": "uuid", // OR recipientId
  "recipientId": "uuid", // OR conversationId
  "content": "Hello!", // Optional if mediaUrl provided
  "mediaUrl": "https://...", // Optional if content provided
  "mediaType": "image/jpeg", // Required if mediaUrl
  "fileName": "photo.jpg", // Optional
  "fileSize": 1024000, // Optional
  "type": "text", // text | image | video | file
  "metadata": {} // Optional additional data
}
```

**Response:** `SendMessageResponse`

```json
{
  "message": {
    /* MessageWithSender */
  },
  "conversation": {
    /* ConversationWithDetails */
  }
}
```

---

#### Mark Messages as Read

```
POST /messaging/messages/read
```

**Request Body:**

```json
{
  "conversationId": "uuid",
  "messageIds": ["uuid", "uuid"] // Optional - marks all if not provided
}
```

**Response:** `MarkAsReadResponse`

```json
{
  "updatedCount": 5,
  "conversation": {
    /* ConversationWithDetails */
  }
}
```

---

#### Delete Message

```
DELETE /messaging/messages/:messageId?conversationId=uuid
```

**Response:**

```json
{
  "message": "Message deleted successfully"
}
```

---

#### Search Messages

```
GET /messaging/conversations/:conversationId/search
```

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| query | string | Yes | - | Search term |
| page | number | No | 1 | Page number |
| limit | number | No | 20 | Results per page (1-100) |

**Response:** `SearchMessagesResponse`

```json
{
  "messages": [
    /* Array of MessageWithSender */
  ],
  "total": 8,
  "page": 1,
  "limit": 20,
  "totalPages": 1,
  "hasMore": false
}
```

---

### Utilities

#### Get Unread Count

```
GET /messaging/unread
```

**Response:** `GetUnreadCountResponse`

```json
{
  "totalUnread": 12,
  "conversationCounts": [
    {
      "conversationId": "uuid",
      "unreadCount": 5
    },
    {
      "conversationId": "uuid",
      "unreadCount": 7
    }
  ]
}
```

---

#### Upload Media

```
POST /messaging/media/upload
```

**Content-Type:** `multipart/form-data`

**Form Data:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | File | Yes | Media file (max 50MB) |
| conversationId | string | Yes | Target conversation |
| type | string | Yes | image \| video \| file |

**Response:** `MediaUploadResponse`

```json
{
  "url": "https://cdn.embr.com/media/abc123.jpg",
  "mediaType": "image/jpeg",
  "fileName": "photo.jpg",
  "fileSize": 1024000,
  "type": "image",
  "conversationId": "uuid"
}
```

---

## WebSocket Events

Base URL: `wss://api.embr.com/messaging` (or `ws://localhost:3003/messaging`)

### Connection

#### Connect

```javascript
import { io } from "socket.io-client";

const socket = io("wss://api.embr.com/messaging", {
  auth: {
    token: accessToken, // JWT token
  },
  transports: ["websocket", "polling"],
});

socket.on("connect", () => {
  console.log("Connected:", socket.id);
});
```

---

### Client → Server Events

#### Send Message

```javascript
socket.emit(
  "message:send",
  {
    conversationId: "uuid",
    recipientId: "uuid",
    content: "Hello!",
    type: "text",
  },
  (response) => {
    console.log("Message sent:", response);
  },
);
```

**Payload:** `SendMessageRequest`

---

#### Mark as Read

```javascript
socket.emit("message:read", {
  conversationId: "uuid",
  messageIds: ["uuid", "uuid"], // Optional
});
```

**Payload:** `MarkAsReadRequest`

---

#### Bulk Mark as Read

```javascript
socket.emit("message:bulk_read", {
  conversationIds: ["uuid", "uuid", "uuid"],
});
```

---

#### Start Typing

```javascript
socket.emit("typing:start", {
  conversationId: "uuid",
  isTyping: true,
});
```

**Payload:** `TypingIndicatorDto`

---

#### Stop Typing

```javascript
socket.emit("typing:stop", {
  conversationId: "uuid",
  isTyping: false,
});
```

**Payload:** `TypingIndicatorDto`

---

### Server → Client Events

#### Receive Message

```javascript
socket.on("message:receive", (data) => {
  console.log("New message:", data.message);
  console.log("Conversation:", data.conversation);
});
```

**Data:** `SendMessageResponse`

---

#### Message Sent (Echo)

```javascript
socket.on("message:send", (data) => {
  // Echo of your own sent message
  console.log("Message sent:", data.message);
});
```

---

#### Message Delivered

```javascript
socket.on("message:delivered", (data) => {
  console.log("Delivered:", data.messageId);
});
```

**Data:**

```typescript
{
  messageId: string;
  conversationId: string;
}
```

---

#### Message Read

```javascript
socket.on("message:read", (data) => {
  console.log("Read by:", data.readBy);
  console.log("Messages:", data.messageIds);
});
```

**Data:**

```typescript
{
  conversationId: string;
  messageIds?: string[];
  readBy: string;
  readAt: string;
}
```

---

#### Typing Indicator

```javascript
socket.on("typing:indicator", (indicator) => {
  console.log(`${indicator.userId} is typing:`, indicator.isTyping);
});
```

**Data:** `TypingIndicator`

```typescript
{
  conversationId: string;
  userId: string;
  isTyping: boolean;
  timestamp: string;
}
```

---

#### Conversation Created

```javascript
socket.on("conversation:created", (conversation) => {
  console.log("New conversation:", conversation);
});
```

---

#### Error

```javascript
socket.on("error", (error) => {
  console.error("WebSocket error:", error);
});
```

**Data:** `MessageError`

---

## TypeScript Types

### Core Types

```typescript
// Message
interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content?: string;
  mediaUrl?: string;
  mediaType?: string;
  fileName?: string;
  fileSize?: number;
  type: MessageType;
  status: MessageStatus;
  createdAt: string;
  readAt?: string;
  metadata?: Record<string, any>;
}

// Message with populated sender
interface MessageWithSender extends Message {
  sender: UserPreview;
}

// Conversation
interface Conversation {
  id: string;
  participant1Id: string;
  participant2Id: string;
  lastMessageAt: string;
  createdAt: string;
}

// Conversation with populated fields
interface ConversationWithDetails extends Conversation {
  participant1: UserPreview;
  participant2: UserPreview;
  lastMessage: Message;
  unreadCount: number;
}

// Conversation preview (for inbox list)
interface ConversationPreview {
  id: string;
  otherUser: UserPreview;
  lastMessage: Message;
  unreadCount: number;
  lastMessageAt: string;
}

// User preview
interface UserPreview {
  id: string;
  username: string;
  profile: {
    displayName: string;
    avatarUrl?: string;
    isVerified: boolean;
  };
}
```

### Enums

```typescript
enum MessageType {
  TEXT = "text",
  IMAGE = "image",
  VIDEO = "video",
  FILE = "file",
  GIG_OFFER = "gig_offer",
}

enum MessageStatus {
  SENT = "sent",
  DELIVERED = "delivered",
  READ = "read",
}

enum WebSocketEvent {
  CONNECT = "connect",
  DISCONNECT = "disconnect",
  MESSAGE_SEND = "message:send",
  MESSAGE_RECEIVE = "message:receive",
  MESSAGE_DELIVERED = "message:delivered",
  MESSAGE_READ = "message:read",
  MESSAGE_BULK_READ = "message:bulk_read",
  TYPING_START = "typing:start",
  TYPING_STOP = "typing:stop",
  TYPING_INDICATOR = "typing:indicator",
  CONVERSATION_CREATED = "conversation:created",
  CONVERSATION_UPDATED = "conversation:updated",
  ERROR = "error",
}
```

---

## Error Codes

All errors follow this structure:

```typescript
interface MessageError {
  code: MessageErrorCode;
  message: string;
  details?: any;
}
```

### Error Code Reference

| Code                     | HTTP Status | Description                          |
| ------------------------ | ----------- | ------------------------------------ |
| `INVALID_RECIPIENT`      | 404         | Recipient user not found             |
| `CONVERSATION_NOT_FOUND` | 404         | Conversation doesn't exist           |
| `MESSAGE_NOT_FOUND`      | 404         | Message doesn't exist                |
| `UNAUTHORIZED`           | 401         | Invalid or missing JWT token         |
| `FORBIDDEN`              | 403         | User not participant in conversation |
| `BLOCKED_USER`           | 403         | Recipient has blocked sender         |
| `RATE_LIMIT_EXCEEDED`    | 429         | Too many messages per minute         |
| `FILE_TOO_LARGE`         | 400         | File exceeds 50MB limit              |
| `INVALID_FILE_TYPE`      | 400         | Unsupported file type                |
| `UPLOAD_FAILED`          | 500         | Media upload failed                  |
| `WEBSOCKET_ERROR`        | 500         | WebSocket connection error           |

### Example Error Responses

```json
// 404 Not Found
{
  "code": "CONVERSATION_NOT_FOUND",
  "message": "Conversation not found",
  "statusCode": 404
}

// 403 Forbidden
{
  "code": "BLOCKED_USER",
  "message": "You cannot message this user",
  "statusCode": 403
}

// 429 Rate Limit
{
  "code": "RATE_LIMIT_EXCEEDED",
  "message": "Too many messages. Please slow down.",
  "statusCode": 429,
  "details": {
    "limit": 60,
    "remaining": 0,
    "resetAt": "2025-01-01T12:01:00Z"
  }
}
```

---

## Rate Limits

### Message Sending

- **Limit:** 60 messages per minute per user
- **Scope:** Per user account
- **Reset:** Rolling 60-second window

### API Requests

- **Limit:** 1000 requests per hour per user
- **Scope:** All REST endpoints combined
- **Reset:** Top of each hour

### Media Uploads

- **Limit:** 20 uploads per hour per user
- **Max Size:** 50MB per file
- **Allowed Types:**
  - Images: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
  - Videos: `video/mp4`, `video/quicktime`, `video/webm`
  - Files: `application/pdf`, `.doc`, `.docx`, `.xls`, `.xlsx`

---

## Pagination

All list endpoints support cursor-based pagination:

### Query Parameters

```typescript
{
  page: number;    // 1-indexed page number
  limit: number;   // Results per page (1-100)
  before?: string; // Cursor (message ID)
  after?: string;  // Cursor (message ID)
}
```

### Response Format

```typescript
{
  data: T[];           // Array of results
  total: number;       // Total count
  page: number;        // Current page
  limit: number;       // Results per page
  totalPages: number;  // Total pages
  hasMore: boolean;    // More results available
}
```

### Example: Infinite Scroll

```typescript
const loadMore = async () => {
  const oldestMessage = messages[0];

  const response = await messagingAPI.getMessages({
    conversationId,
    before: oldestMessage.id,
    limit: 50,
  });

  setMessages((prev) => [...response.messages, ...prev]);
};
```

---

## Webhooks (Optional)

If you want to receive notifications outside the application:

```
POST /messaging/webhooks
```

**Request Body:**

```json
{
  "url": "https://yourapp.com/webhooks/messages",
  "events": ["message:receive", "message:read"],
  "secret": "your-webhook-secret"
}
```

**Webhook Payload:**

```json
{
  "event": "message:receive",
  "data": {
    "message": {
      /* MessageWithSender */
    },
    "conversation": {
      /* ConversationWithDetails */
    }
  },
  "timestamp": "2025-01-01T12:00:00Z",
  "signature": "sha256=..."
}
```

**Verify Signature:**

```typescript
import crypto from "crypto";

const verifyWebhook = (payload: string, signature: string, secret: string) => {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return `sha256=${expectedSignature}` === signature;
};
```

---

## SDK Usage Examples

### JavaScript/TypeScript

```typescript
import { messagingAPI } from "@/lib/messaging/api";

// Send message
const result = await messagingAPI.sendMessage({
  conversationId: "uuid",
  content: "Hello!",
  type: "text",
});

// Get conversations
const conversations = await messagingAPI.getConversations({
  page: 1,
  limit: 20,
  search: "john",
});

// Mark as read
await messagingAPI.markAsRead({
  conversationId: "uuid",
  messageIds: ["uuid1", "uuid2"],
});
```

### React Hook

```typescript
import { useMessaging } from "@/hooks/useMessaging";

function ChatComponent() {
  const { conversations, messages, isConnected, sendMessage, markAsRead } =
    useMessaging({
      autoConnect: true,
      onMessage: (msg) => console.log("New message:", msg),
    });

  // Use state and methods...
}
```

---

## API Changelog

### v1.0.0 (Current)

- Initial release
- REST API for messaging
- WebSocket real-time updates
- Typing indicators
- Read receipts
- Media uploads
- Message search

---

**API Reference Complete** 📚

For more details, see the [Implementation Guide](./IMPLEMENTATION_GUIDE.md) and [README](../README.md).
