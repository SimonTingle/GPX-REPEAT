# 🚀 GPX Repeat — CapRover Deployment Guide

This document describes how to deploy GPX Repeat on CapRover, a self-hosted Platform-as-a-Service.

---

## 📋 Prerequisites

- CapRover instance running (v1.10.0+)
- Docker installed on the CapRover host
- Git access to this repository (or a copy of the source files)
- Domain name (optional, but recommended)

---

## 📁 Files Included

| File | Purpose |
|---|---|
| `captain-definition` | CapRover deployment manifest |
| `Dockerfile` | Multi-stage build (React + Python Flask) |
| `.dockerignore` | Excludes unnecessary files from build context |
| `DEPLOYMENT.md` | This file |

---

## 🏗️ Architecture

The Docker build uses a **multi-stage approach**:

```
Stage 1: Node 18 Alpine
  └─ Install npm dependencies
  └─ Build React/Vite frontend → dist/
  
Stage 2: Python 3.11 Slim
  └─ Install Python dependencies (gpxpy, Flask, etc.)
  └─ Copy built React frontend from Stage 1
  └─ Copy Flask backend
  └─ Run unified server on port 5000
     ├─ POST /parse-gpx → Python Flask API
     ├─ GET / → Serve React frontend (index.html)
     └─ GET /* → Serve React static assets (fallback to index.html for SPA)
```

**Result**: A single Docker image (~500–600 MB) containing both frontend and backend, communicating internally without CORS issues.

---

## 🚀 Deployment Steps

### 1. Push Code to CapRover Host

If using Git:
```bash
git clone https://github.com/your-repo/gpx-repeat.git
cd gpx-repeat
```

Or copy the files directly to the CapRover host.

### 2. Enable CapRover App

In the CapRover Dashboard:

1. Go to **Apps** → **One-Click Apps** (or create a new app manually)
2. Alternatively, go to **Apps** and click **Create a New App**
3. App name: `gpx-repeat` (or your choice)
4. Click **Create New App**

### 3. Configure CapRover App Settings

1. Go to the app's dashboard
2. **HTTP Settings**:
   - **HTTP Port**: `5000`
   - **Container Port**: `5000`
   - **Enable HTTPS**: Yes (recommended)
   - Attach a domain (e.g., `gpx.yourdomain.com`)

3. **Deployment** tab:
   - Image name: Leave blank (will use Dockerfile)
   - **GitHub/GitLab Integration** (if using Git):
     - Connect your repository
     - Branch: `main` (or your branch)
     - Enable **Auto Deploy**

   - **Manual Docker Build** (if uploading files):
     - Ensure `captain-definition` is in the root
     - CapRover will use it automatically

4. **Environment Variables** (optional):
   - `FLASK_ENV`: `production` (set by default)
   - `PYTHONUNBUFFERED`: `1` (set by default)
   - Add any custom vars here

5. **Volumes**:
   - Mount path: `/app/data`
   - Host path: `/captain/data/gpx-repeat`
   - This persists route data if needed

6. **Persistent Directories**:
   - If you want to store routes server-side (future enhancement), mount a volume here

### 4. Deploy

**Option A: Git-based Auto Deploy**
```bash
git push origin main
# CapRover auto-detects the push and redeploys
```

**Option B: Manual Deploy**

In the CapRover dashboard, under the app → **Deployment**:
- Click **Force Build & Deploy**
- CapRover downloads from GitHub/uploads from CLI, builds the Docker image, and starts the container

**Option C: CapRover CLI**

```bash
# Install CapRover CLI
npm install -g caprover

# Login to CapRover
caprover login

# Deploy
caprover deploy --appName gpx-repeat
```

### 5. Verify Deployment

1. **Health Check**: Navigate to `https://gpx.yourdomain.com/health`
   - Should return `{ "status": "ok" }`

2. **Frontend**: Navigate to `https://gpx.yourdomain.com`
   - Should load the GPX Repeat React app

3. **API**: Open browser DevTools → Network tab → Upload a GPX file
   - Should see `POST /parse-gpx` succeed with a 200 response

---

## 🔧 Environment Variables

All environment variables are optional unless noted. Defaults are suitable for production.

| Variable | Default | Purpose |
|---|---|---|
| `FLASK_ENV` | `production` | Flask environment (set by captain-definition) |
| `PYTHONUNBUFFERED` | `1` | Unbuffered stdout for real-time logs |
| `PORT` | `5000` | Port Flask listens on (set by CapRover) |

---

## 📊 Monitoring

### Logs

In CapRover Dashboard → App Details → **Logs**:
- Real-time logs from the running container
- Look for `[GPX Export]` pre/post-check messages when users export GPX files
- Any parsing errors appear here

### Health Checks

CapRover automatically runs health checks every 30 seconds:
```
GET http://localhost:5000/health → { "status": "ok" }
```

If 3 consecutive checks fail, CapRover will restart the container.

### Resource Usage

Monitor CPU and memory in CapRover Dashboard → App Details → **Stats**.

Typical resource usage:
- **CPU**: <10% at rest, <50% during GPX parsing
- **Memory**: 150–200 MB base + 50–100 MB per concurrent user

---

## 🔐 Security Considerations

### HTTPS

- Enable HTTPS in CapRover **HTTP Settings**
- Use a free Let's Encrypt certificate (CapRover handles this automatically)
- All traffic should be HTTPS-only (enable redirect)

### CORS

The Flask backend has CORS enabled in the Dockerfile setup, allowing requests from the frontend. If you deploy the frontend separately (different domain), ensure CORS is configured correctly:

