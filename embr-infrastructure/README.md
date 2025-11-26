# Embr Infrastructure Setup

Complete development infrastructure for Embr platform including database migrations, Docker environment, CI/CD pipelines, and seed data.

## 📁 Package Structure

```
embr-infrastructure/
├── migrations/           # Prisma database migrations
├── docker/              # Docker configurations
│   ├── docker-compose.yml
│   ├── docker-compose.prod.yml
│   └── postgres/        # PostgreSQL init scripts
├── env/                 # Environment templates
│   ├── .env.development.template
│   ├── .env.staging.template
│   └── .env.production.template
├── .github/
│   └── workflows/       # CI/CD pipelines
│       ├── api-deploy.yml
│       ├── web-deploy.yml
│       └── mobile-deploy.yml
├── scripts/
│   ├── seed.ts         # Database seeding
│   └── migrate.sh      # Migration helper
└── prisma/
    └── schema.prisma   # Database schema
```

## 🚀 Quick Start

### 1. Initial Setup

```bash
# Clone repository
git clone <your-repo-url>
cd embr

# Copy environment files
cp env/.env.development.template .env

# Install dependencies
npm install

# Start Docker services
docker-compose -f docker/docker-compose.yml up -d

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed
```

### 2. Development Workflow

```bash
# Start all services
npm run dev

# Access services:
# - API: http://localhost:3001
# - Web: http://localhost:3000
# - Mobile: http://localhost:8081
# - PostgreSQL: localhost:5432
# - Redis: localhost:6379
# - Adminer: http://localhost:8080
```

## 📊 Database Migrations

### Create New Migration

```bash
# Generate migration from schema changes
npx prisma migrate dev --name <migration_name>

# Example: Add user preferences
npx prisma migrate dev --name add_user_preferences
```

### Apply Migrations

```bash
# Development
npm run db:migrate:dev

# Production
npm run db:migrate:deploy
```

### Reset Database

```bash
# WARNING: Destroys all data
npm run db:reset
```

## 🐳 Docker Commands

### Development

```bash
# Start services
docker-compose -f docker/docker-compose.yml up -d

# Stop services
docker-compose -f docker/docker-compose.yml down

# View logs
docker-compose -f docker/docker-compose.yml logs -f

# Rebuild services
docker-compose -f docker/docker-compose.yml up -d --build
```

### Production

```bash
# Deploy to production environment
docker-compose -f docker/docker-compose.prod.yml up -d
```

## 🔐 Environment Variables

### Required Variables

**Database:**
- `DATABASE_URL` - postgres://db78d0de9da025ffe960919a7bbc3b1608f2e643a3a9820c0f412087aefb84e2:sk_DpU-H_QigK--uKKjozRjx@db.prisma.io:5432/postgres?sslmode=require
- `DIRECT_URL` - Direct PostgreSQL connection (for migrations)

**Authentication:**
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRES_IN` - Token expiration time
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth secret

**Storage:**
- `AWS_REGION` - AWS region
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_S3_BUCKET` - S3 bucket name

**Video Processing:**
- `MUX_TOKEN_ID` - Mux token ID
- `MUX_TOKEN_SECRET` - Mux token secret
- `MUX_WEBHOOK_SECRET` - Mux webhook signature secret

**Payments:**
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret

**External APIs:**
- `RELEVNT_API_KEY` - Relevnt API key for jobs
- `RELEVNT_API_URL` - Relevnt API endpoint

### Setting Up Environments

```bash
# Development
cp env/.env.development.template .env
# Edit .env with your values

# Staging (Vercel/Railway)
# Set environment variables in respective dashboards

# Production
# Use secure secret management (Railway Secrets, Vercel Env)
```

## 🚢 Deployment

### Automatic Deployments

- **Web (Vercel):** Deploys on push to `main` branch
- **API (Railway):** Deploys on push to `main` branch
- **Mobile:** Manual deployment via EAS

### Manual Deployment

**API to Railway:**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up
```

**Web to Vercel:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Mobile with EAS:**
```bash
# Install EAS CLI
npm i -g eas-cli

# Login
eas login

# Build and submit
eas build --platform all
eas submit --platform all
```

## 🌱 Seed Data

The seed script creates:
- 50 test users with profiles
- 200 posts (text and video)
- Social connections (follows, likes, comments)
- 30 gigs across categories
- 20 jobs from Relevnt
- Wallet transactions
- Sample messages and notifications

```bash
# Run seed
npm run db:seed

# Seed specific data
npm run db:seed:users
npm run db:seed:content
npm run db:seed:marketplace
```

### Test Accounts

After seeding, use these accounts:

**Creator Account:**
- Email: `creator@embr.app`
- Password: `test1234`

**Regular User:**
- Email: `user@embr.app`
- Password: `test1234`

**Admin:**
- Email: `admin@embr.app`
- Password: `test1234`

## 🔧 Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker ps | grep postgres

# View PostgreSQL logs
docker logs embr_postgres

# Connect to database directly
docker exec -it embr_postgres psql -U embr -d embr
```

### Migration Failures

```bash
# Reset migrations (DESTRUCTIVE)
npx prisma migrate reset

# Force push schema (development only)
npx prisma db push --force-reset
```

### Redis Connection Issues

```bash
# Check Redis is running
docker ps | grep redis

# Connect to Redis CLI
docker exec -it embr_redis redis-cli
```

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Railway Documentation](https://docs.railway.app)
- [Vercel Documentation](https://vercel.com/docs)

## 🆘 Support

For issues or questions:
1. Check existing GitHub issues
2. Review troubleshooting section
3. Create new issue with detailed description
