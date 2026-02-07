# Module 7: Social Graph & Discovery

Complete implementation of social connections and content discovery features for Embr, including follow/unfollow system, user search, personalized recommendations, and trending creators.

## ✨ Features

### Follow System
- ✅ Follow/unfollow users with optimistic updates
- ✅ Real-time follower/following counts
- ✅ Batch follow status checking
- ✅ Mutual connections discovery
- ✅ Network-based suggestions

### User Discovery
- ✅ Advanced user search with filters (location, skills, availability)
- ✅ Multi-factor relevance ranking algorithm
- ✅ Personalized recommendations based on:
  - Similar interests
  - Mutual connections
  - Network graph analysis
- ✅ Trending creators by timeframe (day/week/month)
- ✅ Category-based browsing

### Social Graph
- ✅ Mutual connection queries
- ✅ Follow relationship management
- ✅ Network traversal for suggestions
- ✅ Social proof indicators

## 🚀 Quick Start

### 1. Backend Setup

```bash
# Add to your NestJS app module
import { FollowsController } from './controllers/follows.controller';
import { UserDiscoveryController } from './controllers/user-discovery.controller';
import { FollowsService } from './services/follows.service';
import { UserDiscoveryService } from './services/user-discovery.service';

@Module({
  controllers: [FollowsController, UserDiscoveryController],
  providers: [FollowsService, UserDiscoveryService, PrismaService],
})
export class SocialModule {}
```

### 2. Frontend Integration

```tsx
import { FollowButton } from '@embr/components/FollowButton';
import { UserSearchBar } from '@embr/components/UserSearchBar';
import { SuggestedUsers } from '@embr/components/SuggestedUsers';
import { TrendingCreators } from '@embr/components/TrendingCreators';

// In your component
export default function HomePage() {
  return (
    <div>
      <UserSearchBar onUserSelect={(user) => navigate(`/profile/${user.username}`)} />
      <SuggestedUsers context="general" limit={5} />
      <TrendingCreators timeframe="week" />
    </div>
  );
}
```

### 3. Add Follow Button to Profiles

```tsx
import { FollowButton } from '@embr/components/FollowButton';

<FollowButton 
  userId={profile.userId}
  initialIsFollowing={profile.isFollowing}
  size="lg"
  variant="primary"
/>
```

## 📁 File Structure

```
module-7-social-graph/
├── backend/
│   ├── controllers/
│   │   ├── follows.controller.ts          # Follow/unfollow endpoints
│   │   └── user-discovery.controller.ts   # Search & recommendations
│   ├── services/
│   │   ├── follows.service.ts            # Follow business logic
│   │   └── user-discovery.service.ts     # Discovery algorithms
│   └── dto/
│       ├── follow.dto.ts                 # Follow DTOs
│       └── discovery.dto.ts              # Discovery DTOs
├── frontend/
│   ├── components/
│   │   ├── FollowButton.tsx             # Follow/unfollow button
│   │   ├── UserSearchBar.tsx            # Search with filters
│   │   ├── SuggestedUsers.tsx           # Recommendations widget
│   │   ├── TrendingCreators.tsx         # Trending list
│   │   └── MutualConnections.tsx        # Mutual connections display
│   ├── hooks/
│   │   ├── useFollow.ts                 # Follow operations hook
│   │   └── useUserSearch.ts             # Search & discovery hooks
│   └── pages/
│       └── DiscoveryPage.tsx            # Full discovery page
├── shared/
│   ├── types/
│   │   └── social.types.ts              # TypeScript types
│   └── api/
│       └── social.api.ts                # API client
└── docs/
    ├── README.md                         # This file
    ├── IMPLEMENTATION_GUIDE.md           # Detailed setup
    ├── ACCEPTANCE_CRITERIA.md            # Testing checklist
    └── MODULE_SUMMARY.md                 # Overview & metrics
```

## 🔑 Key Endpoints

### Follow System
- `POST /follows` - Follow a user
- `DELETE /follows/:userId` - Unfollow a user
- `GET /follows/followers/:userId` - Get followers list
- `GET /follows/following/:userId` - Get following list
- `GET /follows/check` - Check follow status
- `POST /follows/batch-check` - Batch check follow status
- `GET /follows/mutual` - Get mutual connections
- `GET /follows/counts/:userId` - Get follower counts
- `GET /follows/suggestions` - Get network suggestions

### Discovery
- `GET /discovery/search` - Search users with filters
- `GET /discovery/recommended` - Get personalized recommendations
- `GET /discovery/trending` - Get trending creators
- `GET /discovery/similar` - Get similar users

## 🎨 Design System Integration

All components use Embr's established design system:

**Colors:**
- Primary: `#E8998D` (muted coral)
- Secondary: `#C9ADA7` (warm taupe)
- Accent: `#9A8C98` (dusty purple)
- Background: `#F4F1F1` (light gray)

**Components:**
- Rounded corners: `rounded-full`, `rounded-2xl`, `rounded-xl`
- Smooth transitions: `transition-all duration-200`
- Hover states with color shifts
- Loading states with spinners
- Empty states with friendly messaging

## 📊 Ranking Algorithm

The user discovery system uses multi-factor scoring:

1. **Follower Count** (normalized, log scale) - 10-20 points
2. **Engagement Rate** (recent posts) - 0-15 points
3. **Profile Completeness** - 0-55 points
   - Avatar: 20 points
   - Full name: 10 points
   - Bio: 10 points
   - Location: 5 points
   - Skills: 10 points
4. **Verification Status** - 20 points
5. **Mutual Connections** - 5 points each
6. **Content Quality** - 0-15 points

## 🔒 Security

- JWT authentication on all protected endpoints
- User authorization checks (can't follow yourself)
- Input validation with class-validator
- SQL injection prevention
- Rate limiting ready (configure in gateway)

## 📈 Performance

- Optimistic UI updates for instant feedback
- Batch operations for follow status checks
- Efficient SQL queries with proper indexes
- Pagination on all list endpoints (20 items default)
- Debounced search (300ms)

## 🧪 Testing

See [ACCEPTANCE_CRITERIA.md](./ACCEPTANCE_CRITERIA.md) for complete testing checklist.

## 📚 Additional Resources

- [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - Detailed setup instructions
- [MODULE_SUMMARY.md](./MODULE_SUMMARY.md) - Architecture overview & metrics
- [Embr Design System](../design-system.md) - Visual guidelines

## 🆘 Troubleshooting

**Follow button not updating?**
- Check JWT token in localStorage
- Verify API endpoint URLs
- Check browser console for errors

**Search not returning results?**
- Verify database has users with matching criteria
- Check search query syntax
- Ensure proper text search indexes

**Recommendations empty?**
- User needs to follow others first
- Check if user has skills/interests set
- Verify follow relationships exist in database

## 📝 License

Part of Embr platform - All rights reserved
