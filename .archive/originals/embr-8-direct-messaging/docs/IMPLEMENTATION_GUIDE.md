# Direct Messaging Implementation Guide

## Quick Start (5 minutes)

### 1. Backend Setup

```bash
# Navigate to your NestJS backend
cd apps/api

# Install WebSocket dependencies
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io

# Copy messaging module files
mkdir -p src/modules/messaging/{controllers,services,gateways,dto}
cp path/to/module-8/backend/* src/modules/messaging/

# Create messaging.module.ts
```

**Create `src/modules/messaging/messaging.module.ts`:**

```typescript
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MessagingController } from "./controllers/messaging.controller";
import { MessagingService } from "./services/messaging.service";
import { MessagingGateway } from "./gateways/messaging.gateway";
import { PrismaModule } from "../../prisma/prisma.module";
import { UploadModule } from "../upload/upload.module";

@Module({
  imports: [
    PrismaModule,
    UploadModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get("JWT_SECRET"),
        signOptions: { expiresIn: "15m" },
      }),
    }),
  ],
  controllers: [MessagingController],
  providers: [MessagingService, MessagingGateway],
  exports: [MessagingService, MessagingGateway],
})
export class MessagingModule {}
```

**Register in `src/app.module.ts`:**

```typescript
import { MessagingModule } from "./modules/messaging/messaging.module";

@Module({
  imports: [
    // ... existing modules
    MessagingModule,
  ],
})
export class AppModule {}
```

### 2. Frontend Setup

```bash
# Navigate to your Next.js frontend
cd apps/web

# Install client dependencies
npm install socket.io-client axios date-fns

# Copy components
mkdir -p src/components/messaging src/hooks
cp path/to/module-8/frontend/components/* src/components/messaging/
cp path/to/module-8/frontend/hooks/* src/hooks/

# Copy shared types and API client
mkdir -p src/lib/messaging
cp path/to/module-8/shared/* src/lib/messaging/
```

**Add environment variables to `.env.local`:**

```bash
NEXT_PUBLIC_API_URL=http://localhost:3003
NEXT_PUBLIC_WS_URL=http://localhost:3003
```

### 3. Create Messages Page

**Create `app/messages/page.tsx`:**

```tsx
"use client";

import { DMInbox } from "@/components/messaging/DMInbox";

export default function MessagesPage() {
  return (
    <div className="h-screen">
      <DMInbox
        onConversationSelect={(conversationId) => {
          console.log("Selected conversation:", conversationId);
        }}
      />
    </div>
  );
}
```

### 4. Test It Out

```bash
# Start backend
cd apps/api && npm run start:dev

# Start frontend
cd apps/web && npm run dev

# Visit http://localhost:3004/messages
```

---

## Architecture Deep Dive

### WebSocket Connection Flow

```
1. User loads page
   ↓
2. useMessaging hook initializes
   ↓
3. Socket.io connects with JWT token
   ↓
4. Server validates JWT
   ↓
5. User joins personal room: "user:{userId}"
   ↓
6. Fetch initial conversations & unread count
   ↓
7. Listen for real-time events
```

### Message Delivery Flow

```
1. User types message & clicks send
   ↓
2. Frontend emits "message:send" event
   ↓
3. Backend MessagingGateway receives event
   ↓
4. MessagingService creates message in database
   ↓
5. Backend emits "message:send" to sender's room
   ↓
6. Backend emits "message:receive" to recipient's room
   ↓
7. Both clients update their local state
   ↓
8. If recipient is online, auto-mark as delivered
```

### Read Receipt Flow

```
1. User opens conversation
   ↓
2. Frontend calls markAsRead()
   ↓
3. Emits "message:read" via WebSocket
   ↓
4. Backend updates message status in DB
   ↓
5. Backend emits read event to both participants
   ↓
6. UI updates read status (✓✓)
```

---

## Best Practices

### 1. Error Handling

**Always wrap async operations:**

```typescript
try {
  await sendMessage({ content: "Hello!" });
} catch (error) {
  if (error.code === "RATE_LIMIT_EXCEEDED") {
    showToast("Slow down! You're sending too many messages.");
  } else if (error.code === "BLOCKED_USER") {
    showToast("You cannot message this user.");
  } else {
    showToast("Failed to send message. Please try again.");
  }
}
```

### 2. Optimistic Updates

**Update UI immediately for better UX:**

