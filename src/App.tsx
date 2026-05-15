import { useState, useEffect } from 'react';
import { Map } from './components/Map';
import { Dashboard } from './components/Dashboard';
import { PortraitPrompt } from './components/PortraitPrompt';
import { MobileLandscape } from './components/MobileLandscape';
import { useGPX } from './hooks/useGPX';
import { useMobileOrientation } from './hooks/useMediaQuery';
import { TextProvider } from './contexts/TextContext';

const AppContent = () => {
  const { routes, updateRoute, deleteRoute } = useGPX();
  const [selectedRoute, setSelectedRoute] = useState(routes[0]);
  const [hoverPosition, setHoverPosition] = useState<{ lat: number; lon: number } | null>(null);
  const [mapHoverDistance, setMapHoverDistance] = useState<number | null>(null);
  const { isMobile, isPortrait, isLandscape } = useMobileOrientation();

  // Sync selectedRoute with updated route from useGPX
  useEffect(() => {
    if (selectedRoute && routes.length > 0) {
      const updatedRoute = routes.find(r => r.id === selectedRoute.id);
      if (updatedRoute && updatedRoute !== selectedRoute) {
        setSelectedRoute(updatedRoute);
      }
    }
  }, [routes]);

  // Portrait mobile → ask user to rotate
  if (isMobile && isPortrait) {
    return <PortraitPrompt />;
  }

  // Landscape mobile → exact desktop layout scaled to fit screen
  if (isMobile && isLandscape) {
    return (
      <MobileLandscape
        routes={routes}
        selectedRoute={selectedRoute}
        onSelectRoute={setSelectedRoute}
        updateRoute={updateRoute}
        deleteRoute={deleteRoute}
        hoverPosition={hoverPosition}
        onHoverElevation={(data) =>
          setHoverPosition(data ? { lat: data.lat, lon: data.lon } : null)
        }
        mapHoverDistance={mapHoverDistance}
        onMapHover={setMapHoverDistance}
      />
    );
  }

  // Desktop layout — completely unchanged
  return (
    <div className="flex w-screen h-screen bg-white">
      <Dashboard
        routes={routes}
        selectedRoute={selectedRoute}
        onSelectRoute={setSelectedRoute}
        updateRoute={updateRoute}
        deleteRoute={deleteRoute}
      />
      <div className="flex-1">
        <Map
          routes={routes}
          selectedRoute={selectedRoute}
          hoverPosition={hoverPosition}
          onHoverElevation={(data) =>
            setHoverPosition(data ? { lat: data.lat, lon: data.lon } : null)
          }
          mapHoverDistance={mapHoverDistance}
          onMapHover={setMapHoverDistance}
        />
      </div>
    </div>
  );
};

export const App = () => {
  return (
    <TextProvider>
      <AppContent />
    </TextProvider>
  );
};
