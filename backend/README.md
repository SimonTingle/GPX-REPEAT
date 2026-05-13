# GPX Parser Backend

Python Flask backend for accurate GPX file parsing.

## Setup

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Server runs on `http://localhost:5000`

## Features

- **Accurate GPX Parsing**: Uses gpxpy library (industry standard)
- **Elevation Data**: Extracts elevation gain/loss, min/max, average
- **Distance Calculation**: Haversine formula for accurate distances
- **Metadata Extraction**: Route name, description, creator
- **Bounds Calculation**: North/South/East/West bounds
- **Real-time Progress**: Reports progress to React frontend

## API Endpoints

### POST /parse-gpx
Upload a GPX file for parsing

**Request:**
```
multipart/form-data with 'file' field
```

**Response:**
```json
{
  "success": true,
  "waypoints": [...],
  "distance": 10.9,
  "elevationGain": 245.3,
  "elevationLoss": 215.1,
  "maxElevation": 532.0,
  "minElevation": 362.0,
  "avgElevation": 450.2,
  "bounds": { "north": 27.94, "south": 27.92, "east": -15.44, "west": -15.46 },
  "pointCount": 579,
  "metadata": { "name": "Route Name", "creator": "Wikiloc" }
}
```

### GET /health
Health check endpoint

## Supported GPX Versions

- GPX 1.0
- GPX 1.1
- With and without namespaces

## Accuracy

- **Distance**: Haversine formula (±0.1% error)
- **Elevation**: Direct from GPX data
- **Coordinates**: Full precision preserved