```typescript
const sendMessage = async (content: string) => {
  // 1. Create optimistic message
  const tempId = `temp-${Date.now()}`;
  const optimisticMessage = {
    id: tempId,
    content,
    status: "sending",
    createdAt: new Date().toISOString(),
  };

  // 2. Add to local state immediately
  setMessages((prev) => [...prev, optimisticMessage]);

  try {
    // 3. Send to server
    const result = await messagingAPI.sendMessage({ content });

    // 4. Replace temp message with real one
    setMessages((prev) =>
      prev.map((msg) => (msg.id === tempId ? result.message : msg)),
    );
  } catch (error) {
    // 5. Remove optimistic message on error
    setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
    throw error;
  }
};
```

### 3. Connection Recovery

**Handle reconnection gracefully:**

```typescript
const { isConnected, connect, fetchConversations } = useMessaging();

useEffect(() => {
  if (!isConnected) {
    // Show "Connecting..." indicator
    showConnectionStatus("Reconnecting...");
  } else {
    // Refetch data on reconnect
    fetchConversations();
    showConnectionStatus("Connected");
  }
}, [isConnected]);
```

### 4. Typing Indicator Optimization

**Debounce typing events:**

```typescript
let typingTimeout: NodeJS.Timeout;

const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;

  // Clear existing timeout
  clearTimeout(typingTimeout);

  // Send typing start
  if (value.length > 0) {
    sendTypingIndicator(conversationId, true);
  }

  // Auto-stop after 1 second of no typing
  typingTimeout = setTimeout(() => {
    sendTypingIndicator(conversationId, false);
  }, 1000);
};
```

### 5. Memory Management

**Clean up on unmount:**

```typescript
useEffect(() => {
  return () => {
    // Disconnect socket
    disconnect();

    // Clear intervals/timeouts
    clearInterval(intervalId);

    // Revoke object URLs
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
    }
  };
}, []);
```

---

## Performance Tips

### 1. Pagination Strategy

```typescript
// Cursor-based pagination for infinite scroll
const loadMoreMessages = async () => {
  const oldestMessage = messages[0];

  await fetchMessages({
    conversationId,
    before: oldestMessage.id, // Load messages before this one
    limit: 50,
  });
};
```

### 2. Virtual Scrolling (Optional)

For very long message threads:

```bash
npm install react-window
```

```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={messages.length}
  itemSize={80}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <Message message={messages[index]} />
    </div>
  )}
</FixedSizeList>
```

### 3. Image Optimization

```typescript
// Lazy load images
<img
  src={message.mediaUrl}
  loading="lazy"
  alt="Shared image"
/>

// Or use Next.js Image
import Image from 'next/image';

<Image
  src={message.mediaUrl}
  width={400}
  height={300}
  alt="Shared image"
  loading="lazy"
/>
```

---

## Security Checklist

- [ ] **JWT Validation**: All WebSocket connections verify JWT
- [ ] **Participant Checks**: Users can only access their conversations
- [ ] **File Validation**: Check file type and size on upload
- [ ] **Rate Limiting**: Implement per-user message limits
- [ ] **XSS Protection**: Sanitize user content (use DOMPurify)
- [ ] **CSRF Protection**: Use CSRF tokens for state-changing operations
- [ ] **CORS Configuration**: Whitelist allowed origins

**Example: Content Sanitization**

```typescript
import DOMPurify from "dompurify";

const sanitizeContent = (content: string) => {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a"],
    ALLOWED_ATTR: ["href"],
  });
};
```

---

## Testing Strategy

### Unit Tests

**Backend Service Test:**

```typescript
describe("MessagingService", () => {
  it("should create a conversation", async () => {
    const result = await service.getOrCreateConversation(userId, {
      participantId: otherUserId,
    });

    expect(result.conversation).toBeDefined();
    expect(result.conversation.participant1Id).toBe(userId);
  });

  it("should prevent messaging blocked users", async () => {
    await expect(
      service.sendMessage(userId, {
        recipientId: blockedUserId,
        content: "Hello",
        type: MessageType.TEXT,
      }),
    ).rejects.toThrow("BLOCKED_USER");
  });
});
```

**Frontend Hook Test:**

```typescript
import { renderHook, act } from "@testing-library/react-hooks";
import { useMessaging } from "./useMessaging";

describe("useMessaging", () => {
  it("should connect on mount", async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useMessaging({ autoConnect: true }),
    );

    await waitForNextUpdate();
    expect(result.current.isConnected).toBe(true);
  });
});
```

### Integration Tests

**WebSocket Test:**

```typescript
import { io } from "socket.io-client";

describe("MessagingGateway Integration", () => {
  let socket: Socket;

  beforeAll(() => {
    socket = io("http://localhost:3003/messaging", {
      auth: { token: TEST_JWT },
    });
  });

  it("should receive messages", (done) => {
    socket.on("message:receive", (data) => {
      expect(data.message.content).toBe("Test message");
      done();
    });

    socket.emit("message:send", {
      recipientId: TEST_USER_ID,
      content: "Test message",
      type: "text",
    });
  });
});
```

