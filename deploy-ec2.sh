#!/bin/bash

# ==============================================================================
# Horizon Bank - AWS EC2 Automated Deployment Script (Ubuntu 22.04 LTS)
# ==============================================================================
# This script automates the installation of Node.js, PM2, Nginx, Certbot,
# and configures the environment variables and Nginx reverse proxy.
# Run this script from the root directory of your cloned Horizon-Bank repo:
# sudo chmod +x deploy-ec2.sh && ./deploy-ec2.sh
# ==============================================================================

# Exit immediately if a command exits with a non-zero status
set -e

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}======================================================================${NC}"
echo -e "${GREEN}   Starting Horizon Bank AWS EC2 Automated Deployment Script          ${NC}"
echo -e "${GREEN}======================================================================${NC}"

# Check if script is run as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run this script with sudo privileges:${NC}"
  echo -e "sudo ./deploy-ec2.sh"
  exit 1
fi

# 1. Gather configuration details interactively
echo -e "\n${YELLOW}>>> [1/7] Gathering deployment details...${NC}"
read -p "Enter your domain name (e.g. horizonbank.com or app.horizonbank.com): " DOMAIN_NAME
if [ -z "$DOMAIN_NAME" ]; then
    echo -e "${RED}Error: Domain name is required.${NC}"
    exit 1
fi

read -p "Enter MongoDB Atlas Connection URI: " MONGO_URI
if [ -z "$MONGO_URI" ]; then
    echo -e "${RED}Error: MONGO_URI is required.${NC}"
    exit 1
fi

read -p "Enter JWT Secret (or leave blank to generate a random key): " JWT_SECRET
if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -hex 32)
    echo -e "${GREEN}Generated JWT Secret: ${JWT_SECRET}${NC}"
fi

read -p "Enter Gmail SMTP User (e.g. adarshrasal63@gmail.com): " SMTP_USER
read -sp "Enter Gmail SMTP Password (App Password): " SMTP_PASS
echo ""
read -p "Enter Fast2SMS API Key: " FAST2SMS_API_KEY

# 2. System updates and installing Node.js/PM2/Nginx/Certbot
echo -e "\n${YELLOW}>>> [2/7] Updating system and installing dependencies...${NC}"
apt update -y
apt upgrade -y
apt install -y curl git build-essential nginx python3-certbot-nginx

# Install Node.js 20.x (LTS)
echo -e "${YELLOW}Installing Node.js...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verify installations
NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
echo -e "${GREEN}Node.js version: ${NODE_VERSION}${NC}"
echo -e "${GREEN}NPM version: ${NPM_VERSION}${NC}"

# Install PM2 globally
echo -e "${YELLOW}Installing PM2...${NC}"
npm install -y -g pm2

# 3. Setting up backend
echo -e "\n${YELLOW}>>> [3/7] Setting up the Express backend...${NC}"
cd backend

# Create backend .env file
cat <<EOT > .env
MONGO_URI=${MONGO_URI}
JWT_SECRET=${JWT_SECRET}
PORT=5000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=${SMTP_USER}
SMTP_PASS=${SMTP_PASS}
SMTP_FROM=${SMTP_USER}
FAST2SMS_API_KEY=${FAST2SMS_API_KEY}
RP_ID=${DOMAIN_NAME}
EXPECTED_ORIGIN=https://${DOMAIN_NAME}
NODE_ENV=production
EOT

echo -e "${GREEN}Created backend .env file successfully.${NC}"

# Install dependencies
npm install --production

# Start/Restart Express app using PM2
pm2 describe bank-backend > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${YELLOW}Restarting existing PM2 backend process...${NC}"
    pm2 restart bank-backend
else
    echo -e "${YELLOW}Starting backend using PM2...${NC}"
    pm2 start bank_backend_server.js --name "bank-backend"
fi

# Make PM2 run on boot/restart
pm2 save
pm2 startup systemd -u ubuntu --hp /home/ubuntu || pm2 startup systemd || true

# Navigate back to repository root
cd ..

# 4. Setting up frontend
echo -e "\n${YELLOW}>>> [4/7] Setting up Vite + React frontend...${NC}"
cd frontend

# Create frontend .env file with VITE_API_URL
cat <<EOT > .env
VITE_API_URL=https://${DOMAIN_NAME}/api
EOT

echo -e "${GREEN}Created frontend .env file successfully.${NC}"

# Install dependencies and build frontend
npm install
npm run build

echo -e "${GREEN}Frontend built successfully in frontend/dist directory.${NC}"
cd ..

# 5. Configuring Nginx reverse proxy
echo -e "\n${YELLOW}>>> [5/7] Configuring Nginx reverse proxy...${NC}"

NGINX_CONF="/etc/nginx/sites-available/horizon-bank"
WEB_ROOT="$(pwd)/frontend/dist"

cat <<EOT > $NGINX_CONF
server {
    listen 80;
    server_name ${DOMAIN_NAME};

    # Frontend Static Assets
    root ${WEB_ROOT};
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API Proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOT

# Enable the site and restart Nginx
ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test configuration
nginx -t

# Restart Nginx
systemctl restart nginx
echo -e "${GREEN}Nginx configured and restarted successfully.${NC}"

# 6. Set up SSL with Let's Encrypt Certbot
echo -e "\n${YELLOW}>>> [6/7] Setting up SSL Certificate with Certbot...${NC}"
read -p "Do you want to configure HTTPS/SSL using Let's Encrypt Certbot? (y/n): " RUN_CERTBOT
if [[ "$RUN_CERTBOT" =~ ^[Yy]$ ]]; then
    # Open HTTP port and HTTPS port if UFW firewall is active
    ufw allow 'Nginx Full' || true
    
    certbot --nginx -d $DOMAIN_NAME --agree-tos --no-eff-email --register-unsafely-without-email
    echo -e "${GREEN}SSL Certificate configured successfully!${NC}"
else
    echo -e "${YELLOW}Skipped Certbot configuration. You will need to setup SSL/HTTPS manually for WebAuthn/passkeys to work.${NC}"
fi

# 7. Final Completion
echo -e "\n${GREEN}======================================================================${NC}"
echo -e "${GREEN}   Horizon Bank successfully deployed!                                ${NC}"
echo -e "${GREEN}   Go to: http://${DOMAIN_NAME} (or https://${DOMAIN_NAME} if SSL is enabled)${NC}"
echo -e "${GREEN}======================================================================${NC}"
