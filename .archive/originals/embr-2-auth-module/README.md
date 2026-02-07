# Embr Authentication Module

Complete authentication system for Embr platform with JWT, Google OAuth, password management, and user profiles.

## ✅ Acceptance Criteria - ALL MET

| Criteria                                | Status     | Implementation                              |
| --------------------------------------- | ---------- | ------------------------------------------- |
| ☑ Users can sign up with email/password | ✓ Complete | Backend auth service + frontend signup page |
| ☑ Google OAuth completes full flow      | ✓ Complete | Google strategy + OAuth callback handling   |
| ☑ JWT tokens refresh automatically      | ✓ Complete | Axios interceptor with automatic refresh    |
| ☑ Profile updates persist to database   | ✓ Complete | Users service + profile edit page           |
| ☑ Unauthorized users redirect to login  | ✓ Complete | ProtectedRoute component + guards           |

## 📦 What's Included

### Backend (NestJS)

**Auth Module:**

- `auth.module.ts` - Module configuration with JWT and OAuth
- `auth.controller.ts` - 13 endpoints (signup, login, OAuth, password reset, etc.)
- `auth.service.ts` - Complete business logic with token management
- **Strategies:**
  - `jwt.strategy.ts` - JWT access token validation
  - `jwt-refresh.strategy.ts` - Refresh token validation
  - `google.strategy.ts` - Google OAuth 2.0 flow
- **Guards:**
  - `jwt-auth.guard.ts` - JWT authentication with public route support
  - `jwt-refresh.guard.ts` - Refresh token validation
- **Decorators:**
  - `public.decorator.ts` - Mark routes as public
  - `get-user.decorator.ts` - Extract user from request
- **DTOs (8 files):** Full validation for all auth operations
- **Entities (3 files):** RefreshToken, PasswordResetToken, EmailVerificationToken

**Users Module:**

- `users.controller.ts` - Profile and settings management
- `users.service.ts` - User operations and profile updates
- **Entities:** User, Profile (with TypeORM relations)
- **DTOs:** UpdateProfile, UpdateUserSettings

### Frontend (Next.js)

**Pages:**

- `pages/auth/login.tsx` - Login with email/password + Google OAuth
- `pages/auth/signup.tsx` - Signup with validation
- `pages/auth/forgot-password.tsx` - Request password reset
- `pages/auth/reset-password.tsx` - Set new password
- `pages/profile/edit.tsx` - Edit user profile

**State Management:**

- `contexts/AuthContext.tsx` - React Context for auth state
- Custom hooks with useAuth()

**API Layer:**

- `lib/api/client.ts` - Axios instance with auto token refresh
- `lib/api/auth.ts` - All auth API calls
- `lib/api/users.ts` - User profile operations

**Components:**

- `components/auth/ProtectedRoute.tsx` - Route protection HOC

**TypeScript Types:**

- Complete type definitions for User, Profile, Auth responses

### Database

**Migration:**

- `migrations/001_create_auth_tables.sql` - Complete schema
  - users table with indexes
  - profiles table with settings
  - wallets table
  - refresh_tokens table
  - password_reset_tokens table
  - email_verification_tokens table
  - Auto-update triggers

## 🚀 Setup Instructions

### 1. Backend Setup

```bash
# Navigate to your NestJS backend
cd apps/api

# Install dependencies (if not already installed)
npm install @nestjs/jwt @nestjs/passport passport passport-jwt passport-google-oauth20
npm install bcryptjs
npm install @types/passport-jwt @types/bcryptjs --save-dev

# Copy auth module files to your project
# From backend/ folder → apps/api/src/modules/

# Run database migration
psql -U your_user -d your_database -f migrations/001_create_auth_tables.sql

# Update environment variables (see .env.example below)
```

### 2. Frontend Setup

```bash
# Navigate to your Next.js frontend
cd apps/web

# Install dependencies
npm install axios

# Copy frontend files to your project
# From frontend/ folder → apps/web/src/

# Update environment variables
NEXT_PUBLIC_API_URL=http://localhost:3003/api
```

### 3. Environment Variables

**Backend (.env):**

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=embr_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_REFRESH_EXPIRATION=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3003/api/auth/google/callback

# Frontend URL
FRONTEND_URL=http://localhost:3004

# Email Service (for password reset/verification)
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-email-password
EMAIL_FROM=noreply@embr.app
```

**Frontend (.env.local):**

```env
NEXT_PUBLIC_API_URL=http://localhost:3003/api
```

### 4. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Add authorized redirect URIs:
   - http://localhost:3003/api/auth/google/callback (development)
   - https://your-api-domain.com/api/auth/google/callback (production)
6. Copy Client ID and Client Secret to your .env file

### 5. Integrate Auth Module

**apps/api/src/app.module.ts:**

```typescript
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "./modules/auth/guards/jwt-auth.guard";

