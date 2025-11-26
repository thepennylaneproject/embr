# Embr Infrastructure - Quick Start Guide

Get your Embr development environment running in under 5 minutes!

## Prerequisites

- Node.js 20.x or higher
- Docker Desktop installed and running
- Git

## Step 1: Initial Setup (2 minutes)

```bash
# Navigate to project root (where this infrastructure folder should be placed)
cd /path/to/embr

# Copy environment file
cp embr-infrastructure/env/.env.development.template .env

# Edit .env file and add your credentials
# At minimum, the database URL should work with default Docker setup
nano .env
```

## Step 2: Start Infrastructure (1 minute)

```bash
# Start Docker services
cd embr-infrastructure
npm run docker:up

# Wait for services to be healthy (about 30 seconds)
# You should see:
# ✓ embr_postgres is healthy
# ✓ embr_redis is healthy
```

## Step 3: Initialize Database (1 minute)

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate:dev

# Seed with test data
npm run db:seed
```

## Step 4: Verify Setup (30 seconds)

Visit these URLs to confirm everything is working:

- **PostgreSQL (Adminer):** http://localhost:8080
  - System: PostgreSQL
  - Server: postgres
  - Username: embr
  - Password: embr_dev_password
  - Database: embr

- **Redis Commander:** http://localhost:8081
  
- **MailHog:** http://localhost:8025

## Step 5: Start Development

```bash
# In one terminal, start the API
cd apps/api
npm run dev

# In another terminal, start the web app
cd apps/web
npm run dev

# In a third terminal, start the mobile app
cd apps/mobile
npm run start
```

## Test Accounts

After seeding, use these credentials:

- **Admin:** admin@embr.app / test1234
- **Creator:** creator@embr.app / test1234
- **User:** user@embr.app / test1234

## Common Commands

```bash
# View Docker logs
npm run docker:logs

# Restart Docker services
npm run docker:restart

# Stop all services
npm run docker:down

# Open Prisma Studio (database GUI)
npm run db:studio

# Create a new migration
npm run db:migrate:dev -- --name your_migration_name

# Reset database (destructive!)
npm run db:migrate:reset

# Backup database
npm run backup
```

## Troubleshooting

### Port Already in Use

If you see "port already allocated" errors:

```bash
# Check what's using the port
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
lsof -i :8080  # Adminer

# Stop the conflicting service or change ports in docker-compose.yml
```

### Cannot Connect to Database

```bash
# Check if Docker is running
docker ps

# Check PostgreSQL logs
docker logs embr_postgres

# Restart PostgreSQL
docker restart embr_postgres
```

### Migration Errors

```bash
# Check migration status
npm run db:migrate:status

# If stuck, reset and re-run
npm run db:migrate:reset
npm run db:seed
```

### Prisma Client Errors

```bash
# Regenerate Prisma client
npm run db:generate

# If that doesn't work, clean and reinstall
rm -rf node_modules
npm install
npm run db:generate
```

## Next Steps

1. **Configure External Services:**
   - Set up Google OAuth credentials
   - Create AWS S3 bucket
   - Set up Mux account
   - Configure Stripe account
   - Get Relevnt API key

2. **Set Up CI/CD:**
   - Add GitHub secrets
   - Configure Railway projects
   - Set up Vercel projects
   - Configure EAS for mobile

3. **Development Workflow:**
   - Create feature branches
   - Run tests before committing
   - Use conventional commits
   - Request code reviews

## Production Deployment

See README.md for detailed production deployment instructions.

## Need Help?

- Check the main README.md for comprehensive documentation
- Review the troubleshooting section
- Check Docker logs: `npm run docker:logs`
- Open Prisma Studio to inspect database: `npm run db:studio`

## Success Checklist

- [ ] Docker services running
- [ ] Database migrations applied
- [ ] Test data seeded
- [ ] Can access Adminer at localhost:8080
- [ ] API starts without errors
- [ ] Web app loads in browser
- [ ] Mobile app connects to API

Happy building! 🔥
