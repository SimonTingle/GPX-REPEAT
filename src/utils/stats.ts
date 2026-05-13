import { Waypoint } from '../types';

export interface RouteStats {
  distance: number;
  waypoints: number;
  avgWaypointDensity: number;
  bounds: { n: number; s: number; e: number; w: number };
  center: { lat: number; lon: number };
  speedIfKnown: string;
  complexity: string;
  efficiency: number;
}

const haversine = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return 2 * R * Math.asin(Math.sqrt(a));
};

export const calculateStats = (waypoints: Waypoint[], distance: number): RouteStats => {
  if (waypoints.length === 0) {
    return {
      distance: 0,
      waypoints: 0,
      avgWaypointDensity: 0,
      bounds: { n: 0, s: 0, e: 0, w: 0 },
      center: { lat: 0, lon: 0 },
      speedIfKnown: 'N/A',
      complexity: 'N/A',
      efficiency: 0,
    };
  }

  const lats = waypoints.map(w => w.lat);
  const lons = waypoints.map(w => w.lon);

  const bounds = {
    n: Math.max(...lats),
    s: Math.min(...lats),
    e: Math.max(...lons),
    w: Math.min(...lons),
  };

  const centerLat = (bounds.n + bounds.s) / 2;
  const centerLon = (bounds.e + bounds.w) / 2;

  // Calculate straight-line distance for efficiency
  const straightLine = haversine(waypoints[0].lat, waypoints[0].lon, waypoints[waypoints.length - 1].lat, waypoints[waypoints.length - 1].lon);
  const efficiency = straightLine > 0 ? Math.round((straightLine / distance) * 100) : 100;

  return {
    distance,
    waypoints: waypoints.length,
    avgWaypointDensity: parseFloat((waypoints.length / distance).toFixed(2)),
    bounds,
    center: { lat: centerLat, lon: centerLon },
    speedIfKnown: `${(distance > 10 ? distance / 2 : distance).toFixed(1)} km/h est`,
    complexity: waypoints.length > 500 ? 'High' : waypoints.length > 200 ? 'Medium' : 'Low',
    efficiency,
  };
};
