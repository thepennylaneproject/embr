#!/bin/bash

# Embr Database Migration Helper Script
# This script provides convenient commands for managing database migrations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

show_usage() {
    echo "Embr Database Migration Helper"
    echo ""
    echo "Usage: ./migrate.sh [command]"
    echo ""
    echo "Commands:"
    echo "  init                Initialize migrations"
    echo "  create <name>       Create a new migration"
    echo "  dev                 Create and apply migration in development"
    echo "  deploy              Apply migrations in production"
    echo "  status              Check migration status"
    echo "  reset               Reset database (DESTRUCTIVE!)"
    echo "  seed                Seed database with test data"
    echo "  studio              Open Prisma Studio"
    echo "  generate            Generate Prisma Client"
    echo "  validate            Validate schema"
    echo "  format              Format schema file"
    echo "  backup              Create database backup"
    echo "  restore <file>      Restore from backup"
    echo ""
}

check_env() {
    if [ ! -f .env ]; then
        print_error "No .env file found!"
        print_info "Copy env/.env.development.template to .env and configure it"
        exit 1
    fi
    
    if ! grep -q "DATABASE_URL" .env; then
        print_error "DATABASE_URL not found in .env file!"
        exit 1
    fi
    
    print_success "Environment configuration found"
}

check_postgres() {
    print_info "Checking PostgreSQL connection..."
    
    if npx prisma db execute --stdin <<< "SELECT 1;" >/dev/null 2>&1; then
        print_success "PostgreSQL is accessible"
    else
        print_error "Cannot connect to PostgreSQL"
        print_info "Make sure Docker containers are running: docker-compose up -d"
        exit 1
    fi
}

init_migrations() {
    print_info "Initializing migrations..."
    check_env
    
    cd prisma
    npx prisma migrate dev --name init
    cd ..
    
    print_success "Migrations initialized"
}

create_migration() {
    if [ -z "$1" ]; then
        print_error "Migration name is required"
        echo "Usage: ./migrate.sh create <migration_name>"
        exit 1
    fi
    
    print_info "Creating migration: $1"
    check_env
    check_postgres
    
    cd prisma
    npx prisma migrate dev --name "$1"
    cd ..
    
    print_success "Migration created: $1"
}

migrate_dev() {
    print_info "Running development migrations..."
    check_env
    check_postgres
    
    cd prisma
    npx prisma migrate dev
    cd ..
    
    print_success "Development migrations completed"
}

migrate_deploy() {
    print_warning "⚠️  This will run migrations in production!"
    read -p "Are you sure? (yes/no) " -n 3 -r
    echo
    
    if [[ ! $REPLY =~ ^yes$ ]]; then
        print_info "Migration cancelled"
        exit 0
    fi
    
    print_info "Deploying migrations to production..."
    check_env
    
    cd prisma
    npx prisma migrate deploy
    cd ..
    
    print_success "Production migrations deployed"
}

migration_status() {
    print_info "Checking migration status..."
    check_env
    
    cd prisma
    npx prisma migrate status
    cd ..
}

reset_database() {
    print_warning "⚠️  WARNING: This will DELETE ALL DATA!"
    read -p "Are you absolutely sure? (type 'DELETE' to confirm) " -r
    echo
    
    if [[ ! $REPLY == "DELETE" ]]; then
        print_info "Reset cancelled"
        exit 0
    fi
    
    print_info "Resetting database..."
    check_env
    
    cd prisma
    npx prisma migrate reset --force
    cd ..
    
    print_success "Database reset completed"
}

seed_database() {
    print_info "Seeding database..."
    check_env
    check_postgres
    
    npx ts-node scripts/seed.ts
    
    print_success "Database seeded successfully"
    print_info "Test accounts created:"
    echo "  Admin: admin@embr.app / test1234"
    echo "  Creator: creator@embr.app / test1234"
    echo "  User: user@embr.app / test1234"
}

open_studio() {
    print_info "Opening Prisma Studio..."
    check_env
    
    cd prisma
    npx prisma studio
    cd ..
}

generate_client() {
    print_info "Generating Prisma Client..."
    
    cd prisma
    npx prisma generate
    cd ..
    
    print_success "Prisma Client generated"
}

validate_schema() {
    print_info "Validating schema..."
    
    cd prisma
    npx prisma validate
    cd ..
    
    print_success "Schema is valid"
}

format_schema() {
    print_info "Formatting schema..."
    
    cd prisma
    npx prisma format
    cd ..
    
    print_success "Schema formatted"
}

backup_database() {
    print_info "Creating database backup..."
    check_env
    
    BACKUP_DIR="backups"
    mkdir -p $BACKUP_DIR
    
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/embr_backup_$TIMESTAMP.sql"
    
    # Extract database details from DATABASE_URL
    if grep -q "DATABASE_URL" .env; then
        print_info "Backing up database to $BACKUP_FILE..."
        
        # This is a simple example - adjust for your actual database setup
        docker exec embr_postgres pg_dump -U embr embr > "$BACKUP_FILE"
        
        print_success "Backup created: $BACKUP_FILE"
        
        # Compress backup
        gzip "$BACKUP_FILE"
        print_success "Backup compressed: $BACKUP_FILE.gz"
    else
        print_error "Could not determine database connection details"
        exit 1
    fi
}

restore_database() {
    if [ -z "$1" ]; then
        print_error "Backup file is required"
        echo "Usage: ./migrate.sh restore <backup_file>"
        exit 1
    fi
    
    if [ ! -f "$1" ]; then
        print_error "Backup file not found: $1"
        exit 1
    fi
    
    print_warning "⚠️  This will REPLACE all current data!"
    read -p "Are you sure? (yes/no) " -n 3 -r
    echo
    
    if [[ ! $REPLY =~ ^yes$ ]]; then
        print_info "Restore cancelled"
        exit 0
    fi
    
    print_info "Restoring database from $1..."
    
    # Decompress if gzipped
    if [[ "$1" == *.gz ]]; then
        gunzip -k "$1"
        RESTORE_FILE="${1%.gz}"
    else
        RESTORE_FILE="$1"
    fi
    
    docker exec -i embr_postgres psql -U embr embr < "$RESTORE_FILE"
    
    print_success "Database restored from backup"
}

# Main script
case "$1" in
    init)
        init_migrations
        ;;
    create)
        create_migration "$2"
        ;;
    dev)
        migrate_dev
        ;;
    deploy)
        migrate_deploy
        ;;
    status)
        migration_status
        ;;
    reset)
        reset_database
        ;;
    seed)
        seed_database
        ;;
    studio)
        open_studio
        ;;
    generate)
        generate_client
        ;;
    validate)
        validate_schema
        ;;
    format)
        format_schema
        ;;
    backup)
        backup_database
        ;;
    restore)
        restore_database "$2"
        ;;
    *)
        show_usage
        ;;
esac
