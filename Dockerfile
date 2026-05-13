# Multi-stage build for GPX Repeat
# Stage 1: Build React frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Copy frontend files
COPY package*.json ./
COPY tsconfig.json vite.config.ts tailwind.config.js postcss.config.js ./
COPY src ./src
COPY index.html ./

# Install dependencies and build
RUN npm ci
RUN npm run build

# Stage 2: Python backend with built frontend
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy backend files
COPY backend/requirements.txt ./backend/requirements.txt
COPY backend/app.py ./backend/app.py

# Install Python dependencies
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy built frontend from stage 1
COPY --from=frontend-builder /app/dist ./frontend/dist

# Create a simple Flask app wrapper to serve both backend API and frontend
RUN mkdir -p /app/app && cat > /app/app/serve.py << 'EOF'
from flask import Flask, send_from_directory
from flask_cors import CORS
import sys
import os

# Add backend to path
sys.path.insert(0, '/app/backend')

# Import the original app
from app import app as backend_app, parse_gpx, health

# Configure CORS for API routes
CORS(backend_app)

# Serve static files (React frontend)
@backend_app.route('/')
@backend_app.route('/<path:path>')
def serve_frontend(path=''):
    if path and os.path.exists(os.path.join('/app/frontend/dist', path)):
        return send_from_directory('/app/frontend/dist', path)
    return send_from_directory('/app/frontend/dist', 'index.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    backend_app.run(host='0.0.0.0', port=port, debug=False)
EOF

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Expose port
EXPOSE 5000

# Set environment variables
ENV FLASK_ENV=production
ENV PYTHONUNBUFFERED=1

# Run the server
CMD ["python", "/app/app/serve.py"]
