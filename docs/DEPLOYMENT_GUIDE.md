# 🚀 Deployment Guide

Complete guide for deploying the Retail Management API to production environments.

## 📋 Pre-Deployment Checklist

### ✅ Prerequisites
- [ ] Node.js 16+ installed
- [ ] Google Sheets API credentials configured
- [ ] Environment variables set
- [ ] Database/spreadsheet structure verified
- [ ] All tests passing (`npm test`)
- [ ] Performance benchmarks validated

### ✅ Security Review
- [ ] Remove development dependencies
- [ ] Validate input sanitization
- [ ] Configure CORS properly
- [ ] Set up authentication (if required)
- [ ] Review error handling (no sensitive data exposed)
- [ ] Enable HTTPS
- [ ] Set security headers

### ✅ Configuration
- [ ] Production environment variables
- [ ] Google Sheets permissions
- [ ] Rate limiting configured
- [ ] Logging system setup
- [ ] Monitoring tools integrated

## 🏗️ Deployment Options

### Option 1: Heroku Deployment

#### Step 1: Prepare the Application
```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create Heroku app
heroku create your-retail-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set PORT=3000
```

#### Step 2: Configure Google Sheets
```bash
# Set Google Sheets credentials as environment variables
heroku config:set GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
heroku config:set GOOGLE_SHEETS_CLIENT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
heroku config:set GOOGLE_SHEETS_SPREADSHEET_ID="your-spreadsheet-id"
```

#### Step 3: Deploy
```bash
# Initialize git repository
git init
git add .
git commit -m "Initial deployment"

# Add Heroku remote
heroku git:remote -a your-retail-api

# Deploy
git push heroku main

# Scale dynos
heroku ps:scale web=1

# Open application
heroku open
```

#### Step 4: Verify Deployment
```bash
# Check logs
heroku logs --tail

# Test health endpoint
curl https://your-retail-api.herokuapp.com/api/health
```

### Option 2: DigitalOcean Droplet

#### Step 1: Create and Setup Droplet
```bash
# SSH into your droplet
ssh root@your-droplet-ip

# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2 for process management
npm install -g pm2

# Install Nginx
apt install nginx -y
```

#### Step 2: Deploy Application
```bash
# Clone repository
git clone https://github.com/your-username/retail-management-api.git
cd retail-management-api

# Install dependencies
npm install --production

# Create environment file
nano .env
```

**.env file:**
```env
NODE_ENV=production
PORT=3000
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_CLIENT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
GOOGLE_SHEETS_SPREADSHEET_ID="your-spreadsheet-id"
```

#### Step 3: Configure PM2
```bash
# Create PM2 ecosystem file
nano ecosystem.config.js
```

**ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'retail-api',
    script: 'index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm Z'
  }]
};
```

```bash
# Create logs directory
mkdir logs

# Start application with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup
```

#### Step 4: Configure Nginx
```bash
# Create Nginx configuration
nano /etc/nginx/sites-available/retail-api
```

**/etc/nginx/sites-available/retail-api:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/retail-api /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx

# Enable Nginx autostart
systemctl enable nginx
```

#### Step 5: Setup SSL with Let's Encrypt
```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate
certbot --nginx -d your-domain.com

# Auto-renewal test
certbot renew --dry-run
```

### Option 3: AWS EC2 Deployment

#### Step 1: Launch EC2 Instance
- Choose Amazon Linux 2 AMI
- Select t2.micro (or larger)
- Configure security groups (ports 22, 80, 443)
- Launch and connect via SSH

#### Step 2: Setup Instance
```bash
# Update packages
sudo yum update -y

# Install Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Install PM2
npm install -g pm2

# Clone and setup application
git clone https://github.com/your-username/retail-management-api.git
cd retail-management-api
npm install --production
```

#### Step 3: Configure Application
```bash
# Setup environment variables
export NODE_ENV=production
export PORT=3000
export GOOGLE_SHEETS_PRIVATE_KEY="your-private-key"
export GOOGLE_SHEETS_CLIENT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
export GOOGLE_SHEETS_SPREADSHEET_ID="your-spreadsheet-id"

# Start with PM2
pm2 start index.js --name retail-api
pm2 startup
pm2 save
```

