import { useState } from 'react';
import { Route } from '../types';
import { Map } from './Map';
import { MobileUploadModal } from './MobileUploadModal';
import { MobileInfoModal } from './MobileInfoModal';
import { MobileEditModal } from './MobileEditModal';
import { MobileRouteListModal } from './MobileRouteListModal';
import { downloadGPX } from '../utils/gpxExport';

export const Mobile = ({
  routes,
  selectedRoute,
  onSelectRoute,
  updateRoute,
}: {
  routes: Route[];
  selectedRoute?: Route;
  onSelectRoute: (route: Route) => void;
  updateRoute: (id: string, updates: Partial<Route>) => void;
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showRouteList, setShowRouteList] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const handleCloseAllModals = () => {
    setShowInfo(false);
    setShowEdit(false);
    setShowUpload(false);
    setShowRouteList(false);
  };

  return (
    <div className="flex w-screen h-screen bg-white flex-col">
      {/* Header: Back button (conditional) + route name */}
      <div className="bg-blue-600 text-white p-2 flex items-center justify-between h-16 shrink-0">
        {(showInfo || showEdit || showUpload || showRouteList) && (
          <button
            onClick={handleCloseAllModals}
            className="p-2 hover:bg-blue-700 rounded transition-colors"
          >
            ← Back
          </button>
        )}
        {!(showInfo || showEdit || showUpload || showRouteList) && (
          <div className="w-10"></div>
        )}
        <h1 className="text-lg font-bold truncate flex-1 text-center px-2">
          {selectedRoute?.name || 'Select Route'}
        </h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Map Area (full screen) */}
      <div className="flex-1 relative overflow-hidden">
        <Map routes={routes} selectedRoute={selectedRoute} />

        {/* Floating Control Buttons (bottom-right) */}
        <div className="absolute bottom-6 right-6 z-50 flex flex-col gap-4 items-end">
          {/* Route List Button */}
          <button
            onClick={() => setShowRouteList(!showRouteList)}
            className="w-16 h-16 rounded-full bg-gray-600 text-white shadow-lg flex items-center justify-center hover:bg-gray-700 active:scale-95 transition-transform text-2xl font-bold"
            title="Routes"
            aria-label="View route list"
          >
            📋
          </button>

          {/* Menu Button (Config) */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-16 h-16 rounded-full bg-blue-600 text-white shadow-lg flex flex-col items-center justify-center hover:bg-blue-700 active:scale-95 transition-transform"
            title="Menu"
            aria-label="Open menu"
          >
            <span className="text-2xl">⚙️</span>
            <span className="text-xs font-bold">MENU</span>
          </button>

          {/* Dropdown Menu (appears above button) */}
          {isMenuOpen && (
            <div className="absolute bottom-20 right-0 bg-white rounded-lg shadow-xl border border-gray-200 min-w-max z-50 overflow-hidden">
              <button
                onClick={() => {
                  setShowUpload(true);
                  setIsMenuOpen(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-200 text-sm transition-colors"
              >
                📥 Load GPX
              </button>
              <button
                onClick={() => {
                  setShowInfo(true);
                  setIsMenuOpen(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-200 text-sm transition-colors"
              >
                ℹ️ Info & Stats
              </button>
              <button
                onClick={() => {
                  setShowEdit(true);
                  setIsMenuOpen(false);
                }}
                disabled={!selectedRoute}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-200 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✏️ Edit Route
              </button>
              <button
                onClick={() => {
                  if (selectedRoute) downloadGPX(selectedRoute);
                  setIsMenuOpen(false);
                }}
                disabled={!selectedRoute}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                📤 Export GPX
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Upload */}
      {showUpload && (
        <MobileUploadModal
          onClose={() => setShowUpload(false)}
          onUpload={(route) => {
            onSelectRoute(route);
            setShowUpload(false);
          }}
        />
      )}

      {/* Modal: Info & Stats */}
      {showInfo && (
        <MobileInfoModal
          route={selectedRoute}
          onClose={() => setShowInfo(false)}
        />
      )}

      {/* Modal: Edit */}
      {showEdit && selectedRoute && (
        <MobileEditModal
          route={selectedRoute}
          updateRoute={updateRoute}
          onClose={() => setShowEdit(false)}
        />
      )}

      {/* Modal: Route List */}
      {showRouteList && (
        <MobileRouteListModal
          routes={routes}
          selectedRoute={selectedRoute}
          onSelectRoute={(route) => {
            onSelectRoute(route);
            setShowRouteList(false);
          }}
          onClose={() => setShowRouteList(false)}
        />
      )}
    </div>
  );
};
