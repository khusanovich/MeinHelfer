# MeinHelfer — Hetzner Deployment Guide

Target: **Hetzner CX22** (2 vCPU, 4 GB RAM, 40 GB SSD) · Ubuntu 24.04 LTS

---

## 1. Provision the VPS

1. Log into [Hetzner Cloud Console](https://console.hetzner.cloud)
2. Create a new server:
   - Type: **CX22** (2 vCPU / 4 GB RAM)
   - Image: **Ubuntu 24.04**
   - SSH key: add your public key
   - Location: **Nuremberg** or **Frankfurt** (EU, GDPR)
3. Note the server's public IP address

---

## 2. Configure DNS

At your DNS provider, add these A records pointing to the VPS IP:

| Hostname | Type | Value |
|----------|------|-------|
| `meinhelfer.de` | A | `<VPS_IP>` |
| `www.meinhelfer.de` | A | `<VPS_IP>` |
| `api.meinhelfer.de` | A | `<VPS_IP>` |

> DNS propagation can take up to 30 minutes. Traefik will not obtain TLS
> certificates until the domain resolves correctly.

---

## 3. Initial Server Setup

```bash
# SSH in as root (or with sudo user)
ssh root@<VPS_IP>

# Update system
apt update && apt upgrade -y

# Install essentials
apt install -y curl git ufw fail2ban

# Create a deploy user (optional but recommended)
adduser deploy
usermod -aG sudo deploy
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy

# Basic firewall
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
ufw status
```

---

## 4. Install Docker

```bash
# Official Docker install script
curl -fsSL https://get.docker.com | sh

# Add deploy user to docker group
usermod -aG docker deploy

# Verify
docker --version
docker compose version
```

---

## 5. Deploy the Application

### 5.1 Clone the repository

```bash
su - deploy
git clone https://github.com/your-org/meinhelfer.git /home/deploy/meinhelfer
cd /home/deploy/meinhelfer
```

### 5.2 Configure environment

```bash
cp .env.example .env
nano .env   # Fill in all values (see section 6)
```

### 5.3 Create the Docker network

Traefik requires an external `web` network shared across all services.
Only run this once per server:

```bash
docker network create web
```

### 5.4 Start the stack

```bash
# First deployment
make deploy

# Apply database migrations
make prod-migrate

# Create the first admin user (interactive)
make prod-create-admin
```

### 5.5 Verify

```bash
# Check all containers are running
docker compose -f docker-compose.prod.yml ps

# Tail logs (Ctrl+C to stop)
make prod-logs

# Test health endpoint
curl https://api.meinhelfer.de/api/v1/health
# → {"status":"ok","version":"1.0.0"}
```

Open `https://meinhelfer.de` in a browser — you should see the landing page.

---

## 6. Environment Variables Reference

Edit `/home/deploy/meinhelfer/.env`:

```bash
# Database
POSTGRES_DB=meinhelfer
POSTGRES_USER=meinhelfer
POSTGRES_PASSWORD=<strong-random-password>   # min 24 chars

# Backend security
SECRET_KEY=<64-hex-chars>  # openssl rand -hex 32
ACCESS_TOKEN_EXPIRE_HOURS=8

# Domain
DOMAIN=meinhelfer.de
ACME_EMAIL=owner@meinhelfer.de             # for Let's Encrypt notifications
APP_URL=https://meinhelfer.de

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@meinhelfer.de
SMTP_PASSWORD=<gmail-app-password>
SMTP_FROM=noreply@meinhelfer.de
SMTP_FROM_NAME=MeinHelfer

# Admin notifications
ADMIN_EMAIL=owner@meinhelfer.de
```

Generate a strong SECRET_KEY:
```bash
openssl rand -hex 32
```

---

## 7. TLS Certificates

Traefik handles TLS automatically via **Let's Encrypt HTTP-01 challenge**.

- Certificates are stored in the `traefik_acme` Docker volume
- Auto-renewal happens 30 days before expiry
- No manual action required

**Troubleshoot:** if TLS fails, check:
```bash
docker compose -f docker-compose.prod.yml logs traefik | grep -i "acme\|cert\|error"
```

Common causes:
- DNS not yet propagated (wait 30 min)
- Port 80 blocked by firewall (`ufw allow 80/tcp`)
- Rate limit hit (Let's Encrypt allows 5 failures/hour per domain)

---

## 8. Updating the Application

```bash
cd /home/deploy/meinhelfer

# Pull latest code
git pull origin main

# Rebuild and redeploy (zero-downtime: new containers start before old ones stop)
docker compose -f docker-compose.prod.yml up -d --build

# Run any new migrations
make prod-migrate
```

---

## 9. Database Backups

### Manual backup

```bash
make prod-backup
# → backup_prod_20260605_143000.sql
```

### Automated daily backup (cron)

```bash
crontab -e
```

Add this line:
```cron
0 3 * * * cd /home/deploy/meinhelfer && docker compose -f docker-compose.prod.yml exec -T postgres pg_dump -U meinhelfer meinhelfer | gzip > /home/deploy/backups/meinhelfer_$(date +\%Y\%m\%d).sql.gz
```

Create the backup directory:
```bash
mkdir -p /home/deploy/backups
```

### Restore from backup

```bash
# Decompress if needed
gunzip backup.sql.gz

# Restore
docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -U meinhelfer meinhelfer < backup.sql
```

---

## 10. Monitoring

### Check container health
```bash
docker compose -f docker-compose.prod.yml ps
```

### Live logs by service
```bash
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f traefik
```

### Disk usage
```bash
docker system df
df -h
```

### Resource usage
```bash
docker stats
```

---

## 11. Security Hardening Checklist

- [x] UFW firewall (only 22, 80, 443 open)
- [x] fail2ban installed (SSH brute force protection)
- [x] Non-root deploy user
- [x] Docker socket not exposed externally
- [x] HTTPS enforced (HTTP redirects to HTTPS)
- [x] HSTS header with 1-year max-age
- [x] Rate limiting on API and auth endpoints
- [x] Security headers (X-Frame-Options, CSP, etc.)
- [x] Postgres not exposed on public network
- [ ] Regular `apt upgrade` (set up unattended-upgrades)
- [ ] SSH key only, password auth disabled

Disable SSH password auth:
```bash
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart ssh
```

Enable automatic security updates:
```bash
apt install -y unattended-upgrades
dpkg-reconfigure --priority=low unattended-upgrades
```

---

## 12. Rollback

If a deployment breaks:

```bash
# View recent image tags
docker images | grep meinhelfer

# Roll back to previous image
docker compose -f docker-compose.prod.yml up -d --no-build

# Or roll back git and rebuild
git revert HEAD
make deploy
```

---

## Estimated Monthly Cost (Hetzner)

| Resource | Cost |
|----------|------|
| CX22 VPS | ~€4.15/mo |
| Domain (`.de`) | ~€0.50/mo |
| Backups (optional 20% surcharge) | ~€0.83/mo |
| **Total** | **~€5.50/mo** |
