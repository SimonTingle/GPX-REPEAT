import { useState, useRef } from 'react';
import { Route } from '../types';

export const MobileUploadModal = ({
  onClose,
  onUpload,
}: {
  onClose: () => void;
  onUpload: (route: Route) => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setProgress(0);
    setMessage(null);

    try {
      // Pre-check: validate file
      if (!file.name.endsWith('.gpx')) {
        throw new Error('File must be a .gpx file');
      }
      if (file.size > 50 * 1024 * 1024) {
        throw new Error('File size exceeds 50MB limit');
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
        throw new Error(error.error || 'Backend parsing failed');
      }

      const rawText = await response.text();
      const data = JSON.parse(rawText);
      setProgress(80);

      // Create route from backend data
      const name = file.name.replace('.gpx', '');
      const waypoints = data.waypoints.map((w: any) => ({
        lat: w.lat,
        lon: w.lon,
        ele: w.ele,
      }));

      const route: Route = {
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
        throw new Error('GPX file contains no valid waypoints');
      }

      // Save route to localStorage
      const existingRoutes = JSON.parse(localStorage.getItem('routes') || '[]');
      const updatedRoutes = [...existingRoutes, route];
      localStorage.setItem('routes', JSON.stringify(updatedRoutes));

      setProgress(100);
      setMessage({ type: 'success', text: `Loaded: ${name}` });

      // Wait a moment then call onUpload
      setTimeout(() => {
        onUpload(route);
      }, 500);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setMessage({ type: 'error', text: errorMsg });
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
        <h2 className="text-xl font-bold">Load GPX File</h2>

        {!loading && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".gpx"
              onChange={handleFileUpload}
              disabled={loading}
              className="w-full"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Choose File
            </button>
          </>
        )}

        {loading && (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </>
        )}

        {message && (
          <div
            className={`p-3 rounded text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex gap-2">
          {message?.type === 'success' ? (
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