```python
CORS(app, origins=["https://yourdomain.com"])
```

### File Upload Limits

The backend currently accepts files up to 50 MB. To change this, modify `backend/app.py`:
```python
MAX_FILE_SIZE = 50 * 1024 * 1024  # Change to desired size
```

Then redeploy.

### Environment Secrets

If you add environment variables with secrets:
1. Set them in CapRover Dashboard (not in `captain-definition`)
2. They will be injected at runtime
3. Never commit `.env` files to Git

---

## 📦 Build & Image Details

### Build Time

- Initial build: 3–5 minutes (downloads dependencies)
- Subsequent builds: 1–2 minutes (cached layers)

### Image Size

- **Frontend build**: ~100 MB (Node dependencies)
- **Final image**: ~500–600 MB (Python + Flask + built React)
- **Compressed (CapRover)**: ~200–250 MB

### Caching

Docker build cache layers:
1. Base images (reused across rebuilds)
2. Python dependencies (`pip install`) — changes rarely
3. Frontend dependencies (`npm ci`) — changes when package.json updates
4. Source code — rebuilt on every deployment

For fastest builds, keep dependencies stable and deploy frequently.

---

## 🔄 Updates & Redeployment

### Push Code Updates

```bash
git push origin main
# CapRover auto-redeploys if auto-deploy is enabled
```

Or manually trigger redeploy in the dashboard → **Force Build & Deploy**.

### Update Dependencies

**Frontend** (package.json changes):
1. Update `src/package.json` locally
2. Run `npm ci` to verify build locally
3. Commit and push
4. CapRover rebuilds automatically

**Backend** (backend/requirements.txt changes):
1. Update `backend/requirements.txt` locally
2. Run `pip install -r requirements.txt` to verify locally
3. Commit and push
4. CapRover rebuilds automatically

### Zero-Downtime Deployment

CapRover handles this automatically:
1. New container spins up in parallel
2. Health checks pass on new container
3. Old container is removed
4. No downtime (all connections are stateless)

---

## 🐛 Troubleshooting

### App Won't Start

**Logs show: `SyntaxError` or `ModuleNotFoundError`**
- Check Python dependencies in `backend/requirements.txt`
- Verify `backend/app.py` is syntactically correct
- Redeploy with `--verbose` flag

**Logs show: `Cannot find module 'react'`**
- Frontend build failed
- Check `package.json` and `vite.config.ts`
- Verify all TypeScript files compile locally: `npx tsc --noEmit`

### GPX Upload Fails

**Error: `Cannot find module 'gpxpy'`**
- Python dependencies not installed
- Rebuild the image: Dashboard → **Force Build & Deploy**

**Error: `CORS error` in browser console**
- Frontend is on a different domain than backend
- Update `Dockerfile` line with `CORS(app, origins=["https://yourdomain.com"])`
- Redeploy

### High Memory Usage

**App using > 500 MB**
- Check for memory leaks in uploaded GPX files
- Limit file size: `MAX_FILE_SIZE` in `backend/app.py`
- Restart the container: Dashboard → **Restart App**

### Slow Deploy

**Build takes > 10 minutes**
- First build downloads all npm/pip packages
- Subsequent builds are faster due to caching
- Check internet speed on CapRover host

---

## 🔗 Useful CapRover Commands

### Via CLI

```bash
# List apps
caprover list

# View app details
caprover info --appName gpx-repeat

# View logs
caprover logs --appName gpx-repeat

# Restart app
caprover restart --appName gpx-repeat

# Stop app
caprover stop --appName gpx-repeat

# Deploy
caprover deploy --appName gpx-repeat
```

### Via Dashboard

- **Settings** → Advanced → View logs
- **Restart App** button
- **Force Build & Deploy** button
- **HTTP Settings** for domain/HTTPS config

---

## 📈 Performance Tuning

### Database-like Storage

Currently, GPX Repeat stores routes in browser `localStorage`. For future server-side persistence:

1. Mount `/app/data` volume (already configured)
2. Add SQLite or JSON file storage in `backend/app.py`
3. Create an API endpoint to save/load routes server-side

### Caching

**Frontend caching** (already enabled via Vite):
- Static assets have far-future cache headers
- Browser caches them indefinitely
- Updates via service worker or cache busting (hash in filename)

**Backend caching** (future enhancement):
- Add Redis for session/route caching
- Reduce duplicate GPX parsing

---

## 🤝 Support & Contributing

- **Issues**: [GitHub Issues](https://github.com/your-repo/gpx-repeat/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/gpx-repeat/discussions)
- **CapRover Docs**: [CapRover.com](https://caprover.com/)

---

## 📋 Deployment Checklist

- [ ] CapRover instance running and accessible
- [ ] Domain name assigned (or IP address ready)
- [ ] `captain-definition` is in repo root
- [ ] `Dockerfile` is in repo root
- [ ] `.gitignore` includes `node_modules` and `backend/venv`
- [ ] No `.env` files in Git
- [ ] `backend/requirements.txt` is up-to-date
- [ ] `package.json` is up-to-date
- [ ] TypeScript compiles: `npx tsc --noEmit`
- [ ] Vite builds locally: `npm run build`
- [ ] Flask starts: `python backend/app.py`
- [ ] Code pushed to main branch
- [ ] CapRover auto-deploy enabled (optional)
- [ ] HTTPS configured in CapRover
- [ ] Health check passes
- [ ] Frontend loads at your domain
- [ ] GPX upload works end-to-end

---

**Deployed!** 🎉 Your GPX Repeat app is live and ready for users.