#### Step 4: Setup Load Balancer (Optional)
- Create Application Load Balancer
- Configure target groups
- Setup health checks on `/api/health`
- Configure SSL termination

### Option 4: Docker Deployment

#### Step 1: Create Dockerfile
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start application
CMD ["node", "index.js"]
```

#### Step 2: Create Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  retail-api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - GOOGLE_SHEETS_PRIVATE_KEY=${GOOGLE_SHEETS_PRIVATE_KEY}
      - GOOGLE_SHEETS_CLIENT_EMAIL=${GOOGLE_SHEETS_CLIENT_EMAIL}
      - GOOGLE_SHEETS_SPREADSHEET_ID=${GOOGLE_SHEETS_SPREADSHEET_ID}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - retail-api
    restart: unless-stopped
```

#### Step 3: Deploy with Docker
```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Scale application
docker-compose up -d --scale retail-api=3
```

## 🔧 Production Configuration

### Environment Variables
Create a `.env.production` file:
```env
# Server Configuration
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Google Sheets Configuration
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_CLIENT_EMAIL="service-account@project.iam.gserviceaccount.com"
GOOGLE_SHEETS_SPREADSHEET_ID="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"

# API Configuration
API_RATE_LIMIT=1000
API_TIMEOUT=30000
MAX_REQUEST_SIZE=10mb

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/application.log

# Security
CORS_ORIGIN=https://yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com

# Monitoring
HEALTH_CHECK_INTERVAL=30000
METRICS_ENABLED=true
```

### Production Index.js Modifications
```javascript
// Add to the top of index.js
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

// Production CORS
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));

// Production error handling
if (process.env.NODE_ENV === 'production') {
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  });
}
```

### Install Production Dependencies
```bash
npm install express-rate-limit helmet compression --save
```

## 📊 Monitoring & Logging

### PM2 Monitoring
```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs retail-api

# Restart application
pm2 restart retail-api

# Reload with zero downtime
pm2 reload retail-api
```

### Log Rotation Setup
```bash
# Install logrotate
sudo apt install logrotate

# Create logrotate configuration
sudo nano /etc/logrotate.d/retail-api
```

**/etc/logrotate.d/retail-api:**
```
/path/to/your/app/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
```

### Health Monitoring Script
```bash
#!/bin/bash
# health-check.sh

API_URL="https://your-domain.com/api/health"
WEBHOOK_URL="https://hooks.slack.com/your-webhook"

response=$(curl -s -o /dev/null -w "%{http_code}" $API_URL)

if [ $response -ne 200 ]; then
    curl -X POST -H 'Content-type: application/json' \
    --data '{"text":"🚨 Retail API is down! Status code: '$response'"}' \
    $WEBHOOK_URL
fi
```

```bash
# Make executable
chmod +x health-check.sh

# Add to crontab (check every 5 minutes)
crontab -e
# Add: */5 * * * * /path/to/health-check.sh
```

## 🔒 Security Best Practices

### 1. Authentication & Authorization
```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

module.exports = { authenticate };
```

### 2. Input Validation & Sanitization
```javascript
// middleware/security.js
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');

app.use(mongoSanitize());

const sanitizeInput = (req, res, next) => {
  if (req.body) {
    for (let key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key]);
      }
    }
  }
  next();
};

module.exports = { sanitizeInput };
```

### 3. Environment Security
```bash
# Set proper file permissions
chmod 600 .env
chmod 600 ecosystem.config.js

# Restrict access to logs
chmod 640 logs/*.log
```

## 📈 Performance Optimization

### 1. Caching Strategy
```javascript
// middleware/cache.js
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes

const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    const key = req.originalUrl;
    const cached = cache.get(key);
    
    if (cached) {
      return res.json(cached);
    }
    
    res.sendResponse = res.json;
    res.json = (body) => {
      cache.set(key, body, duration);
      res.sendResponse(body);
    };
    
    next();
  };
};

// Usage
app.get('/api/products', cacheMiddleware(600), productsController.getAllProducts);
```

