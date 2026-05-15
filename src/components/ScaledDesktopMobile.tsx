import { useEffect, useState } from 'react';
import { Dashboard } from './Dashboard';
import { Map } from './Map';
import { Route } from '../types';

// Reference width the desktop layout renders at before scaling.
// All content is designed for this width; scale factor = availableWidth / REFERENCE_WIDTH.
const REFERENCE_WIDTH = 1024;

// Padding on every edge so no content clips at the screen boundary.
const BORDER = 10;

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

export const ScaledDesktopMobile = ({
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
  const [dims, setDims] = useState({
    w: window.innerWidth,
    h: window.innerHeight,
  });

  useEffect(() => {
    const handleChange = () =>
      setDims({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleChange);
    window.addEventListener('orientationchange', handleChange);
    return () => {
      window.removeEventListener('resize', handleChange);
      window.removeEventListener('orientationchange', handleChange);
    };
  }, []);

  // Available space inside the border
  const availW = dims.w - BORDER * 2;
  const availH = dims.h - BORDER * 2;

  // Uniform scale so the desktop fits exactly within available width
  const scale = availW / REFERENCE_WIDTH;

  // Inner div height: we want (refH * scale) === availH, so refH = availH / scale
  const refH = Math.round(availH / scale);

  return (
    // Outer shell — exactly fills the screen
    <div
      style={{
        width: dims.w,
        height: dims.h,
        background: '#1a1a2e', // dark navy border colour
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Inner viewport — 10px inset on all sides, clips any overflow */}
      <div
        style={{
          position: 'absolute',
          top: BORDER,
          left: BORDER,
          width: availW,
          height: availH,
          overflow: 'hidden',
          borderRadius: 6,
          boxShadow: '0 0 20px rgba(0,0,0,0.5)',
        }}
      >
        {/* Desktop layout rendered at reference width, then uniformly scaled down */}
        <div
          style={{
            width: REFERENCE_WIDTH,
            height: refH,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            // Disable pointer-events scaling issues by letting the browser handle it
          }}
        >
          {/* Exact same desktop layout as App.tsx — no changes to Dashboard or Map */}
          <div className="flex bg-white" style={{ width: REFERENCE_WIDTH, height: refH }}>
            <Dashboard
              routes={routes}
              selectedRoute={selectedRoute}
              onSelectRoute={onSelectRoute}
              updateRoute={updateRoute}
              deleteRoute={deleteRoute}
            />
            <div className="flex-1">
              <Map
                routes={routes}
                selectedRoute={selectedRoute}
                hoverPosition={hoverPosition}
                onHoverElevation={onHoverElevation}
                mapHoverDistance={mapHoverDistance}
                onMapHover={onMapHover}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
