# TwoHearts - Complete Deployment Instructions

## 🚀 Quick Start (3 Steps)

### Step 1: Setup Server (One-time)

```bash
# From your local machine
ssh server2 "bash -s" < setup-server.sh
```

This installs:
- Node.js 18.x
- PM2 process manager
- Nginx web server
- Creates app directories

**Time**: ~5 minutes

---

### Step 2: Upload Application

```bash
# From project directory
scp -r * server2:/var/www/twohearts/
```

**Time**: ~2 minutes

---

### Step 3: Deploy Application

```bash
# Connect to server
ssh server2

# Navigate to app directory
cd /var/www/twohearts

# Create environment file
cat > .env << EOF
NODE_ENV=production
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
DATABASE_URL=sqlite:./data/production.db
PORT=3000
EOF

# Install dependencies
npm install --production
cd api && npm install --production && cd ..

# Build frontend
npm run build

# Start application
pm2 start api/index.js --name twohearts
pm2 save

# Check status
pm2 status
```

**Time**: ~3 minutes

---

## ✅ Verify Deployment

### Check Application Status

```bash
ssh server2 "pm2 status"
```

### View Logs

```bash
ssh server2 "pm2 logs twohearts --lines 50"
```

### Test Application

```bash
# Get server IP
ssh server2 "hostname -I"

# Open in browser
# http://YOUR_SERVER_IP:3000
```

---

## 🔄 Update Application

```bash
# Upload new files
scp -r * server2:/var/www/twohearts/

# Restart
ssh server2 "cd /var/www/twohearts && npm install && npm run build && pm2 restart twohearts"
```

---

## 🛠️ Troubleshooting

### Application Not Starting

```bash
# Check logs
ssh server2 "pm2 logs twohearts --err"

# Check if port is in use
ssh server2 "sudo lsof -i :3000"

# Restart
ssh server2 "pm2 restart twohearts"
```

### Database Issues

```bash
# Check database directory
ssh server2 "ls -la /var/www/twohearts/data/"

# Run migrations manually
ssh server2 "cd /var/www/twohearts/api && node -e \"const {runMigrations} = require('./db/migrations'); const {initDb} = require('./db/db'); initDb(); runMigrations();\""
```

---

## 📊 Monitoring

```bash
# Real-time monitoring
ssh server2 "pm2 monit"

# View logs
ssh server2 "pm2 logs twohearts"

# Application info
ssh server2 "pm2 info twohearts"
```

---

## 🔐 Security (Optional but Recommended)

### Enable Firewall

```bash
ssh server2 "sudo ufw enable"
```

### Setup SSL (if you have a domain)

```bash
ssh server2 "sudo apt install certbot python3-certbot-nginx && sudo certbot --nginx -d yourdomain.com"
```

---

## 📝 Quick Commands Reference

| Action | Command |
|--------|---------|
| Start | `ssh server2 "pm2 start twohearts"` |
| Stop | `ssh server2 "pm2 stop twohearts"` |
| Restart | `ssh server2 "pm2 restart twohearts"` |
| Logs | `ssh server2 "pm2 logs twohearts"` |
| Status | `ssh server2 "pm2 status"` |
| Monitor | `ssh server2 "pm2 monit"` |

---

## 🎉 Success!

Your application is now running at:
- **http://YOUR_SERVER_IP:3000**

To find your server IP:
```bash
ssh server2 "hostname -I | awk '{print \$1}'"
```

---

## 📞 Need Help?

Common issues and solutions:

1. **"Connection refused"** → Check if PM2 is running: `ssh server2 "pm2 status"`
2. **"Port already in use"** → Kill existing process: `ssh server2 "sudo lsof -i :3000"`
3. **"Database error"** → Check migrations: `ssh server2 "ls -la /var/www/twohearts/data/"`
4. **"Module not found"** → Reinstall dependencies: `ssh server2 "cd /var/www/twohearts && npm install"`

---

**Deployment complete! Your enterprise-ready TwoHearts platform is now live! 🚀**
