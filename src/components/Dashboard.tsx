import { useState, useRef } from 'react';
import { Route, Option } from '../types';
import { downloadGPX } from '../utils/gpxExport';
import { calculateStats } from '../utils/stats';
import { calcTiming, formatDuration, formatMmSs, parseMmSs } from '../utils/timeCalc';
import { useTexts } from '../contexts/TextContext';
import { useVisitors } from '../hooks/useVisitors';

export const Dashboard = ({
  routes,
  selectedRoute,
  onSelectRoute,
  updateRoute,
  deleteRoute,
}: {
  routes: Route[];
  selectedRoute?: Route;
  onSelectRoute: (route: Route) => void;
  updateRoute: (id: string, updates: Partial<Route>) => void;
  deleteRoute: (id: string) => void;
}) => {
  const { t } = useTexts();
  const visitors = useVisitors();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editRoute, setEditRoute] = useState<Route | null>(null);
  const [newOptions, setNewOptions] = useState<Option[]>([]);
  const [newOptionId, setNewOptionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [swiped, setSwiped] = useState<string | null>(null);
  const touchStart = useRef(0);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setProgress(0);
    setMessage(null);

    try {
      // Pre-check: validate file
      if (!file.name.endsWith('.gpx')) {
        throw new Error(t('errors.invalid_gpx'));
      }
      if (file.size > 50 * 1024 * 1024) {
        throw new Error(t('errors.file_too_large'));
      }

      setProgress(10); // File validated

      // Upload to Python backend for accurate parsing
      const formData = new FormData();
      formData.append('file', file);

      setProgress(30);

      const response = await fetch('/parse-gpx', {
        method: 'POST',
        body: formData,
      });

      setProgress(60);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t('errors.parse_failed'));
      }

      const rawText = await response.text();
      const data = JSON.parse(rawText);
      setProgress(80);

      // Create route from backend data
      const name = file.name.replace('.gpx', '');
      const waypoints = data.waypoints.map((w: any) => ({
        lat: w.lat,
        lon: w.lon,
        ele: w.ele
      }));

      const route = {
        id: Date.now().toString(),
        name: name || 'New Route',
        gpxData: 'backend-parsed',
        waypoints,
        distance: data.distance,
        repetitions: 0,
        elevationStats: {
          elevationGain: data.elevationGain,
          elevationLoss: data.elevationLoss,
          maxElevation: data.maxElevation,
          minElevation: data.minElevation,
          avgElevation: data.avgElevation,
        },
        options: {},
        createdAt: Date.now(),
      };

      setProgress(90);

      // Post-check: validate result
      if (!waypoints || waypoints.length === 0) {
        throw new Error(t('errors.no_waypoints'));
      }

      // Save route
      const updatedRoutes = [...routes, route];
      localStorage.setItem('routes', JSON.stringify(updatedRoutes));
      onSelectRoute(route);
      setProgress(100);

      setMessage({
        type: 'success',
        text: `✓ Loaded "${name}" (${route.waypoints.length} waypoints, ${route.distance.toFixed(1)} km)`,
      });

      setTimeout(() => {
        setMessage(null);
        setProgress(0);
      }, 4000);
    } catch (error) {
      const errorText = error instanceof Error ? error.message : t('errors.unknown_error');
      setMessage({
        type: 'error',
        text: `✗ ${errorText}`,
      });
      setProgress(0);
      console.error('GPX Upload Error:', error);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddOption = () => {
    if (!newOptionId.trim() || !editRoute) return;
    const option: Option = {
      id: newOptionId,
      label: newOptionId.replace(/_/g, ' '),
      type: 'text',
      value: '',
    };
    setNewOptions([...newOptions, option]);
    setNewOptionId('');
  };

  const handleSaveRoute = () => {
    if (!editRoute) return;
    // Save custom options as Option objects
    const opts = Object.fromEntries(newOptions.map(o => [o.id, o]));
    const updates = {
      name: editRoute.name,
      options: opts,
      repetitions: editRoute.repetitions,
      targetPace: editRoute.targetPace ?? '',
      startTime: editRoute.startTime ?? '',
      restTime: editRoute.restTime ?? '',
    };
    updateRoute(editRoute.id, updates);
    // Immediately sync selectedRoute with the updated values
    onSelectRoute({ ...editRoute, ...updates });
    setEditRoute(null);
    setNewOptions([]);
  };

  return (
    <div className="w-80 bg-gray-100 border-r border-gray-300 flex flex-col h-full overflow-hidden">
      {/* Upload */}
      <div className="p-4 border-b space-y-2">
        {/* Visitor stats */}
        <p className="text-[9px] text-gray-400 text-center leading-none tracking-tight">
          {visitors
            ? `${visitors.current} online · ${visitors.today} today · ${visitors.lifetime.toLocaleString()} total`
            : '· · ·'}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".gpx"
          onChange={handleFileUpload}
          className="hidden"
          disabled={loading}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />}
          {loading ? t('messages.loading') : t('buttons.upload')}
        </button>

        {/* Progress Bar */}
        {loading && progress > 0 && (
          <div className="space-y-1">
            <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 text-center">{Math.round(progress)}%</p>
          </div>
        )}

        {/* Status Messages */}
        {message && (
          <div
            className={`text-xs p-2 rounded ${
              message.type === 'success'
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-red-100 text-red-700 border border-red-300'
            }`}
          >
            {message.text}
          </div>
        )}
      </div>

      {/* Stats Panel */}
      {selectedRoute && (() => {
        const stats = calculateStats(selectedRoute.waypoints, selectedRoute.distance);
        const reps = selectedRoute.repetitions || 0;
        const totalDistance = reps > 0 ? stats.distance * reps : stats.distance;

        // Timing calculations
        const pace = selectedRoute.targetPace ?? '';
        const paceSecs = parseMmSs(pace);
        const hasTiming = paceSecs > 0;
        const timing = hasTiming
          ? calcTiming(selectedRoute.distance, reps, pace, selectedRoute.startTime ?? '', selectedRoute.restTime ?? '')
          : null;

        return (
          <div className="p-2 bg-blue-50 border-b max-h-48 overflow-y-auto text-xs space-y-1">
            <div className="font-bold text-blue-900">{t('analytics.title')}</div>
            <div className="grid grid-cols-3 gap-1 text-xs">
              <div>{t('analytics.lap_dist')} <span className="font-semibold">{stats.distance.toFixed(2)}km</span></div>
              <div>{t('analytics.points')} <span className="font-semibold">{stats.waypoints}</span></div>
              <div>{t('analytics.reps')} <span className="font-semibold">{reps}x</span></div>
              <div className="col-span-3 bg-blue-100 rounded px-1 py-0.5">
                {t('analytics.total')} <span className="font-bold text-blue-800">{totalDistance.toFixed(2)}km</span>
                {reps > 0 && <span className="text-blue-600 ml-1">({stats.distance.toFixed(2)} × {reps})</span>}
              </div>
              {timing && (
                <div className="col-span-3 bg-green-100 border border-green-300 rounded px-1 py-1 space-y-0.5">
                  <div className="font-bold text-green-900 text-xs mb-0.5">{t('analytics.timing_header')}</div>
                  <div className="grid grid-cols-3 gap-1">
                    <div>{t('analytics.pace')} <span className="font-semibold">{pace}/km</span></div>
                    <div>{t('analytics.lap_time')} <span className="font-semibold">{formatMmSs(timing.lapSecs)}</span></div>
                    {timing.restSecs > 0 && (
                      <div>{t('analytics.rest_total')} <span className="font-semibold">{formatDuration(timing.restSecs)}</span></div>
                    )}
                    <div className="col-span-3 text-green-800">
                      {t('analytics.total')} <span className="font-bold">{formatDuration(timing.totalSecs)}</span>
                      {selectedRoute.startTime && timing.finishTime && (
                        <span className="ml-2">
                          {t('analytics.start')} <span className="font-bold">{selectedRoute.startTime}</span>
                          {' → '}{t('analytics.finish')} <span className="font-bold">{timing.finishTime}</span>
                        </span>
                      )}
                      {!selectedRoute.startTime && (
                        <span className="text-green-600 ml-1">{t('analytics.set_start_time')}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <div>{t('labels.density')} <span className="font-semibold">{stats.avgWaypointDensity}/km</span></div>
              <div>{t('labels.complexity')} <span className="font-semibold">{stats.complexity}</span></div>
              <div>{t('labels.efficiency')} <span className="font-semibold">{stats.efficiency}%</span></div>
              <div>{t('analytics.start_lat')} <span className="font-semibold">{selectedRoute.waypoints[0]?.lat.toFixed(3)}</span></div>
              <div>{t('analytics.start_lon')} <span className="font-semibold">{selectedRoute.waypoints[0]?.lon.toFixed(3)}</span></div>
              <div>{t('analytics.end_lat')} <span className="font-semibold">{selectedRoute.waypoints[selectedRoute.waypoints.length-1]?.lat.toFixed(3)}</span></div>
              <div>{t('analytics.north')} <span className="font-semibold">{stats.bounds.n.toFixed(3)}</span></div>
              <div>{t('analytics.south')} <span className="font-semibold">{stats.bounds.s.toFixed(3)}</span></div>
              <div>{t('analytics.east')} <span className="font-semibold">{stats.bounds.e.toFixed(3)}</span></div>
              <div>{t('analytics.west')} <span className="font-semibold">{stats.bounds.w.toFixed(3)}</span></div>
              <div>{t('analytics.center_lat')} <span className="font-semibold">{stats.center.lat.toFixed(3)}</span></div>
              <div>{t('analytics.center_lon')} <span className="font-semibold">{stats.center.lon.toFixed(3)}</span></div>
              <div>{t('labels.est_speed')} <span className="font-semibold">{stats.speedIfKnown}</span></div>
              <div>Created: <span className="font-semibold">{new Date(selectedRoute.createdAt).toLocaleDateString()}</span></div>
              <div>Time: <span className="font-semibold">{new Date(selectedRoute.createdAt).toLocaleTimeString()}</span></div>
              <div>Name: <span className="font-semibold truncate">{selectedRoute.name}</span></div>
              <div>{t('analytics.custom')} <span className="font-semibold">{Object.keys(selectedRoute.options || {}).length} opts</span></div>
            </div>
          </div>
        );
      })()}

      {/* Route List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {routes.map(route => (
          <div
            key={route.id}
            onTouchStart={(e) => { touchStart.current = e.touches[0].clientX; }}
            onTouchEnd={(e) => {
              const diff = touchStart.current - e.changedTouches[0].clientX;
              if (diff > 50) setSwiped(route.id);
              else if (diff < -50) setSwiped(null);
            }}
            className="relative"
          >
            <div
              onClick={() => onSelectRoute(route)}
              className={`p-3 rounded cursor-pointer transition-transform ${
                swiped === route.id ? 'translate-x-0' : 'translate-x-0'
              } ${
                selectedRoute?.id === route.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-white hover:bg-gray-200'
              }`}
            >
              <div className="font-semibold text-sm">{route.name}</div>
              <div className="text-xs opacity-75">
                {route.repetitions > 0
                  ? `${(route.distance * route.repetitions).toFixed(1)} km total (${route.distance.toFixed(1)} × ${route.repetitions})`
                  : `${route.distance.toFixed(1)} km`}
              </div>
            </div>
            {swiped === route.id && (
              <button
                onClick={() => {
                  deleteRoute(route.id);
                  setSwiped(null);
                }}
                className="absolute right-0 top-0 h-full bg-red-500 text-white px-4 rounded flex items-center font-semibold"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Edit Panel */}
      {editRoute ? (
        <div className="p-4 border-t bg-white space-y-3 max-h-80 overflow-y-auto">
          <input
            type="text"
            value={editRoute.name}
            onChange={e => setEditRoute({ ...editRoute, name: e.target.value })}
            className="w-full px-2 py-1 border rounded text-sm"
            placeholder={t('labels.route_name')}
          />

          <div>
            <label className="block text-xs font-semibold mb-1">{t('labels.repetitions')}</label>
            <input
              type="number"
              value={editRoute.repetitions}
              onChange={e => setEditRoute({ ...editRoute, repetitions: parseInt(e.target.value) || 1 })}
              className="w-full px-2 py-1 border rounded text-sm"
              min="1"
            />
          </div>

          {/* Timing */}
          <div className="border-t pt-2 space-y-2">
            <div className="text-xs font-semibold text-green-700">⏱ Timing</div>
            <div className="flex items-center gap-2">
              <label className="text-xs w-24 shrink-0">{t('labels.target_pace')}</label>
              <input
                type="text"
                value={editRoute.targetPace ?? ''}
                onChange={e => setEditRoute({ ...editRoute, targetPace: e.target.value })}
                placeholder={t('placeholders.pace_format')}
                className="flex-1 px-2 py-1 border rounded text-sm font-mono"
              />
              <span className="text-xs text-gray-500">/km</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs w-24 shrink-0">{t('labels.start_time')}</label>
              <input
                type="text"
                value={editRoute.startTime ?? ''}
                onChange={e => setEditRoute({ ...editRoute, startTime: e.target.value })}
                placeholder={t('placeholders.time_format')}
                className="flex-1 px-2 py-1 border rounded text-sm font-mono"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs w-24 shrink-0">{t('labels.rest_per_lap')}</label>
              <input
                type="text"
                value={editRoute.restTime ?? ''}
                onChange={e => setEditRoute({ ...editRoute, restTime: e.target.value })}
                placeholder={t('placeholders.pace_format')}
                className="flex-1 px-2 py-1 border rounded text-sm font-mono"
              />
            </div>
          </div>

          {/* Elevation Stats (Read-Only) */}
          {editRoute.elevationStats && (
            <div className="p-2 bg-gray-50 rounded text-xs">
              <div className="font-semibold mb-1">{t('labels.elevation_stats')}</div>
              <div className="grid grid-cols-2 gap-1 text-xs text-gray-700">
                <div>{t('labels.elevation_gain')}: <span className="font-mono">{editRoute.elevationStats.elevationGain.toFixed(0)}m</span></div>
                <div>{t('labels.elevation_loss')}: <span className="font-mono">{editRoute.elevationStats.elevationLoss.toFixed(0)}m</span></div>
                <div>{t('labels.elevation_max')}: <span className="font-mono">{editRoute.elevationStats.maxElevation.toFixed(0)}m</span></div>
                <div>{t('labels.elevation_min')}: <span className="font-mono">{editRoute.elevationStats.minElevation.toFixed(0)}m</span></div>
              </div>
            </div>
          )}

          {/* Custom Options */}
          <div className="text-xs font-semibold">{t('labels.custom_options')}</div>
          {newOptions.map((opt, i) => (
            <div key={opt.id} className="space-y-1">
              <label className="text-xs text-gray-600">{opt.label}</label>
              <input
                type={opt.type === 'number' ? 'number' : 'text'}
                value={String(opt.value)}
                onChange={e => {
                  const updated = [...newOptions];
                  updated[i].value = opt.type === 'number' ? parseFloat(e.target.value) : e.target.value;
                  setNewOptions(updated);
                }}
                placeholder={opt.label}
                className="w-full px-2 py-1 border rounded text-sm"
              />
            </div>
          ))}

          <div className="flex gap-2">
            <input
              type="text"
              value={newOptionId}
              onChange={e => setNewOptionId(e.target.value)}
              placeholder={t('placeholders.custom_option')}
              className="flex-1 px-2 py-1 border rounded text-xs"
            />
            <button
              onClick={handleAddOption}
              className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
            >
              {t('buttons.add')}
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSaveRoute}
              className="flex-1 px-2 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              {t('buttons.save')}
            </button>
            <button
              onClick={() => {
                setEditRoute(null);
                setNewOptions([]);
              }}
              className="flex-1 px-2 py-1 bg-gray-400 text-white rounded text-sm hover:bg-gray-500"
            >
              {t('buttons.cancel')}
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 border-t space-y-2">
          <button
            onClick={() => {
              if (selectedRoute) {
                setEditRoute(selectedRoute);
                // Load custom options (if they exist and are proper Option objects)
                const customOpts = selectedRoute.options
                  ? Object.entries(selectedRoute.options).map(([id, opt]) => {
                      // Handle both old format (raw values) and new format (Option objects)
                      if (typeof opt === 'object' && opt !== null && 'value' in opt) {
                        return opt as any;
                      } else {
                        // Old format - convert to new format
                        return {
                          id,
                          label: id.replace(/_/g, ' '),
                          type: typeof opt === 'number' ? 'number' : 'text',
                          value: opt,
                        };
                      }
                    })
                  : [];
                setNewOptions(customOpts);
              }
            }}
            disabled={!selectedRoute}
            className="w-full px-3 py-2 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 disabled:opacity-50"
          >
            {t('buttons.edit')}
          </button>
          <button
            onClick={() => {
              if (selectedRoute) downloadGPX(selectedRoute);
            }}
            disabled={!selectedRoute}
            className="w-full px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
          >
            {t('buttons.export')}
          </button>
          <button
            onClick={() => {
              if (selectedRoute) deleteRoute(selectedRoute.id);
            }}
            disabled={!selectedRoute}
            className="w-full px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:opacity-50"
          >
            {t('buttons.delete')}
          </button>
        </div>
      )}
    </div>
  );
};
