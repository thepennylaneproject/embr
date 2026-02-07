# Module 7: Social Graph & Discovery - File Structure

Complete file organization reference for the social connections and discovery module.

## 📁 Directory Structure

```
module-7-social-graph/
├── backend/                          # NestJS backend files
│   ├── controllers/                  # API endpoint controllers
│   │   ├── follows.controller.ts     # Follow/unfollow operations [77 lines]
│   │   └── user-discovery.controller.ts # Search & recommendations [50 lines]
│   │
│   ├── services/                     # Business logic services
│   │   ├── follows.service.ts        # Follow system logic [336 lines]
│   │   └── user-discovery.service.ts # Discovery algorithms [423 lines]
│   │
│   └── dto/                          # Data Transfer Objects
│       ├── follow.dto.ts             # Follow operation DTOs [50 lines]
│       └── discovery.dto.ts          # Search & discovery DTOs [81 lines]
│
├── frontend/                         # React/Next.js frontend files
│   ├── components/                   # React components
│   │   ├── FollowButton.tsx          # Follow/unfollow button [133 lines]
│   │   ├── UserSearchBar.tsx         # Search with filters [207 lines]
│   │   ├── SuggestedUsers.tsx        # Recommendation widget [183 lines]
│   │   ├── TrendingCreators.tsx      # Trending list [256 lines]
│   │   ├── MutualConnections.tsx     # Mutual connections display [162 lines]
│   │   └── index.ts                  # Component exports [6 lines]
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── useFollow.ts              # Follow operations hook [161 lines]
│   │   └── useUserSearch.ts          # Search & discovery hooks [267 lines]
│   │
│   └── pages/                        # Page components
│       └── DiscoveryPage.tsx         # Full discovery page [249 lines]
│
├── shared/                           # Shared code (frontend + backend)
│   ├── types/                        # TypeScript type definitions
│   │   └── social.types.ts           # Social feature types [149 lines]
│   │
│   └── api/                          # API client functions
│       └── social.api.ts             # Social API client [101 lines]
│
└── docs/                             # Documentation
    ├── README.md                     # Quick start guide [300 lines]
    ├── IMPLEMENTATION_GUIDE.md       # Setup instructions [600 lines]
    ├── ACCEPTANCE_CRITERIA.md        # Testing checklist [750 lines]
    └── MODULE_SUMMARY.md             # Architecture & metrics [800 lines]
```

---

## 📄 File Details

### Backend Files

#### `backend/controllers/follows.controller.ts`
**Purpose:** REST API endpoints for follow operations
**Endpoints:**
- `POST /follows` - Follow a user
- `DELETE /follows/:userId` - Unfollow a user
- `GET /follows/followers/:userId` - Get followers
- `GET /follows/following/:userId` - Get following
- `GET /follows/check` - Check follow status
- `POST /follows/batch-check` - Batch check follows
- `GET /follows/mutual` - Get mutual connections
- `GET /follows/counts/:userId` - Get counts
- `GET /follows/suggestions` - Network suggestions

**Dependencies:**
- `FollowsService`
- `JwtAuthGuard`
- DTOs from `follow.dto.ts`

---

#### `backend/controllers/user-discovery.controller.ts`
**Purpose:** REST API endpoints for user discovery
**Endpoints:**
- `GET /discovery/search` - Search users
- `GET /discovery/recommended` - Get recommendations
- `GET /discovery/trending` - Trending creators
- `GET /discovery/similar` - Similar users

**Dependencies:**
- `UserDiscoveryService`
- `JwtAuthGuard` / `OptionalJwtAuthGuard`
- DTOs from `discovery.dto.ts`

---

#### `backend/services/follows.service.ts`
**Purpose:** Business logic for follow system
**Key Methods:**
- `followUser()` - Create follow relationship
- `unfollowUser()` - Remove follow relationship
- `getFollowers()` - Paginated followers list
- `getFollowing()` - Paginated following list
- `checkFollowStatus()` - Check if following
- `batchCheckFollowStatus()` - Batch check multiple
- `getMutualConnections()` - Find mutual connections
- `getFollowCounts()` - Get follower/following counts
- `getSuggestedFromNetwork()` - Network-based suggestions

**Database Operations:**
- Creates/deletes follow records
- Updates denormalized counts
- Queries social graph
- Creates notifications

---

#### `backend/services/user-discovery.service.ts`
**Purpose:** Discovery algorithms and user search
**Key Methods:**
- `searchUsers()` - Advanced user search with filters
- `calculateUserRelevanceScore()` - Multi-factor ranking
- `getRecommendedUsers()` - Personalized recommendations
- `getSimilarInterestUsers()` - Skill-based matching
- `getMutualConnectionUsers()` - Graph-based suggestions
- `getTrendingUsers()` - Engagement-based trending
- `getGeneralRecommendations()` - Mixed algorithm
- `getTrendingCreators()` - Trending by timeframe
- `getSimilarUsers()` - User similarity

