import { useState, useCallback } from 'react';
import { Route, Waypoint } from '../types';

export class GPXError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GPXError';
  }
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

const validateGPXData = (gpxData: string): void => {
  if (!gpxData || typeof gpxData !== 'string') {
    throw new GPXError('Invalid GPX data: empty or not a string');
  }
  if (gpxData.length < 50) {
    throw new GPXError('Invalid GPX data: file too small');
  }
  if (!gpxData.includes('<gpx') && !gpxData.includes('<trk')) {
    throw new GPXError('Invalid GPX format: missing required GPX elements');
  }
};

export const parseGPX = (gpxData: string): Waypoint[] => {
  validateGPXData(gpxData);

  const parser = new DOMParser();
  const doc = parser.parseFromString(gpxData, 'text/xml');

  // Check for parsing errors
  if (doc.getElementsByTagName('parsererror').length > 0) {
    throw new GPXError('Failed to parse GPX: XML syntax error');
  }

  const waypoints: Waypoint[] = [];

  // getElementsByTagName handles namespaced GPX correctly (ignores namespace prefix)
  const trkpts = doc.getElementsByTagName('trkpt');
  const wpts = doc.getElementsByTagName('wpt');

  for (let i = 0; i < trkpts.length; i++) {
    const pt = trkpts[i];
    const lat = parseFloat(pt.getAttribute('lat') || '');
    const lon = parseFloat(pt.getAttribute('lon') || '');
    if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      const eleEl = pt.getElementsByTagName('ele')[0];
      const ele = eleEl ? parseFloat(eleEl.textContent || '') : undefined;
      waypoints.push({ lat, lon, ...(ele != null && !isNaN(ele) ? { ele } : {}) });
    }
  }

  for (let i = 0; i < wpts.length; i++) {
    const pt = wpts[i];
    const lat = parseFloat(pt.getAttribute('lat') || '');
    const lon = parseFloat(pt.getAttribute('lon') || '');
    if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      const eleEl = pt.getElementsByTagName('ele')[0];
      const ele = eleEl ? parseFloat(eleEl.textContent || '') : undefined;
      waypoints.push({ lat, lon, ...(ele != null && !isNaN(ele) ? { ele } : {}) });
    }
  }

  if (waypoints.length === 0) {
    throw new GPXError('No valid waypoints found in GPX file');
  }

  return waypoints;
};

const calculateDistance = (waypoints: Waypoint[]): number => {
  let dist = 0;
  for (let i = 1; i < waypoints.length; i++) {
    dist += haversine(waypoints[i - 1].lat, waypoints[i - 1].lon, waypoints[i].lat, waypoints[i].lon);
  }
  return dist;
};

export const useGPX = () => {
  const [routes, setRoutes] = useState<Route[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('routes') || '[]');
    } catch {
      return [];
    }
  });

  const addRoute = useCallback((gpxData: string, name: string) => {
    const waypoints = parseGPX(gpxData);
    if (waypoints.length === 0) throw new Error('No waypoints found in GPX');

    const route: Route = {
      id: Date.now().toString(),
      name: name || 'New Route',
      gpxData,
      waypoints,
      distance: calculateDistance(waypoints),
      repetitions: 0,
      options: {},
      createdAt: Date.now(),
    };

    setRoutes(prev => {
      const updated = [...prev, route];
      localStorage.setItem('routes', JSON.stringify(updated));
      return updated;
    });
    return route;
  }, []);

  const updateRoute = useCallback((id: string, updates: Partial<Route>) => {
    setRoutes(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, ...updates } : r);
      localStorage.setItem('routes', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteRoute = useCallback((id: string) => {
    setRoutes(prev => {
      const updated = prev.filter(r => r.id !== id);
      localStorage.setItem('routes', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { routes, addRoute, updateRoute, deleteRoute };
};