---

## Monitoring & Debugging

### Enable Debug Mode

**Backend:**

```bash
DEBUG=socket.io* npm run start:dev
```

**Frontend:**

```typescript
const socket = io(url, {
  transports: ["websocket", "polling"],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  // Enable debug logs
  debug: process.env.NODE_ENV === "development",
});
```

### Key Metrics to Track

1. **Message Delivery Time**: Time from send to receipt
2. **Connection Success Rate**: % of successful connections
3. **Reconnection Frequency**: How often users reconnect
4. **Message Search Performance**: Query execution time
5. **Upload Success Rate**: % of successful media uploads

### Logging

```typescript
// Backend
this.logger.log(`Message sent: ${messageId} from ${userId} to ${recipientId}`);
this.logger.error(`Failed to send message: ${error.message}`, error.stack);

// Frontend
console.log("[Messaging] Connected to WebSocket");
console.error("[Messaging] Failed to send message:", error);
```

---

## Common Issues & Solutions

### Issue 1: "WebSocket connection failed"

**Symptoms:** Red dot showing "Disconnected"

**Solutions:**

1. Check CORS configuration in backend
2. Verify JWT token is present: `localStorage.getItem('accessToken')`
3. Check network tab for connection errors
4. Ensure WebSocket port is not blocked by firewall

### Issue 2: "Messages not delivering"

**Symptoms:** Message stuck in "sending" state

**Solutions:**

1. Check database connection: `npx prisma studio`
2. Verify conversation exists and user has access
3. Check backend logs for errors
4. Ensure recipient user exists

### Issue 3: "Typing indicators not working"

**Symptoms:** No typing animation appears

**Solutions:**

1. Verify WebSocket connection is active
2. Check conversation ID matches
3. Ensure typing timeout is clearing properly
4. Check browser console for errors

### Issue 4: "High memory usage"

**Symptoms:** App becomes slow over time

**Solutions:**

1. Implement message pagination
2. Clear old messages from state
3. Revoke object URLs when done
4. Use virtual scrolling for long lists

---

## Deployment Checklist

### Backend

- [ ] Set production environment variables
- [ ] Configure Redis for Socket.io (multi-server)
- [ ] Enable WebSocket compression
- [ ] Set up load balancer with sticky sessions
- [ ] Configure database connection pooling
- [ ] Enable rate limiting
- [ ] Set up logging/monitoring

**Redis Adapter for Scaling:**

```typescript
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();

await Promise.all([pubClient.connect(), subClient.connect()]);

io.adapter(createAdapter(pubClient, subClient));
```

### Frontend

- [ ] Set production API/WebSocket URLs
- [ ] Enable code splitting for messaging components
- [ ] Optimize bundle size
- [ ] Configure CDN for media files
- [ ] Enable service worker for offline support
- [ ] Set up error tracking (Sentry)

---

## Next-Level Features

Once basic messaging is working, consider adding:

### 1. Message Reactions

```typescript
interface MessageReaction {
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: Date;
}
```

### 2. Voice Messages

```typescript
// Use MediaRecorder API
const recorder = new MediaRecorder(stream);
recorder.ondataavailable = (e) => {
  const audioBlob = e.data;
  uploadMedia(audioBlob, conversationId, MessageType.AUDIO);
};
```

### 3. Message Forwarding

```typescript
const forwardMessage = async (
  messageId: string,
  toConversationIds: string[],
) => {
  const original = await getMessage(messageId);

  await Promise.all(
    toConversationIds.map((convId) =>
      sendMessage({
        conversationId: convId,
        content: original.content,
        type: original.type,
        metadata: { forwardedFrom: messageId },
      }),
    ),
  );
};
```

### 4. Group Chats

```prisma
model GroupConversation {
  id          String   @id @default(uuid())
  name        String
  avatarUrl   String?
  createdById String
  createdAt   DateTime @default(now())

  members     GroupMember[]
  messages    GroupMessage[]
}
```

---

## Support & Resources

- **Socket.io Docs**: https://socket.io/docs/
- **NestJS WebSockets**: https://docs.nestjs.com/websockets/gateways
- **React Hooks**: https://react.dev/reference/react
- **Prisma Docs**: https://www.prisma.io/docs

For project-specific help, search past conversations or create a new chat!

---

**Implementation Guide Complete** ✨

You now have everything you need to build a production-ready direct messaging system!
