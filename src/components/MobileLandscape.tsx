import { useState } from 'react';
import { Dashboard } from './Dashboard';
import { Map } from './Map';
import { ElevationProfile } from './ElevationProfile';
import { Route } from '../types';

interface HoverData {
  distance: number;
  elevation: number;
  lat: number;
  lon: number;
}

interface Props {
  routes: Route[];
  selectedRoute?: Route;
  onSelectRoute: (route: Route) => void;
  updateRoute: (id: string, updates: Partial<Route>) => void;
  deleteRoute: (id: string) => void;
  hoverPosition?: { lat: number; lon: number } | null;
  onHoverElevation?: (data: HoverData | null) => void;
  mapHoverDistance?: number | null;
  onMapHover?: (distance: number | null) => void;
}

const DRAWER_WIDTH = 300;

export const MobileLandscape = ({
  routes,
  selectedRoute,
  onSelectRoute,
  updateRoute,
  deleteRoute,
  hoverPosition,
  onHoverElevation,
  mapHoverDistance,
  onMapHover,
}: Props) => {
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [elevationOpen, setElevationOpen] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false);

  const handleSelectRoute = (route: Route) => {
    onSelectRoute(route);
    setDashboardOpen(false);
  };

  return (
    <div
      style={{
        width: '100dvw',
        height: '100dvh',
        position: 'relative',
        overflow: 'hidden',
        background: '#000',
      }}
    >
      {/* Full-screen Map — elevation and legend controlled via props */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <Map
          routes={routes}
          selectedRoute={selectedRoute}
          hoverPosition={hoverPosition}
          onHoverElevation={onHoverElevation}
          mapHoverDistance={mapHoverDistance}
          onMapHover={onMapHover}
          showElevation={false}
          showLegend={legendOpen}
          mobileFullscreen={true}
          hideZoom={true}
        />
      </div>

      {/* ── Left edge handle ── */}
      <button
        onClick={() => setDashboardOpen(o => !o)}
        style={{
          position: 'absolute',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 22,
          height: 72,
          background: 'rgba(255,255,255,0.22)',
          borderRadius: '0 10px 10px 0',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          cursor: 'pointer',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          touchAction: 'manipulation',
        }}
        aria-label={dashboardOpen ? 'Close dashboard' : 'Open dashboard'}
      >
        <span style={{ color: 'white', fontSize: 11, fontWeight: 'bold', lineHeight: 1 }}>
          {dashboardOpen ? '‹' : '›'}
        </span>
      </button>

      {/* ── Tap-outside backdrop (closes dashboard) ── */}
      {dashboardOpen && (
        <div
          onClick={() => setDashboardOpen(false)}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1040,
          }}
        />
      )}

      {/* ── Dashboard drawer (slides from left) ── */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: DRAWER_WIDTH,
          transform: dashboardOpen ? 'translateX(0)' : `translateX(-${DRAWER_WIDTH}px)`,
          transition: 'transform 220ms ease',
          background: 'rgba(15, 20, 35, 0.93)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 1050,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <Dashboard
          routes={routes}
          selectedRoute={selectedRoute}
          onSelectRoute={handleSelectRoute}
          updateRoute={updateRoute}
          deleteRoute={deleteRoute}
          isMobile={true}
        />
      </div>

      {/* ── Legend toggle button (top-right) ── */}
      <button
        onClick={() => setLegendOpen(o => !o)}
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 1100,
          background: legendOpen ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.28)',
          border: 'none',
          borderRadius: 8,
          padding: '6px 11px',
          color: legendOpen ? '#111' : 'white',
          fontSize: 12,
          fontWeight: '600',
          cursor: 'pointer',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          touchAction: 'manipulation',
          letterSpacing: '0.02em',
        }}
        aria-label={legendOpen ? 'Hide legend' : 'Show legend'}
      >
        ≡ Legend
      </button>

      {/* ── Elevation profile toggle button (bottom-right) ── */}
      <button
        onClick={() => setElevationOpen(o => !o)}
        style={{
          position: 'absolute',
          bottom: 16,
          right: 12,
          zIndex: 1100,
          background: elevationOpen ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.28)',
          border: 'none',
          borderRadius: 8,
          padding: '6px 11px',
          color: elevationOpen ? '#111' : 'white',
          fontSize: 12,
          fontWeight: '600',
          cursor: 'pointer',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          touchAction: 'manipulation',
          letterSpacing: '0.02em',
        }}
        aria-label={elevationOpen ? 'Hide elevation profile' : 'Show elevation profile'}
      >
        📈 Profile
      </button>

      {/* ── Elevation profile sheet (slides up from bottom) ── */}
      {selectedRoute && selectedRoute.waypoints.length > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            transform: elevationOpen ? 'translateY(0)' : 'translateY(100%)',
            transition: 'transform 220ms ease',
            background: 'rgba(15, 20, 35, 0.93)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            zIndex: 1050,
          }}
        >
          <ElevationProfile
            waypoints={selectedRoute.waypoints}
            onHover={onHoverElevation}
            mapHoverDistance={mapHoverDistance}
          />
        </div>
      )}
    </div>
  );
};
