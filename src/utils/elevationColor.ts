import { Waypoint } from '../types';

/**
 * Calculate gradient (steepness) between two waypoints.
 * Uses haversine formula for horizontal distance, elevation difference for vertical.
 *
 * @returns gradient as percentage (positive = uphill, negative = downhill, 0 = flat or no elevation data)
 */
export function calculateGradient(
  lat1: number,
  lon1: number,
  ele1: number | undefined,
  lat2: number,
  lon2: number,
  ele2: number | undefined
): number {
  // No elevation data = flat (gray)
  if (ele1 === undefined || ele2 === undefined) {
    return 0;
  }

  // Haversine formula for horizontal distance in km
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.asin(Math.sqrt(a));
  const distanceKm = R * c;

  // Avoid division by zero for same-location waypoints
  if (distanceKm === 0) {
    return 0;
  }

  // Elevation change in meters, distance in meters
  const elevationChangeMm = ele2 - ele1;
  const distanceMeters = distanceKm * 1000;

  // Gradient as percentage
  const gradientPct = (elevationChangeMm / distanceMeters) * 100;

  return gradientPct;
}

/**
 * Map gradient percentage to a color (hex string).
 * Positive gradient (uphill) = rose → deep red
 * Negative gradient (downhill) = sky blue → deep blue
 * Zero gradient (flat) = gray
 */
export function gradientToColor(gradientPct: number): string {
  const absGradient = Math.abs(gradientPct);

  // Flat or very low gradient
  if (absGradient < 1) {
    return '#CCCCCC'; // Gray
  }

  if (gradientPct > 0) {
    // UPHILL: rose → deep red
    if (absGradient < 3) {
      return '#FFB3BA'; // Light rose
    } else if (absGradient < 6) {
      return '#FF7F80'; // Coral
    } else if (absGradient < 10) {
      return '#FF4444'; // Bright red
    } else {
      return '#8B0000'; // Deep crimson
    }
  } else {
    // DOWNHILL: sky blue → deep blue
    if (absGradient < 3) {
      return '#87CEEB'; // Sky blue
    } else if (absGradient < 6) {
      return '#4A90E2'; // Cornflower blue
    } else if (absGradient < 10) {
      return '#0047AB'; // Cobalt
    } else {
      return '#00008B'; // Navy blue
    }
  }
}

export interface ColoredSegment {
  coordinates: [number, number][]; // Array of [lat, lon] pairs for this polyline
  color: string;
  gradient: number; // For debugging/tooltip (average gradient for segment)
}

/**
 * Generate colored polyline segments from waypoints.
 * Groups consecutive segments with the same color to minimize DOM elements.
 * Instead of one polyline per segment, we group adjacent same-colored segments together.
 * This dramatically improves performance for large routes (1000+ waypoints).
 */
export function generateColoredSegments(waypoints: Waypoint[]): ColoredSegment[] {
  if (waypoints.length < 2) return [];

  const segments: ColoredSegment[] = [];
  let currentColor: string | null = null;
  let currentCoordinates: [number, number][] = [];
  let currentGradients: number[] = [];

  for (let i = 0; i < waypoints.length - 1; i++) {
    const wp1 = waypoints[i];
    const wp2 = waypoints[i + 1];

    const gradient = calculateGradient(wp1.lat, wp1.lon, wp1.ele, wp2.lat, wp2.lon, wp2.ele);
    const color = gradientToColor(gradient);

    // Start new polyline if color changes
    if (color !== currentColor && currentCoordinates.length > 0) {
      const avgGradient = currentGradients.length > 0
        ? currentGradients.reduce((a, b) => a + b) / currentGradients.length
        : 0;
      segments.push({
        coordinates: currentCoordinates,
        color: currentColor!,
        gradient: avgGradient,
      });
      currentCoordinates = [];
      currentGradients = [];
    }

    // Add first waypoint if starting new group
    if (currentCoordinates.length === 0) {
      currentCoordinates.push([wp1.lat, wp1.lon]);
    }
    // Add second waypoint
    currentCoordinates.push([wp2.lat, wp2.lon]);
    currentGradients.push(gradient);
    currentColor = color;
  }

  // Add final group
  if (currentCoordinates.length > 1) {
    const avgGradient = currentGradients.length > 0
      ? currentGradients.reduce((a, b) => a + b) / currentGradients.length
      : 0;
    segments.push({
      coordinates: currentCoordinates,
      color: currentColor!,
      gradient: avgGradient,
    });
  }

  return segments;
}
