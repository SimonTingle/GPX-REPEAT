# Multi-stage build for GPX Repeat
# Stage 1: Build React frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Copy frontend files
COPY package*.json ./
COPY tsconfig.json tsconfig.node.json vite.config.ts tailwind.config.js postcss.config.js ./
COPY src ./src
COPY scripts ./scripts
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

# Copy frontend server wrapper
COPY serve.py ./serve.py

# Install Python dependencies
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy built frontend from stage 1
COPY --from=frontend-builder /app/dist ./frontend/dist

# Ensure data directory exists for persistent volume mount
RUN mkdir -p /app/data

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Expose port
EXPOSE 5000

# Set environment variables
ENV FLASK_ENV=production
ENV PYTHONUNBUFFERED=1

# Run the server
CMD ["python", "/app/serve.py"]