@Module({
  imports: [
    // ... other imports
    AuthModule,
    UsersModule,
  ],
  providers: [
    // Apply JWT guard globally (use @Public() to exclude routes)
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
```

**apps/web/src/app/layout.tsx:**

```typescript
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

## 📁 File Structure

```
backend/
├── auth.module.ts
├── auth.controller.ts
├── auth.service.ts
├── strategies/
│   ├── jwt.strategy.ts
│   ├── jwt-refresh.strategy.ts
│   └── google.strategy.ts
├── guards/
│   ├── jwt-auth.guard.ts
│   └── jwt-refresh.guard.ts
├── decorators/
│   ├── public.decorator.ts
│   └── get-user.decorator.ts
├── dto/
│   ├── signup.dto.ts
│   ├── login.dto.ts
│   ├── refresh-token.dto.ts
│   ├── forgot-password.dto.ts
│   ├── reset-password.dto.ts
│   ├── change-password.dto.ts
│   ├── verify-email.dto.ts
│   └── resend-verification.dto.ts
├── entities/
│   ├── refresh-token.entity.ts
│   ├── password-reset-token.entity.ts
│   └── email-verification-token.entity.ts
└── users/
    ├── users.module.ts
    ├── users.controller.ts
    ├── users.service.ts
    ├── entities/
    │   ├── user.entity.ts
    │   └── profile.entity.ts
    └── dto/
        ├── update-profile.dto.ts
        └── update-user-settings.dto.ts

frontend/
├── contexts/
│   └── AuthContext.tsx
├── pages/
│   ├── auth/
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   ├── forgot-password.tsx
│   │   └── reset-password.tsx
│   └── profile/
│       └── edit.tsx
├── components/
│   └── auth/
│       └── ProtectedRoute.tsx
├── lib/
│   └── api/
│       ├── client.ts
│       ├── auth.ts
│       └── users.ts
└── types/
    └── auth.ts

migrations/
└── 001_create_auth_tables.sql
```

## 🔐 Security Features

- **Password Hashing:** bcrypt with salt rounds
- **JWT Tokens:** Short-lived access tokens (15min), long-lived refresh tokens (7 days)
- **Token Rotation:** Refresh tokens are rotated on each refresh
- **Rate Limiting:** Ready for rate limiting middleware
- **SQL Injection Protection:** TypeORM parameterized queries
- **XSS Protection:** Input validation with class-validator
- **CSRF Protection:** Ready for CSRF tokens

## 🎯 API Endpoints

### Authentication

- `POST /auth/signup` - Create new account
- `POST /auth/login` - Login with email/password
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - Google OAuth callback
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Revoke refresh token
- `POST /auth/logout-all` - Revoke all refresh tokens
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token
- `PATCH /auth/change-password` - Change password (authenticated)
- `POST /auth/verify-email` - Verify email with token
- `POST /auth/resend-verification` - Resend verification email
- `GET /auth/me` - Get current user
- `GET /auth/session` - Get active sessions

### Users

- `GET /users/profile` - Get own profile
- `PATCH /users/profile` - Update profile
- `PATCH /users/profile/avatar` - Update avatar
- `PATCH /users/settings` - Update settings
- `GET /users/:username` - Get user by username
- `DELETE /users/account` - Delete account

## 🧪 Testing

Test the authentication flow:

1. **Signup:** POST to `/auth/signup` with email, username, password
2. **Login:** POST to `/auth/login` with email, password
3. **Protected Route:** GET to `/users/profile` with Bearer token
4. **Token Refresh:** POST to `/auth/refresh` with refresh token
5. **Google OAuth:** Navigate to `/auth/google` in browser

## 📝 Next Steps

1. **Email Service:** Implement email sending for verification and password reset
2. **Rate Limiting:** Add rate limiting to auth endpoints
3. **Session Management:** Build UI for viewing/revoking active sessions
4. **2FA:** Add two-factor authentication option
5. **Social Links:** Expand profile with social media links
6. **Avatar Upload:** Integrate S3 for avatar uploads

## 🐛 Troubleshooting

**"Invalid credentials" on login:**

- Check password hash is being generated correctly
- Verify database connection

**Google OAuth not working:**

- Verify Google Client ID and Secret
- Check redirect URI matches exactly
- Ensure Google+ API is enabled

**Token refresh failing:**

- Check JWT_REFRESH_SECRET matches
- Verify refresh token is being sent in request body
- Check refresh token hasn't expired or been revoked

## 📚 Additional Resources

- [NestJS JWT Documentation](https://docs.nestjs.com/security/authentication)
- [Passport.js Strategies](http://www.passportjs.org/packages/)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)

---

**Built for Embr** - Your complete authentication foundation is ready! 🔥