### 2. Database Connection Pooling
```javascript
// For Google Sheets API optimization
const { GoogleAuth } = require('google-auth-library');

class SheetsService {
  constructor() {
    this.auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      credentials: {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n')
      }
    });
    this.sheets = null;
  }
  
  async getSheets() {
    if (!this.sheets) {
      const authClient = await this.auth.getClient();
      this.sheets = google.sheets({ version: 'v4', auth: authClient });
    }
    return this.sheets;
  }
}

module.exports = new SheetsService();
```

## 🧪 Production Testing

### Load Testing with Artillery
```bash
# Install Artillery
npm install -g artillery

# Create load test configuration
nano load-test.yml
```

**load-test.yml:**
```yaml
config:
  target: 'https://your-domain.com'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 50
  defaults:
    headers:
      Content-Type: 'application/json'

scenarios:
  - name: "API Load Test"
    flow:
      - get:
          url: "/api/health"
      - get:
          url: "/api/products"
      - get:
          url: "/api/orders"
      - post:
          url: "/api/products"
          json:
            "Product ID": "LOADTEST001"
            "Product Name": "Load Test Product"
            "Selling Price": 99.99
            "Current Stock": 100
            "Min Stock": 10
```

```bash
# Run load test
artillery run load-test.yml
```

### Smoke Tests
```bash
#!/bin/bash
# smoke-test.sh

BASE_URL="https://your-domain.com/api"

echo "🔥 Running smoke tests..."

# Health check
echo "Testing health endpoint..."
curl -f $BASE_URL/health || exit 1

# API info
echo "Testing info endpoint..."
curl -f $BASE_URL/info || exit 1

# Products endpoint
echo "Testing products endpoint..."
curl -f $BASE_URL/products || exit 1

echo "✅ All smoke tests passed!"
```

## 🚀 Deployment Automation

### GitHub Actions CI/CD
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    - run: npm ci
    - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - uses: actions/checkout@v3
    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{secrets.HEROKU_API_KEY}}
        heroku_app_name: "your-retail-api"
        heroku_email: "your-email@example.com"
```

### Deployment Script
```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Starting deployment..."

# Run tests
echo "Running tests..."
npm test

# Build production bundle
echo "Building application..."
npm run build

# Backup current version
echo "Creating backup..."
pm2 save

# Deploy new version
echo "Deploying new version..."
git pull origin main
npm ci --production

# Restart application
echo "Restarting application..."
pm2 reload retail-api

# Health check
echo "Performing health check..."
sleep 10
curl -f http://localhost:3000/api/health || {
  echo "❌ Health check failed, rolling back..."
  pm2 reload retail-api
  exit 1
}

echo "✅ Deployment completed successfully!"
```

## 📞 Post-Deployment Support

### Monitoring Dashboard URLs
- **Server Status**: `https://your-domain.com/api/health`
- **API Information**: `https://your-domain.com/api/info`
- **PM2 Monitoring**: `pm2 monit` (if using PM2)
- **Server Logs**: `pm2 logs retail-api`

### Common Issues & Solutions

#### 1. High Memory Usage
```bash
# Check memory usage
pm2 show retail-api

# Restart if needed
pm2 restart retail-api

# Scale down if necessary
pm2 scale retail-api 2
```

#### 2. Google Sheets API Limits
- Monitor API quota usage
- Implement request batching
- Add retry logic with exponential backoff

#### 3. SSL Certificate Renewal
```bash
# Check certificate expiry
certbot certificates

# Manual renewal
certbot renew

# Auto-renewal check
systemctl status certbot.timer
```

## 📚 Additional Resources

- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Google Sheets API Limits](https://developers.google.com/sheets/api/limits)
- [Node.js Performance Best Practices](https://nodejs.org/en/docs/guides/simple-profiling/)

---

**Need Help?** Check the troubleshooting section in the main README.md or create an issue in the repository.
