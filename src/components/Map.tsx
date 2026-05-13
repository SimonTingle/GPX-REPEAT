import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Popup, useMap } from 'react-leaflet';
import { LatLngBounds, Map as LeafletMap } from 'leaflet';
import { useMapStyle } from '../hooks/useMapStyle';
import { ElevationProfile } from './ElevationProfile';
import { Route, MapStyle } from '../types';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
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
        {polyline.length > 0 && (
          <Polyline positions={polyline} color="blue" weight={3} opacity={0.7}>
            <Popup>{route?.name || 'Route'}</Popup>
          </Polyline>
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

      <div className="absolute top-4 right-4 bg-white rounded shadow-lg flex gap-2 p-2" style={{ zIndex: 9999 }}>
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
    </div>
  );
};
