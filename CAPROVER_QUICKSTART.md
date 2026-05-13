# ⚡ CapRover Quick Start — GPX Repeat

Deploy GPX Repeat to CapRover in 5 minutes.

---

## 🚀 Quick Deploy

### 1. Push to Git

```bash
git add .
git commit -m "Add CapRover deployment files"
git push origin main
```

### 2. Create App in CapRover Dashboard

1. Open CapRover Dashboard: `https://yourdomain.example.caprover.com`
2. Go to **Apps** → **Create a New App**
3. App name: `gpx-repeat`
4. Click **Create New App**

### 3. Connect GitHub (Auto Deploy)

In the app → **Deployment** tab:
- **Deployment Method**: GitHub
- Connect your GitHub account
- Select repository: `your-repo/gpx-repeat`
- Branch: `main`
- Click **Save & Deploy**

_Or:_ Use **Docker Image** method with a pre-built image from Docker Hub if available.

### 4. Configure Domain & HTTPS

In the app → **HTTP Settings**:
- **Container Port**: `5000`
- **HTTP Port**: `80` (auto-redirects to HTTPS)
- **Enable HTTPS**: Yes
- **Domain**: `gpx.yourdomain.com` (or your choice)
- Click **Save**

Let's Encrypt certificate is issued automatically.

### 5. Verify Deployment

```bash
# Check health
curl https://gpx.yourdomain.com/health
# Should return: { "status": "ok" }

# Visit app
# https://gpx.yourdomain.com
```

---

## 🐳 Local Testing (Before Deploying)

Test the Docker image locally:

```bash
# Build the image
docker build -t gpx-repeat:latest .

# Run locally
docker run -p 5000:5000 gpx-repeat:latest

# Visit http://localhost:5000
```

Or with docker-compose:

```bash
docker-compose up --build
# Visit http://localhost:5000
```

---

## 📁 Files Included

| File | Purpose |
|---|---|
| `captain-definition` | CapRover manifest (required) |
| `Dockerfile` | Multi-stage build (frontend + backend) |
| `.dockerignore` | Exclude unnecessary files |
| `docker-compose.yml` | Local dev/test |
| `DEPLOYMENT.md` | Full deployment guide |

---

## ✅ Checklist

- [ ] Code pushed to Git main branch
- [ ] CapRover app created
- [ ] GitHub connected (auto-deploy enabled)
- [ ] Domain configured
- [ ] HTTPS enabled
- [ ] Health check passes
- [ ] GPX Repeat loads at your domain
- [ ] Upload a test GPX file — works! ✓

---

## 🔧 Common Issues

| Issue | Solution |
|---|---|
| `captain-definition` not found | Ensure it's in the repo root (no extension) |
| Build fails (`npm: not found`) | Docker build context includes necessary files |
| Port 5000 already in use | Change port in docker-compose.yml: `"5001:5000"` |
| CORS errors | Both frontend and backend are in the same Docker image — no CORS needed |
| GPX upload fails | Check logs: CapRover Dashboard → **Logs** |

---

## 📚 Full Documentation

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for:
- Detailed architecture
- Environment variables
- Monitoring & logs
- Security considerations
- Performance tuning
- Troubleshooting

---

## 🎉 Done!

Your GPX Repeat app is deployed. Share the link with users, upload some Wikiloc GPX files, and start planning race routes! 🏃‍♂️