**Algorithms:**
- Relevance scoring (multi-factor)
- Skill overlap matching
- Network graph traversal
- Engagement rate calculation
- Trending score computation

---

#### `backend/dto/follow.dto.ts`
**Purpose:** Validation for follow operations
**DTOs:**
- `FollowUserDto` - Follow request
- `GetFollowersDto` - Pagination params
- `GetFollowingDto` - Pagination params
- `CheckFollowDto` - Status check params
- `GetMutualConnectionsDto` - Mutual query params
- `BatchFollowCheckDto` - Batch check params

**Validation:**
- UUID format checking
- Pagination limits
- Required fields

---

#### `backend/dto/discovery.dto.ts`
**Purpose:** Validation for discovery operations
**DTOs:**
- `SearchUsersDto` - Search with filters
- `GetRecommendedUsersDto` - Recommendation params
- `GetTrendingCreatorsDto` - Trending params
- `SimilarUsersDto` - Similar user params

**Validation:**
- Search query formatting
- Filter combinations
- Sort options
- Pagination limits

---

### Frontend Files

#### `frontend/components/FollowButton.tsx`
**Purpose:** Interactive follow/unfollow button
**Components:**
- `FollowButton` - Main button with variants
- `FollowButtonCompact` - Smaller version for lists

**Features:**
- Optimistic UI updates
- Loading states
- Multiple sizes (sm/md/lg)
- Multiple variants (primary/outline)
- Callback support

**Props:**
- `userId` - Target user ID
- `initialIsFollowing` - Initial state
- `onFollowChange` - Change callback
- `size` - Button size
- `variant` - Visual style

---

#### `frontend/components/UserSearchBar.tsx`
**Purpose:** Search input with live results
**Features:**
- Debounced search (300ms)
- Real-time results dropdown
- Optional filters
- Keyboard navigation
- Click-outside to close

**Props:**
- `onUserSelect` - User selection callback
- `placeholder` - Input placeholder
- `showFilters` - Display filter chips
- `autoFocus` - Auto-focus input

---

#### `frontend/components/SuggestedUsers.tsx`
**Purpose:** Display user recommendations
**Components:**
- `SuggestedUsers` - Full widget
- `SuggestedUsersCompact` - Compact version

**Features:**
- Multiple recommendation contexts
- Reason display
- Mutual connection indicators
- Loading skeletons
- Follow buttons

**Props:**
- `context` - Recommendation type
- `limit` - Number of suggestions
- `onUserClick` - Click callback

---

#### `frontend/components/TrendingCreators.tsx`
**Purpose:** Trending creators list
**Components:**
- `TrendingCreators` - Full list
- `TrendingCreatorsCompact` - Compact version

**Features:**
- Timeframe toggle (day/week/month)
- Ranked display (1, 2, 3...)
- Engagement scores
- Verification badges
- Trending indicators

**Props:**
- `timeframe` - Time period
- `limit` - Number of creators
- `showTimeframeToggle` - Display toggle
- `onCreatorClick` - Click callback

---

#### `frontend/components/MutualConnections.tsx`
**Purpose:** Display mutual connections
**Components:**
- `MutualConnections` - Full widget
- `MutualConnectionsInline` - Inline version

**Features:**
- Avatar stacks (max 3 visible)
- "+X more" indicator
- Hover tooltips
- Clickable avatars

**Props:**
- `userId` - Target user ID
- `limit` - Number to display
- `onUserClick` - Click callback

---

#### `frontend/hooks/useFollow.ts`
**Purpose:** React hook for follow operations
**Hooks:**
- `useFollow()` - Main follow hook
- `useFollowers()` - Followers list hook
- `useFollowing()` - Following list hook
- `useMutualConnections()` - Mutual connections hook

**Returns:**
- State: `isFollowing`, `loading`, `error`
- Actions: `follow()`, `unfollow()`, `toggleFollow()`
- Data: `followers`, `following`, `mutualConnections`

---

#### `frontend/hooks/useUserSearch.ts`
**Purpose:** React hooks for discovery
**Hooks:**
- `useUserSearch()` - Search hook
- `useRecommendedUsers()` - Recommendations hook
- `useTrendingCreators()` - Trending hook
- `useSimilarUsers()` - Similar users hook
- `useBatchFollowCheck()` - Batch status check

**Features:**
- Pagination support
- Auto-loading options
- Error handling
- Caching logic

---

#### `frontend/pages/DiscoveryPage.tsx`
**Purpose:** Complete discovery experience
**Features:**
- Search bar integration
- Tab navigation (Trending/For You)
- Category sidebar
- Platform stats
- Infinite scroll
- Responsive layout

