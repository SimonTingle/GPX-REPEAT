import { Waypoint } from '../types';

/**
 * Finds the haversine distance between two coordinates.
 * Returns distance in kilometers.
 */
const haversine = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return 2 * R * Math.asin(Math.sqrt(a));
};

interface BoundingWaypoints {
  prevIndex: number;
  nextIndex: number;
  progress: number; // 0 = prevWaypoint, 1 = nextWaypoint
}

/**
 * Finds the two waypoints that bracket a given distance along the route.
 * Returns their indices and the fractional progress between them.
 *
 * @param targetDistance Distance in km along the route
 * @param cumulativeDistances Array where cumulativeDistances[i] = distance to waypoint i
 * @param waypoints Array of waypoints
 * @returns Object with prevIndex, nextIndex, and progress (0-1)
 */
export function findBoundingWaypoints(
  targetDistance: number,
  cumulativeDistances: number[],
  _waypoints?: Waypoint[]
): BoundingWaypoints {
  // Handle edge cases
  if (cumulativeDistances.length < 2 || targetDistance < 0) {
    return { prevIndex: 0, nextIndex: 1, progress: 0 };
  }

  if (targetDistance >= cumulativeDistances[cumulativeDistances.length - 1]) {
    // Distance exceeds total, return last two waypoints at progress=1
    const lastIdx = cumulativeDistances.length - 1;
    return { prevIndex: lastIdx - 1, nextIndex: lastIdx, progress: 1 };
  }

  // Find the segment containing targetDistance
  for (let i = 0; i < cumulativeDistances.length - 1; i++) {
    if (cumulativeDistances[i] <= targetDistance && targetDistance <= cumulativeDistances[i + 1]) {
      const segmentDist = cumulativeDistances[i + 1] - cumulativeDistances[i];
      const progress = segmentDist > 0 ? (targetDistance - cumulativeDistances[i]) / segmentDist : 0;
      return { prevIndex: i, nextIndex: i + 1, progress };
    }
  }

  // Fallback (shouldn't reach here)
  return { prevIndex: 0, nextIndex: 1, progress: 0 };
}

/**
 * Linearly interpolates between two waypoints.
 * Assumes straight-line path in lat/lon space (suitable for small distances).
 *
 * @param wp1 First waypoint
 * @param wp2 Second waypoint
 * @param progress Fractional progress: 0 = wp1, 1 = wp2
 * @returns Interpolated { lat, lon }
 */
export function interpolateCoordinate(
  wp1: Waypoint,
  wp2: Waypoint,
  progress: number
): { lat: number; lon: number } {
  return {
    lat: wp1.lat + (wp2.lat - wp1.lat) * progress,
    lon: wp1.lon + (wp2.lon - wp1.lon) * progress,
  };
}

/**
 * Builds a cumulative distance array from waypoints.
 * cumulativeDistances[i] = total distance traveled to reach waypoint i.
 *
 * @param waypoints Array of waypoints
 * @returns Array where index i corresponds to waypoint i
 */
export function buildCumulativeDistances(waypoints: Waypoint[]): number[] {
  const distances: number[] = [0];
  for (let i = 1; i < waypoints.length; i++) {
    distances.push(
      distances[i - 1] +
        haversine(
          waypoints[i - 1].lat,
          waypoints[i - 1].lon,
          waypoints[i].lat,
          waypoints[i].lon
        )
    );
  }
  return distances;
}

/**
 * Converts a distance value (km along the route) to interpolated lat/lon coordinates.
 * Returns null if the distance is out of range or waypoints are insufficient.
 *
 * @param targetDistance Distance in km along the route
 * @param waypoints Array of waypoints defining the route
 * @param totalDistance Total route distance in km (for validation)
 * @returns Object with { lat, lon } or null if out of range
 */
export function distanceToCoordinate(
  targetDistance: number,
  waypoints: Waypoint[],
  totalDistance: number
): { lat: number; lon: number } | null {
  // Validate inputs
  if (waypoints.length < 2 || targetDistance < 0 || targetDistance > totalDistance) {
    return null;
  }

  // Build cumulative distances
  const cumulativeDistances = buildCumulativeDistances(waypoints);

  // Find bounding waypoints
  const { prevIndex, nextIndex, progress } = findBoundingWaypoints(
    targetDistance,
    cumulativeDistances,
    waypoints
  );

  // Interpolate between them
  return interpolateCoordinate(waypoints[prevIndex], waypoints[nextIndex], progress);
}
