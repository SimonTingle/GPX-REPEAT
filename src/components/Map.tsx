import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Popup, useMap } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';
import { useMapStyle } from '../hooks/useMapStyle';
import { ElevationProfile } from './ElevationProfile';
import { Route, MapStyle } from '../types';
import { generateColoredSegments } from '../utils/elevationColor';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons
// @ts-ignore - PNG assets don't have type declarations
import icon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore - PNG assets don't have type declarations
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import L from 'leaflet';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.setIcon(DefaultIcon);

const MapUpdater = ({ route }: { route?: Route }) => {
  const map = useMap();
  const hasZoomed = useRef(false);

  useEffect(() => {
    if (!route || route.waypoints.length === 0) return;

    try {
      // Calculate bounds from waypoints
      const lats = route.waypoints.map(w => w.lat);
      const lons = route.waypoints.map(w => w.lon);

      const south = Math.min(...lats);
      const north = Math.max(...lats);
      const west = Math.min(...lons);
      const east = Math.max(...lons);

      const bounds = new LatLngBounds([[south, west], [north, east]]);

      // Zoom to fit bounds with padding
      map.fitBounds(bounds, { padding: [50, 50] });
      hasZoomed.current = true;
    } catch (error) {
      console.error('Error zooming to bounds:', error);
    }
  }, [route, map]);

  return null;
};

export const Map = ({ routes, selectedRoute }: { routes: Route[]; selectedRoute?: Route }) => {
  const { style, setStyle, getTileUrl, getAttribution } = useMapStyle();

  const route = selectedRoute || routes[0];
  const center: [number, number] = route && route.waypoints.length > 0
    ? [route.waypoints[0].lat, route.waypoints[0].lon]
    : [20, 0];
  const polyline = route && route.waypoints.length > 0
    ? route.waypoints.map(w => [w.lat, w.lon] as [number, number])
    : [];

  const styleButtons: MapStyle[] = ['osm', 'satellite', 'terrain', 'topo', 'hybrid'];

  return (
    <div className="relative w-full h-full flex flex-col" style={{ touchAction: 'none' }}>
      <MapContainer
        center={center}
        zoom={13}
        className="w-full flex-1"
        dragging={true}
        touchZoom={true}
        doubleClickZoom={true}
        scrollWheelZoom={true}
      >
        <TileLayer url={getTileUrl()} attribution={getAttribution()} />
        <MapUpdater route={route} />
        {route && route.waypoints.length > 0 && (() => {
          const segments = generateColoredSegments(route.waypoints);
          return segments.map((seg, idx) => (
            <Polyline
              key={idx}
              positions={seg.coordinates}
              color={seg.color}
              weight={3}
              opacity={0.8}
            />
          ));
        })()}
        {polyline.length > 0 && (
          <Popup position={[polyline[0][0], polyline[0][1]]}>{route?.name || 'Route'}</Popup>
        )}
      </MapContainer>

      {/* Elevation Profile */}
      {route && route.waypoints.length > 0 && (
        <ElevationProfile waypoints={route.waypoints} />
      )}

      {!route && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded">
          <div className="bg-white px-4 py-3 rounded shadow text-center">
            <p className="text-gray-600">Select or upload a route to view</p>
          </div>
        </div>
      )}

      {/* Map style selector and elevation legend (bottom-left, away from zoom controls) */}
      <div className="absolute bottom-24 left-4 flex flex-col gap-3" style={{ zIndex: 9999 }}>
        {/* Map style buttons */}
        <div className="bg-white rounded shadow-lg flex gap-2 p-2">
          {styleButtons.map(s => (
            <button
              key={s}
              onClick={() => setStyle(s)}
              className={`px-3 py-1 text-sm rounded capitalize ${
                style === s ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Elevation gradient legend */}
        {route && route.waypoints.length > 0 && (
          <div
            className="bg-white rounded shadow-lg p-3 opacity-50 hover:opacity-100 transition-opacity duration-200"
            style={{ zIndex: 9998 }}
          >
            <div className="text-xs font-bold text-gray-700 mb-2">📈 Elevation Gradient</div>
            <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-2 rounded" style={{ backgroundColor: '#8B0000' }}></div>
              <span>Very steep uphill (11%+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-2 rounded" style={{ backgroundColor: '#FF4444' }}></div>
              <span>Steep uphill (7-10%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-2 rounded" style={{ backgroundColor: '#FFB3BA' }}></div>
              <span>Gentle uphill (1-3%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-2 rounded" style={{ backgroundColor: '#CCCCCC' }}></div>
              <span>Flat (±1%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-2 rounded" style={{ backgroundColor: '#87CEEB' }}></div>
              <span>Gentle downhill (1-3%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-2 rounded" style={{ backgroundColor: '#0047AB' }}></div>
              <span>Steep downhill (7-10%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-2 rounded" style={{ backgroundColor: '#00008B' }}></div>
              <span>Very steep downhill (11%+)</span>
            </div>
          </div>
          </div>
        )}
      </div>
    </div>
  );
};
