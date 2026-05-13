"""
Flask server wrapper to serve both React frontend and Python backend API.
This runs in the Docker container.
"""
import sys
import os
from flask import Flask, send_from_directory
from flask_cors import CORS

# Add backend to path
sys.path.insert(0, '/app/backend')

# Import the original Flask app
from app import app as backend_app

# Configure CORS for API routes
CORS(backend_app)

# Serve static files (React frontend)
@backend_app.route('/')
@backend_app.route('/<path:path>')
def serve_frontend(path=''):
    """Serve React frontend, with fallback to index.html for SPA routing."""
    if path and os.path.exists(os.path.join('/app/frontend/dist', path)):
        return send_from_directory('/app/frontend/dist', path)
    return send_from_directory('/app/frontend/dist', 'index.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    backend_app.run(host='0.0.0.0', port=port, debug=False)
