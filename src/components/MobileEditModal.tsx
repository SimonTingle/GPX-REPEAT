import { useState } from 'react';
import { Route } from '../types';
import { useTexts } from '../contexts/TextContext';

export const MobileEditModal = ({
  route,
  updateRoute,
  onClose,
}: {
  route: Route;
  updateRoute: (id: string, updates: Partial<Route>) => void;
  onClose: () => void;
}) => {
  const { t } = useTexts();
  const [editRoute, setEditRoute] = useState<Route>(route);

  const handleSave = () => {
    const updates = {
      name: editRoute.name,
      repetitions: editRoute.repetitions,
      targetPace: editRoute.targetPace ?? '',
      startTime: editRoute.startTime ?? '',
      restTime: editRoute.restTime ?? '',
    };
    updateRoute(editRoute.id, updates);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="sticky top-0 bg-white border-b p-4">
          <h2 className="text-xl font-bold">{t('modals.edit_route_title')}</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Route Name */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">{t('labels.route_name')}</label>
            <input
              type="text"
              value={editRoute.name}
              onChange={(e) => setEditRoute({ ...editRoute, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Repetitions */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">{t('labels.repetitions')}</label>
            <input
              type="number"
              value={editRoute.repetitions}
              onChange={(e) => setEditRoute({ ...editRoute, repetitions: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
          </div>

          {/* Target Pace */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">{t('labels.target_pace')} /km</label>
            <input
              type="text"
              value={editRoute.targetPace ?? ''}
              onChange={(e) => setEditRoute({ ...editRoute, targetPace: e.target.value })}
              placeholder={t('placeholders.pace_format')}
              className="w-full px-3 py-2 border border-gray-300 rounded hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          {/* Start Time */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">{t('labels.start_time')}</label>
            <input
              type="text"
              value={editRoute.startTime ?? ''}
              onChange={(e) => setEditRoute({ ...editRoute, startTime: e.target.value })}
              placeholder={t('placeholders.time_format')}
              className="w-full px-3 py-2 border border-gray-300 rounded hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          {/* Rest Time */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">{t('labels.rest_per_lap')}</label>
            <input
              type="text"
              value={editRoute.restTime ?? ''}
              onChange={(e) => setEditRoute({ ...editRoute, restTime: e.target.value })}
              placeholder={t('placeholders.pace_format')}
              className="w-full px-3 py-2 border border-gray-300 rounded hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          {/* Read-only stats */}
          {editRoute.elevationStats && (
            <div className="bg-gray-50 p-3 rounded text-sm space-y-2">
              <div className="font-semibold text-gray-700">Elevation Stats (read-only)</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-600">Gain:</span>
                  <span className="font-mono ml-1">{editRoute.elevationStats.elevationGain.toFixed(0)}m</span>
                </div>
                <div>
                  <span className="text-gray-600">Loss:</span>
                  <span className="font-mono ml-1">{editRoute.elevationStats.elevationLoss.toFixed(0)}m</span>
                </div>
                <div>
                  <span className="text-gray-600">Max:</span>
                  <span className="font-mono ml-1">{editRoute.elevationStats.maxElevation.toFixed(0)}m</span>
                </div>
                <div>
                  <span className="text-gray-600">Min:</span>
                  <span className="font-mono ml-1">{editRoute.elevationStats.minElevation.toFixed(0)}m</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4 flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-semibold"
          >
            {t('buttons.save')}
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
          >
            {t('buttons.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};
