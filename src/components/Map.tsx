import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Popup, useMap } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';
import { useMapStyle } from '../hooks/useMapStyle';
import { useIsMobile } from '../hooks/useMediaQuery';
import { useTexts } from '../contexts/TextContext';
import { SUPPORTED_LANGUAGES } from '../constants/languages';
import type { LanguageCode } from '../constants/languages';
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
  const { t, currentLanguage, setLanguage, allLanguages } = useTexts();
  const isMobile = useIsMobile();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const languageMenuRef = useRef<HTMLDivElement>(null);

  // Close language menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setShowLanguageMenu(false);
      }
    };

    if (showLanguageMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLanguageMenu]);

  const route = selectedRoute || routes[0];
  const center: [number, number] = route && route.waypoints.length > 0
    ? [route.waypoints[0].lat, route.waypoints[0].lon]
    : [20, 0];
  const polyline = route && route.waypoints.length > 0
    ? route.waypoints.map(w => [w.lat, w.lon] as [number, number])
    : [];

  // Map style identifiers are not translatable text — they are fixed across all languages
  const styleButtons: MapStyle[] = ['osm', 'satellite', 'terrain', 'topo', 'hybrid'];

  // Responsive positioning: desktop top-right, mobile bottom-left (above elevation profile)
  const controlPosition = isMobile ? 'bottom-24 left-4' : 'top-4 right-4';

  // Handle language selection
  const handleLanguageSelect = (lang: LanguageCode) => {
    setLanguage(lang);
    setShowLanguageMenu(false);
  };

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

      {/* Map style selector and language selector (responsive positioning) */}
      <div className={`absolute flex flex-col gap-3 pointer-events-auto ${controlPosition}`} style={{ zIndex: 1000 }}>
        {/* Map style buttons and language selector container */}
        <div className="bg-white rounded shadow-lg flex gap-2 p-2">
          {/* Map style buttons */}
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

          {/* Language selector - divider */}
          <div className="w-px bg-gray-300 mx-1"></div>

          {/* Language selector trigger button */}
          <div className="relative" ref={languageMenuRef}>
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="w-10 h-10 rounded-full bg-white hover:bg-gray-50 active:scale-95 flex items-center justify-center text-sm font-bold text-gray-700 transition-all"
              title={`Current language: ${SUPPORTED_LANGUAGES[currentLanguage as LanguageCode].nativeName}`}
              aria-label="Change language"
            >
              {currentLanguage.toUpperCase()}
            </button>

            {/* Language dropdown menu */}
            {showLanguageMenu && (
              <div className="absolute top-full mt-1 left-0 bg-white/90 backdrop-blur-sm rounded shadow-lg p-2 flex flex-col gap-1 z-[9999]">
                {allLanguages.map((lang) => {
                  const langInfo = SUPPORTED_LANGUAGES[lang as LanguageCode];
                  return (
                    <button
                      key={lang}
                      onClick={() => handleLanguageSelect(lang as LanguageCode)}
                      className="w-8 h-8 rounded-full bg-transparent hover:bg-gray-100 active:scale-90 flex items-center justify-center text-base transition-all"
                      title={langInfo.nativeName}
                      aria-label={`Switch to ${langInfo.name}`}
                    >
                      {langInfo.flag}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Elevation gradient legend */}
        {route && route.waypoints.length > 0 && (
          <div
            className="bg-white rounded shadow-lg p-3 opacity-50 hover:opacity-100 transition-opacity duration-200 pointer-events-auto"
            style={{ zIndex: 1000 }}
          >
            <div className="text-xs font-bold text-gray-700 mb-2">{t('elevation.title')}</div>
            <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-2 rounded" style={{ backgroundColor: '#8B0000' }}></div>
              <span>{t('elevation.very_steep_up')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-2 rounded" style={{ backgroundColor: '#FF4444' }}></div>
              <span>{t('elevation.steep_up')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-2 rounded" style={{ backgroundColor: '#FFB3BA' }}></div>
              <span>{t('elevation.gentle_up')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-2 rounded" style={{ backgroundColor: '#CCCCCC' }}></div>
              <span>{t('elevation.flat')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-2 rounded" style={{ backgroundColor: '#87CEEB' }}></div>
              <span>{t('elevation.gentle_down')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-2 rounded" style={{ backgroundColor: '#0047AB' }}></div>
              <span>{t('elevation.steep_down')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-2 rounded" style={{ backgroundColor: '#00008B' }}></div>
              <span>{t('elevation.very_steep_down')}</span>
            </div>
          </div>
          </div>
        )}
      </div>
    </div>
  );
};
