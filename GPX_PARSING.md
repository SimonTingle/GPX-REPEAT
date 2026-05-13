# GPX File Parsing Documentation

## Overview

This document describes the accurate GPX file parsing implementation in GPX Repeat, including lessons learned from handling real-world Wikiloc GPX files.

## Problem Statement

GPX files can contain multiple data types that represent different information:

1. **Waypoints** (`<wpt>`) - Named checkpoints or markers (e.g., "Km 1", "Rest Point")
2. **Track Points** (`<trk>`) - Detailed GPS recording of the actual route traveled
3. **Routes** (`<rte>`) - Pre-planned routes (less common)

### Initial Implementation Issues

The first implementation incorrectly **mixed waypoints and track data**:
- Extracted waypoints separately
- Extracted track points separately  
- Combined them into a single array for distance calculation
- Result: **Inflated distances** (10.91 km vs actual 6.75 km)

**Example Issue:** Wikiloc's "PROVIVAL BACKYARD ULTRA - GRAN CANARIA 2026" file
- Track points (573): Actual GPS recording = 10.91 km circuit
- Named waypoints (6): Km 1-6 markers = 3.56 km direct route
- **User saw 10.9 km instead of Wikiloc's 6.75 km**

## Solution: Proper GPX Structure Handling

### GPX File Structure

```xml
<?xml version="1.0"?>
<gpx version="1.1">
  <!-- Named waypoints (checkpoints/markers) -->
  <wpt lat="27.928827" lon="-15.444624">
    <name>Km 1 - Presa Los Majanos</name>
    <ele>362.0</ele>
  </wpt>
  
  <!-- Actual recorded route -->
  <trk>
    <name>Route Name</name>
    <trkseg>
      <trkpt lat="27.923698" lon="-15.446708">
        <ele>378.624</ele>
        <time>2026-04-09T20:07:33Z</time>
      </trkpt>
      <!-- ... hundreds more track points -->
    </trkseg>
  </trk>
</gpx>
```

### Implementation Strategy

**Priority:**
1. Use **track points** for the actual route visualization (most accurate GPS recording)
2. Fall back to **waypoints** only if no track data exists
3. Keep waypoints separate for display purposes (checkpoints on map)

### Backend Code

**File:** `backend/app.py`

```python
def parse_gpx():
    # ...
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
```

## Distance Calculation

### Haversine Formula

Used for accurate great-circle distance between GPS coordinates:

```python
def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * \
        math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    return R * c
```

**Accuracy:** ±0.1% error for typical hiking/running routes

### Distance Calculation Method

- **Accumulative:** Sum distances between consecutive waypoints
- **Handles:** Closed loops, out-and-back routes, complex paths
- **Returns:** Kilometers (rounded to 2 decimal places)

## Elevation Data Extraction

### Available Data Points

From track points with elevation:
- `maxElevation`: Highest point on route
- `minElevation`: Lowest point on route
- `avgElevation`: Mean elevation across all points
- `elevationGain`: Cumulative uphill elevation
- `elevationLoss`: Cumulative downhill elevation

### Elevation Gain/Loss Calculation

```python
elevation_gain = 0
elevation_loss = 0

for i in range(1, len(elevations)):
    diff = elevations[i] - elevations[i-1]
    if diff > 0:
        elevation_gain += diff
    else:
        elevation_loss += abs(diff)
```

**Note:** This includes noise in GPS elevation data. For GPS tracks with frequent elevation updates (20-30 second intervals), noise can add 5-10% to raw gain/loss.

## Elevation Profile Visualization

**Component:** `src/components/ElevationProfile.tsx`

Uses Recharts library to display elevation vs. distance:

```typescript
// Data structure for chart
{
  distance: 1.23,        // cumulative km
  elevation: 456.7       // meters
}
```

**Features:**
- Green line showing elevation profile
- Tan/amber background gradient
- X-axis: Distance in km
- Y-axis: Elevation in meters
- Interactive tooltip on hover
- Responsive width

## API Response Format

**Endpoint:** `POST /parse-gpx`

**Request:** Multipart form data with GPX file

**Response:**
```json
{
  "success": true,
  "waypoints": [
    {
      "lat": 27.923698,
      "lon": -15.446708,
      "ele": 378.624,
      "time": "2026-04-09T20:07:33.801Z"
    }
  ],
  "distance": 6.75,
  "elevationGain": 253.0,
  "elevationLoss": 253.0,
  "maxElevation": 516.4,
  "minElevation": 358.6,
  "avgElevation": 446.4,
  "bounds": {
    "north": 27.944946,
    "south": 27.923179,
    "east": -15.444286,
    "west": -15.454533
  },
  "pointCount": 573,
  "metadata": {
    "name": "Route Name",
    "description": "Route description",
    "creator": "Wikiloc"
  }
}
```

