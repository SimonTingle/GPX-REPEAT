from flask import Flask, request, jsonify
from flask_cors import CORS
import gpxpy
import gpxpy.gpx
import math
from datetime import datetime

app = Flask(__name__)
CORS(app)

def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    return R * c

@app.route('/parse-gpx', methods=['POST'])
def parse_gpx():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']
        gpx_data = gpxpy.parse(file)

        waypoints = []
        total_distance = 0
        elevations = []

        # Always use track points for visualization (actual GPS route)
        has_track = len(gpx_data.tracks) > 0

        if has_track:
            # Extract track points for proper route visualization
            for track in gpx_data.tracks:
                for segment in track.segments:
                    for point in segment.points:
                        waypoints.append({
                            'lat': point.latitude,
                            'lon': point.longitude,
                            'ele': point.elevation,
                            'time': point.time.isoformat() if point.time else None
                        })
                        if point.elevation:
                            elevations.append(point.elevation)
        else:
            # Fall back to named waypoints if no track data
            for point in gpx_data.waypoints:
                waypoints.append({
                    'lat': point.latitude,
                    'lon': point.longitude,
                    'ele': point.elevation,
                    'name': point.name,
                    'time': point.time.isoformat() if point.time else None
                })
                if point.elevation:
                    elevations.append(point.elevation)

        # Calculate distance from all waypoints
        for i in range(1, len(waypoints)):
            dist = haversine(waypoints[i-1]['lat'], waypoints[i-1]['lon'],
                           waypoints[i]['lat'], waypoints[i]['lon'])
            total_distance += dist

        # Calculate elevation stats
        elevation_gain = 0
        elevation_loss = 0
        if elevations and len(elevations) > 1:
            for i in range(1, len(elevations)):
                diff = elevations[i] - elevations[i-1]
                if diff > 0:
                    elevation_gain += diff
                else:
                    elevation_loss += abs(diff)

        # Get bounds
        bounds = {
            'north': max([w['lat'] for w in waypoints]) if waypoints else 0,
            'south': min([w['lat'] for w in waypoints]) if waypoints else 0,
            'east': max([w['lon'] for w in waypoints]) if waypoints else 0,
            'west': min([w['lon'] for w in waypoints]) if waypoints else 0,
        }

        return jsonify({
            'success': True,
            'waypoints': waypoints,
            'distance': round(total_distance, 2),
            'elevationGain': round(elevation_gain, 1),
            'elevationLoss': round(elevation_loss, 1),
            'maxElevation': round(max(elevations), 1) if elevations else 0,
            'minElevation': round(min(elevations), 1) if elevations else 0,
            'avgElevation': round(sum(elevations)/len(elevations), 1) if elevations else 0,
            'bounds': bounds,
            'pointCount': len(waypoints),
            'metadata': {
                'name': gpx_data.name,
                'description': gpx_data.description,
                'creator': getattr(gpx_data, 'creator', 'Unknown')
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