**Sections:**
- Hero with search
- Tabs (Trending/Suggested)
- Results grid
- Sidebar widgets

---

### Shared Files

#### `shared/types/social.types.ts`
**Purpose:** TypeScript type definitions
**Types:**
- `Follow` - Follow relationship
- `FollowUser` - User with follow data
- `FollowCounts` - Follower/following counts
- `FollowStatus` - Follow state
- `MutualConnections` - Mutual data
- `UserProfile` - Profile data
- `SearchUser` - Search result
- `RecommendedUser` - Recommendation
- `TrendingCreator` - Trending data
- Request/Response types

---

#### `shared/api/social.api.ts`
**Purpose:** API client functions
**Functions:**
- `followUser()` - Follow API call
- `unfollowUser()` - Unfollow API call
- `getFollowers()` - Get followers
- `getFollowing()` - Get following
- `checkFollowStatus()` - Check status
- `batchCheckFollowStatus()` - Batch check
- `getMutualConnections()` - Get mutuals
- `getFollowCounts()` - Get counts
- `getSuggestedFromNetwork()` - Network suggestions
- `searchUsers()` - Search API call
- `getRecommendedUsers()` - Get recommendations
- `getTrendingCreators()` - Get trending
- `getSimilarUsers()` - Get similar

---

### Documentation Files

#### `docs/README.md`
**Purpose:** Quick start guide
**Sections:**
- Features overview
- Quick start (3 steps)
- File structure
- Key endpoints
- Design system
- Ranking algorithm
- Security measures
- Performance notes
- Testing guide
- Troubleshooting

---

#### `docs/IMPLEMENTATION_GUIDE.md`
**Purpose:** Detailed setup instructions
**Sections:**
1. Database setup
2. Backend integration
3. Frontend integration
4. API configuration
5. Testing procedures
6. Deployment steps
- Common issues & solutions
- Performance optimization
- Next steps

---

#### `docs/ACCEPTANCE_CRITERIA.md`
**Purpose:** Complete testing checklist
**Sections:**
1. Follow relationships tests
2. Search performance tests
3. Personalization tests
4. Discovery quality tests
5. Mutual connections tests
- Performance benchmarks
- Security tests
- Edge cases
- Accessibility tests
- Mobile tests
- Browser compatibility

---

#### `docs/MODULE_SUMMARY.md`
**Purpose:** Architecture overview
**Sections:**
- Business value
- Architecture diagrams
- Data flow documentation
- Algorithm details
- API reference
- Database schema
- Performance characteristics
- Security measures
- Monitoring setup
- Future enhancements
- File statistics
- Completion checklist

---

## 📊 Statistics

### Code Files
- **Backend**: 6 files, ~1,017 lines
- **Frontend**: 9 files, ~1,618 lines
- **Shared**: 2 files, ~250 lines
- **Total Code**: 17 files, ~2,885 lines

### Documentation Files
- 4 comprehensive guides
- ~2,450 lines of documentation
- 100% coverage of all features

### Total Module Size
- **21 files total**
- **~5,335 lines** (code + docs)
- **Compressed**: ~65KB
- **Uncompressed**: ~220KB

---

## 🔄 Import Patterns

### Backend Imports
```typescript
// In app.module.ts
import { FollowsController } from './controllers/follows.controller';
import { UserDiscoveryController } from './controllers/user-discovery.controller';
import { FollowsService } from './services/follows.service';
import { UserDiscoveryService } from './services/user-discovery.service';
```

### Frontend Imports
```typescript
// Using component index
import { 
  FollowButton, 
  UserSearchBar, 
  SuggestedUsers,
  TrendingCreators 
} from '@/components';

// Using hooks
import { useFollow, useUserSearch } from '@/hooks';

// Using API client
import { socialApi } from '@embr/api-client';

// Using types
import type { SearchUser, RecommendedUser } from '@embr/types';
```

---

## 🎯 Integration Points

### Required Integrations
1. **Authentication**: JWT tokens for protected endpoints
2. **User Profiles**: Profile data for display
3. **Notifications**: Follow notifications
4. **Analytics**: Track engagement metrics

### Optional Integrations
5. **Content Feed**: Show followed users' posts
6. **Direct Messaging**: Message connections
7. **Gigs**: Recommend gigs from network
8. **Activity Feed**: Follow activity stream

---

## 📝 Notes

- All files use TypeScript strict mode
- Frontend components use Embr design system colors
- Backend services follow clean architecture
- All database queries use Prisma ORM
- API endpoints follow REST conventions
- Error handling is comprehensive
- Loading states are included
- Empty states are handled gracefully
- Mobile-responsive by default
- Accessibility considered throughout