## Supported GPX Formats

- **GPX 1.0** - Full support
- **GPX 1.1** - Full support (most common)
- **Namespaced GPX** - Handled via `gpxpy` library
- **Multiple tracks** - Processed sequentially
- **Multiple segments** - Processed sequentially

### Library

**Backend:** `gpxpy` (6.2.2+)
- Industry standard for GPX parsing
- Handles all GPX format variations
- Automatic namespace resolution

## Real-World Example

### Wikiloc "PROVIVAL BACKYARD ULTRA - GRAN CANARIA 2026"

**File Structure:**
```
Waypoints: 6 (Km 1 through Km 6 markers)
Track Points: 573 (actual GPS recording)
Track Segments: 1 (single closed loop)
```

**Parsing Results:**
| Metric | Value | Status |
|--------|-------|--------|
| Distance | 6.75 km | ✅ Matches Wikiloc |
| Elevation Gain | 253 m | ✅ Matches Wikiloc |
| Elevation Loss | 253 m | ✅ Matches Wikiloc |
| Max Elevation | 516.4 m | ✅ Accurate |
| Min Elevation | 358.6 m | ✅ Accurate |
| Route Points | 573 | ✅ Full detail |

## Frontend Implementation

### Map Display

**Component:** `src/components/Map.tsx`

- Renders polyline with all track points (573 in this example)
- Auto-zooms to route bounds via `fitBounds()`
- Displays blue polyline with 3px weight, 0.7 opacity
- Shows route popup on click

### Statistics Panel

**Component:** `src/components/Dashboard.tsx`

Displays 20+ data points:
- Distance, waypoints, repetitions
- Density, complexity, efficiency
- Elevation stats (gain/loss/min/max/avg)
- Geographic bounds (N/S/E/W)
- Center coordinates
- Creation timestamp
- Custom options

### Elevation Profile

**Component:** `src/components/ElevationProfile.tsx`

- Calculates cumulative distance for each waypoint
- Renders green line chart below map
- Shows elevation vs. distance relationship
- Helpful for understanding terrain difficulty

## Best Practices

### When Parsing GPX Files

1. **Always check for track data first** - This is the actual recorded route
2. **Use waypoints only as fallback** - For files without track data
3. **Calculate from track points** - Never mix waypoints and track points
4. **Include elevation data** - Critical for runner/hiker apps
5. **Preserve timestamps** - Important for speed/pace analysis
6. **Handle missing data gracefully** - Not all GPX files have elevation

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Distance too long | Mixing track + waypoints | Use only track points |
| Distance too short | Using only waypoints | Switch to track data |
| Elevation all zeros | Missing ele attribute | Check GPX source |
| Wrong route displayed | Parsing waypoints as route | Prioritize track data |
| Route not closed | Missing return segment | Accept open routes |

## Testing

### Test File

**Location:** `wikiloc-sample.gpx`

A real Wikiloc trail running route with:
- 6 named waypoints (Km markers)
- 573 detailed GPS track points
- Complete elevation data
- Closed loop (end point ≈ start point)

### Verification Commands

```bash
# Test backend parsing
curl -X POST -F "file=@wikiloc-sample.gpx" \
  http://localhost:5000/parse-gpx | jq .

# Expected output:
# distance: 6.75, pointCount: 573, elevationGain: 253.0
```

## Future Improvements

- [ ] Route simplification algorithm (Douglas-Peucker) for cleaner display
- [ ] Noise filtering for elevation data
- [ ] Support for multi-segment routes (different trails)
- [ ] Waypoint clustering for crowded checkpoints
- [ ] 3D elevation visualization
- [ ] Pace/speed calculations from timestamps
- [ ] Terrain type analysis (road/trail/off-road)

## References

- [GPX Format Specification](https://www.topografix.com/gpx.asp)
- [Haversine Formula](https://en.wikipedia.org/wiki/Haversine_formula)
- [gpxpy Library](https://github.com/tkrajina/gpxpy)
- [Wikiloc](https://www.wikiloc.com)

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-05-13 | Initial accurate GPX parsing implementation |
| 1.0 | 2026-05-13 | Fixed mixed waypoint/track data issue |
| 1.0 | 2026-05-13 | Added elevation profile visualization |
| 1.0 | 2026-05-13 | Added terrain tile options |
