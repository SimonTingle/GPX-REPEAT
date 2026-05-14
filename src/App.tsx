import { useState, useEffect } from 'react';
import { Map } from './components/Map';
import { Dashboard } from './components/Dashboard';
import { Mobile } from './components/Mobile';
import { useGPX } from './hooks/useGPX';
import { useIsMobile } from './hooks/useMediaQuery';
import { TextProvider } from './contexts/TextContext';

const AppContent = () => {
  const { routes, updateRoute, deleteRoute } = useGPX();
  const [selectedRoute, setSelectedRoute] = useState(routes[0]);
  const isMobile = useIsMobile();

  // Sync selectedRoute with updated route from useGPX
  useEffect(() => {
    if (selectedRoute && routes.length > 0) {
      const updatedRoute = routes.find(r => r.id === selectedRoute.id);
      if (updatedRoute && updatedRoute !== selectedRoute) {
        setSelectedRoute(updatedRoute);
      }
    }
  }, [routes]);

  // Render mobile or desktop layout based on viewport size
  if (isMobile) {
    return (
      <Mobile
        routes={routes}
        selectedRoute={selectedRoute}
        onSelectRoute={setSelectedRoute}
        updateRoute={updateRoute}
      />
    );
  }

  // Desktop layout
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
        <Map routes={routes} selectedRoute={selectedRoute} />
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
