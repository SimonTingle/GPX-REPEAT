import { Route } from '../types';
import { calculateStats } from '../utils/stats';
import { useTexts } from '../contexts/TextContext';

export const MobileInfoModal = ({
  route,
  onClose,
}: {
  route?: Route;
  onClose: () => void;
}) => {
  const { t } = useTexts();

  if (!route) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <h2 className="text-xl font-bold mb-4">{t('modals.route_info_title')}</h2>
          <p className="text-gray-600 mb-4">No route selected</p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            {t('buttons.close')}
          </button>
        </div>
      </div>
    );
  }

  const stats = calculateStats(route.waypoints, route.distance);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold truncate">{route.name}</h2>
        </div>

        <div className="p-4 space-y-4">
          {/* Basic Info */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700">Route Details</h3>
            <div className="grid grid-cols-2 gap-2 text-sm bg-gray-50 p-3 rounded">
              <div>
                <div className="text-gray-600 text-xs">{t('labels.distance')}</div>
                <div className="font-mono font-semibold">{route.distance.toFixed(2)} km</div>
              </div>
              <div>
                <div className="text-gray-600 text-xs">{t('labels.waypoints')}</div>
                <div className="font-mono font-semibold">{route.waypoints.length}</div>
              </div>
              <div>
                <div className="text-gray-600 text-xs">{t('labels.repetitions')}</div>
                <div className="font-mono font-semibold">{route.repetitions || 1}</div>
              </div>
              <div>
                <div className="text-gray-600 text-xs">Created</div>
                <div className="font-mono font-semibold text-xs">
                  {new Date(route.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Elevation Stats */}
          {route.elevationStats && (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-700">Elevation</h3>
              <div className="grid grid-cols-2 gap-2 text-sm bg-orange-50 p-3 rounded">
                <div>
                  <div className="text-gray-600 text-xs">{t('labels.elevation_gain')}</div>
                  <div className="font-mono font-semibold">
                    {route.elevationStats.elevationGain.toFixed(0)} m
                  </div>
                </div>
                <div>
                  <div className="text-gray-600 text-xs">{t('labels.elevation_loss')}</div>
                  <div className="font-mono font-semibold">
                    {route.elevationStats.elevationLoss.toFixed(0)} m
                  </div>
                </div>
                <div>
                  <div className="text-gray-600 text-xs">{t('labels.elevation_max')}</div>
                  <div className="font-mono font-semibold">
                    {route.elevationStats.maxElevation.toFixed(0)} m
                  </div>
                </div>
                <div>
                  <div className="text-gray-600 text-xs">{t('labels.elevation_min')}</div>
                  <div className="font-mono font-semibold">
                    {route.elevationStats.minElevation.toFixed(0)} m
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Calculated Stats */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700">Statistics</h3>
            <div className="grid grid-cols-2 gap-2 text-sm bg-blue-50 p-3 rounded">
              <div>
                <div className="text-gray-600 text-xs">{t('labels.density')}</div>
                <div className="font-mono font-semibold">{stats.avgWaypointDensity} /km</div>
              </div>
              <div>
                <div className="text-gray-600 text-xs">{t('labels.complexity')}</div>
                <div className="font-mono font-semibold">{stats.complexity}</div>
              </div>
              <div>
                <div className="text-gray-600 text-xs">{t('labels.efficiency')}</div>
                <div className="font-mono font-semibold">{stats.efficiency}%</div>
              </div>
              <div>
                <div className="text-gray-600 text-xs">{t('labels.est_speed')}</div>
                <div className="font-mono font-semibold text-xs">{stats.speedIfKnown}</div>
              </div>
            </div>
          </div>

          {/* Location Bounds */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700">Location</h3>
            <div className="text-xs bg-gray-50 p-3 rounded font-mono space-y-1">
              <div>
                <span className="text-gray-600">Start: </span>
                {route.waypoints[0]?.lat.toFixed(3)}, {route.waypoints[0]?.lon.toFixed(3)}
              </div>
              <div>
                <span className="text-gray-600">Center: </span>
                {stats.center.lat.toFixed(3)}, {stats.center.lon.toFixed(3)}
              </div>
              <div>
                <span className="text-gray-600">Bounds: </span>
                N {stats.bounds.n.toFixed(2)} to S {stats.bounds.s.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Timing Info */}
          {route.targetPace && (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-700">Timing</h3>
              <div className="text-sm bg-green-50 p-3 rounded space-y-1">
                <div>
                  <span className="text-gray-600">Pace: </span>
                  <span className="font-mono">{route.targetPace} /km</span>
                </div>
                {route.startTime && (
                  <div>
                    <span className="text-gray-600">Start: </span>
                    <span className="font-mono">{route.startTime}</span>
                  </div>
                )}
                {route.restTime && (
                  <div>
                    <span className="text-gray-600">Rest: </span>
                    <span className="font-mono">{route.restTime} /lap</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            {t('buttons.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
