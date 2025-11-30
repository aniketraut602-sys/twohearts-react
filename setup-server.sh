#!/bin/bash

# TwoHearts Server Setup Script
# Installs all prerequisites on Ubuntu/Debian server

set -e

echo "🔧 Setting up server for TwoHearts..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Update system
print_warning "Updating system packages..."
sudo apt update
sudo apt upgrade -y
print_success "System updated"

# Install Node.js 18.x
print_warning "Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
print_success "Node.js installed: $(node --version)"
print_success "npm installed: $(npm --version)"

# Install PM2
print_warning "Installing PM2..."
sudo npm install -g pm2
print_success "PM2 installed: $(pm2 --version)"

# Install Nginx
print_warning "Installing Nginx..."
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
print_success "Nginx installed and started"

# Install Git (if not already installed)
if ! command -v git &> /dev/null; then
    print_warning "Installing Git..."
    sudo apt install -y git
    print_success "Git installed"
fi

# Create app directory
print_warning "Creating application directory..."
sudo mkdir -p /var/www/twohearts
sudo chown -R $USER:$USER /var/www/twohearts
print_success "App directory created: /var/www/twohearts"

# Create backup directory
sudo mkdir -p /var/backups/twohearts
sudo chown -R $USER:$USER /var/backups/twohearts
print_success "Backup directory created"

# Configure firewall
print_warning "Configuring firewall..."
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3000/tcp  # Node.js app
print_success "Firewall configured"

# Setup PM2 startup
print_warning "Configuring PM2 startup..."
pm2 startup | tail -n 1 | sudo bash
print_success "PM2 startup configured"

echo ""
print_success "Server setup complete! 🎉"
echo ""
echo "Next steps:"
echo "1. Upload your application files to /var/www/twohearts"
echo "2. Run the deployment script"
echo ""
echo "Server Information:"
echo "- Node.js: $(node --version)"
echo "- npm: $(npm --version)"
echo "- PM2: $(pm2 --version)"
echo "- Nginx: $(nginx -v 2>&1)"
echo "- App Directory: /var/www/twohearts"
