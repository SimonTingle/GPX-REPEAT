export interface Waypoint {
  lat: number;
  lon: number;
  ele?: number;
}

export interface ElevationStats {
  elevationGain: number;
  elevationLoss: number;
  maxElevation: number;
  minElevation: number;
  avgElevation: number;
}

export interface Route {
  id: string;
  name: string;
  gpxData: string;
  waypoints: Waypoint[];
  distance: number;
  repetitions: number;
  elevationStats?: ElevationStats;
  options?: Record<string, Option>;  // Custom user-added metadata
  createdAt: number;
  targetPace?: string;  // "MM:SS" per km
  startTime?: string;   // "HH:MM" wall-clock start
  restTime?: string;    // "MM:SS" rest between laps
}

export interface Option {
  id: string;
  label: string;
  type: 'text' | 'number' | 'toggle' | 'select';
  value: unknown;
  choices?: string[];
}

export type MapStyle = 'osm' | 'satellite' | 'terrain' | 'topo' | 'hybrid';
