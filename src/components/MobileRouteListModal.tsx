import { Route } from '../types';

export const MobileRouteListModal = ({
  routes,
  selectedRoute,
  onSelectRoute,
  onClose,
}: {
  routes: Route[];
  selectedRoute?: Route;
  onSelectRoute: (route: Route) => void;
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto flex flex-col">
        <div className="sticky top-0 bg-white border-b p-4">
          <h2 className="text-xl font-bold">
            Routes ({routes.length})
          </h2>
        </div>

        {routes.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <p className="text-gray-600 text-center">No routes loaded yet</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto divide-y">
            {routes.map((route) => (
              <button
                key={route.id}
                onClick={() => onSelectRoute(route)}
                className={`w-full text-left p-4 transition-colors ${
                  selectedRoute?.id === route.id
                    ? 'bg-blue-50 border-l-4 border-blue-600'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="font-semibold text-gray-900 truncate">{route.name}</div>
                <div className="text-sm text-gray-600 space-y-1 mt-1">
                  <div>
                    <span className="text-gray-500">Distance: </span>
                    <span className="font-mono">{route.distance.toFixed(2)} km</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Waypoints: </span>
                    <span className="font-mono">{route.waypoints.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Reps: </span>
                    <span className="font-mono">{route.repetitions || 1}</span>
                  </div>
                  {route.elevationStats && (
                    <div>
                      <span className="text-gray-500">Elevation: </span>
                      <span className="font-mono">
                        +{route.elevationStats.elevationGain.toFixed(0)}m /
                        -{route.elevationStats.elevationLoss.toFixed(0)}m
                      </span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="sticky bottom-0 bg-white border-t p-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
