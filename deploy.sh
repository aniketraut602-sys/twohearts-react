#!/bin/bash

# TwoHearts Deployment Script for SSH Server
# This script automates the deployment process

set -e  # Exit on error

echo "🚀 Starting TwoHearts deployment..."

# Configuration
APP_NAME="twohearts"
APP_DIR="/var/www/$APP_NAME"
BACKUP_DIR="/var/backups/$APP_NAME"
NODE_ENV="production"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if running on server
if [ ! -d "$APP_DIR" ]; then
    print_warning "App directory doesn't exist. Creating..."
    sudo mkdir -p "$APP_DIR"
    sudo chown -R $USER:$USER "$APP_DIR"
fi

# Backup existing deployment
if [ -d "$APP_DIR/api" ]; then
    print_warning "Backing up existing deployment..."
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    sudo mkdir -p "$BACKUP_DIR"
    sudo cp -r "$APP_DIR" "$BACKUP_DIR/backup_$TIMESTAMP"
    print_success "Backup created at $BACKUP_DIR/backup_$TIMESTAMP"
fi

# Navigate to app directory
cd "$APP_DIR"

# Pull latest code (if using git)
if [ -d ".git" ]; then
    print_warning "Pulling latest code from git..."
    git pull origin main
    print_success "Code updated"
else
    print_warning "Not a git repository. Please upload files manually."
fi

# Install dependencies
print_warning "Installing dependencies..."
npm install --production
cd api
npm install --production
cd ..
print_success "Dependencies installed"

# Build frontend
print_warning "Building frontend..."
npm run build
print_success "Frontend built"

# Run database migrations
print_warning "Running database migrations..."
cd api
node -e "const { runMigrations } = require('./db/migrations'); const { initDb } = require('./db/db'); initDb(); runMigrations();"
cd ..
print_success "Migrations completed"

# Restart application with PM2
print_warning "Restarting application..."
if pm2 list | grep -q "$APP_NAME"; then
    pm2 restart "$APP_NAME"
    print_success "Application restarted"
else
    pm2 start api/index.js --name "$APP_NAME" --env production
    pm2 save
    print_success "Application started"
fi

# Show status
print_success "Deployment completed successfully!"
echo ""
echo "Application Status:"
pm2 status "$APP_NAME"
echo ""
echo "Application URL: http://$(hostname -I | awk '{print $1}'):3000"
echo "Logs: pm2 logs $APP_NAME"
echo ""
print_success "Deployment finished! 🎉"
