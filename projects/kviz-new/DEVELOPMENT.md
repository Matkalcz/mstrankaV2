# Development & Deployment Guide - kviz.michaljanda.com

## Project Overview

Next.js 15 application for pub quiz management system.

**Key URLs:**
- Production: https://kviz.michaljanda.com/admin
- Local dev: http://localhost:3002/admin

**Project structure:**
```
kviz-new/
├── app/                    # Next.js app router pages
│   ├── admin/             # Admin dashboard pages
│   │   ├── page.tsx       # Main dashboard
│   │   ├── quizzes/       # Quiz management
│   │   ├── questions/     # Question management
│   │   └── ...
├── components/            # React components
│   ├── ModernAdminLayout.tsx  # Main layout
│   └── ...
├── types/                 # TypeScript types
├── public/               # Static assets
└── .next/               # Build output (generated)
```

## Development Setup

### Prerequisites
- Node.js 18+ 
- npm 9+

### Installation
```bash
cd kviz-new
npm install
```

### Development Server
```bash
npm run dev -- -p 3002
```
Access: http://localhost:3002/admin

### Build for Production
```bash
npm run build
```
Build output: `.next/standalone/` (self-contained deployment)

## Deployment Scripts

All scripts are located in project root:

### 1. Health Check (`health-check-static.sh`)
Verifies static files are accessible on production.

**Usage:**
```bash
./health-check-static.sh
```

**Checks:**
- Admin page (200 OK)
- CSS file extraction and access
- JS chunks accessibility
- Middleware redirect

### 2. Build Verification (`verify-build.sh`)
Validates Next.js build output.

**Usage:**
```bash
./verify-build.sh
```

**Checks:**
- Required directories exist
- CSS/JS file counts
- Standalone output structure
- Build manifest

### 3. Deployment Script (`deploy.sh`)
Automated deployment with rollback support.

**Usage:**
```bash
./deploy.sh
```

**Steps:**
1. Pre-deployment checks
2. Build process
3. Build verification
4. Backup current deployment
5. Stop current server
6. Copy static files
7. Start new server
8. Health check
9. Final verification

### 4. 404 Monitor (`monitor-404.sh`)
Monitors nginx logs for 404 errors.

**Usage:**
```bash
# Analyze last 24 hours
./monitor-404.sh

# Follow logs in real-time
./monitor-404.sh --follow

# Analyze last 48 hours
./monitor-404.sh --hours 48
```

## Deployment Process

### Manual Deployment (Recommended)
Follow the deployment checklist: [deployment-checklist.md](deployment-checklist.md)

### Automated Deployment
Use the deploy script for consistency:
```bash
cd /home/openclaw/.openclaw/workspace-domminik/kviz-new
./deploy.sh
```

## Nginx Configuration

Location: `/etc/nginx/sites-available/kviz.michaljanda.com`

**Key features:**
- HTTPS with Let's Encrypt
- Static file caching (1 year for hashed files)
- `/next/` → `/_next/` redirect (fallback for cached URLs)
- No cache for admin pages
- Access logging disabled for static files

**Testing nginx config:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Monitoring & Logs

### Log Files
- **Nginx access**: `/var/log/nginx/access.log`
- **Nginx errors**: `/var/log/nginx/error.log`
- **Server logs**: `/tmp/next-server-*.log`

### Health Monitoring
- **Cron job**: Runs every 2 minutes (`kviz-health-check.sh`)
- **Manual check**: `./health-check-static.sh`

### Error Monitoring
- **404 errors**: `./monitor-404.sh`
- **Static file issues**: Check for CSS/JS 404s specifically

## Common Issues & Solutions

### 1. CSS 404 Errors
**Symptoms**: Page loads without styling, 404 on CSS files

**Causes:**
- Incomplete build
- Static files not copied to standalone directory
- Wrong CSS hash in HTML

**Solutions:**
1. Run `./verify-build.sh` to check build
2. Ensure `cp -r .next/static .next/standalone/.next/` executed
3. Check nginx config for `/_next/static/` routing
4. Use `./health-check-static.sh` to verify accessibility

### 2. Server Not Starting
**Symptoms**: 502 Bad Gateway, port 3002 not listening

**Solutions:**
1. Check if port is in use: `sudo lsof -ti:3002`
2. Kill existing process: `sudo kill -9 <PID>`
3. Start server: `cd .next/standalone && PORT=3002 node server.js`
4. Check logs: `tail -f /tmp/next-server-*.log`

### 3. Middleware Errors
**Symptoms**: Edge runtime errors, `EvalError`

**Solutions:**
1. Use Node.js runtime for middleware (`export const runtime = 'nodejs'`)
2. Avoid `eval()` or dynamic code generation in middleware
3. Keep middleware simple (only redirects/headers)

## Backup & Rollback

### Backup Location
`/home/openclaw/.openclaw/workspace-domminik/kviz-new/.next/standalone/backup/`

### Rollback Process
1. Stop current server
2. Restore from backup: `tar -xzf backup/*.tar.gz -C .next/standalone/`
3. Start server from backup

## Performance Optimization

### Build Optimization
- Use `next build` with default optimization
- Review bundle sizes in build output
- Consider code splitting for large components

### Nginx Optimization
- Static file caching (already configured)
- Gzip compression (enabled by default)
- Keepalive connections

## Security

### SSL/TLS
- Let's Encrypt certificates auto-renewal
- HTTPS enforcement
- Modern TLS protocols

### Application Security
- No sensitive data in client components
- Input validation on forms
- Secure headers via middleware/nginx

## Maintenance Schedule

- **Daily**: Check error logs (`./monitor-404.sh`)
- **Weekly**: Review server resource usage
- **Monthly**: Update dependencies (`npm audit`, `npm update`)
- **On demand**: Deploy new features/fixes

## Contact & Support

- **Primary maintainer**: Domminik agent
- **Infrastructure**: OpenClaw host (Matkalcz)
- **Emergency**: Rollback to last known good deployment

---
*Last updated: 2026-03-08*  
*Document version: 1.0*