import { useState, useEffect } from 'react';
import { Map } from './components/Map';
import { Dashboard } from './components/Dashboard';
import { useGPX } from './hooks/useGPX';

export const App = () => {
  const { routes, updateRoute, deleteRoute } = useGPX();
  const [selectedRoute, setSelectedRoute] = useState(routes[0]);

  // Sync selectedRoute with updated route from useGPX
  useEffect(() => {
    if (selectedRoute && routes.length > 0) {
      const updatedRoute = routes.find(r => r.id === selectedRoute.id);
      if (updatedRoute && updatedRoute !== selectedRoute) {
        setSelectedRoute(updatedRoute);
      }
    }
  }, [routes]);

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
