import { useState } from 'react';
import { Route } from '../types';
import { Map } from './Map';
import { MobileUploadModal } from './MobileUploadModal';
import { MobileInfoModal } from './MobileInfoModal';
import { MobileEditModal } from './MobileEditModal';
import { MobileRouteListModal } from './MobileRouteListModal';
import { downloadGPX } from '../utils/gpxExport';
import { useTexts } from '../contexts/TextContext';

interface HoverData {
  distance: number;
  elevation: number;
  lat: number;
  lon: number;
}

export const Mobile = ({
  routes,
  selectedRoute,
  onSelectRoute,
  updateRoute,
  hoverPosition,
  onHoverElevation,
  mapHoverDistance,
  onMapHover,
}: {
  routes: Route[];
  selectedRoute?: Route;
  onSelectRoute: (route: Route) => void;
  updateRoute: (id: string, updates: Partial<Route>) => void;
  hoverPosition?: { lat: number; lon: number } | null;
  onHoverElevation?: (data: HoverData | null) => void;
  mapHoverDistance?: number | null;
  onMapHover?: (distance: number | null) => void;
}) => {
  const { t } = useTexts();
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
            {t('buttons.back')}
          </button>
        )}
        {!(showInfo || showEdit || showUpload || showRouteList) && (
          <div className="w-10"></div>
        )}
        <h1 className="text-lg font-bold truncate flex-1 text-center px-2">
          {selectedRoute?.name || t('modals.select_route')}
        </h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Map Area (full screen with safe area padding) */}
      <div className="flex-1 relative overflow-hidden pb-safe">
        <Map
          routes={routes}
          selectedRoute={selectedRoute}
          hoverPosition={hoverPosition}
          onHoverElevation={onHoverElevation}
          mapHoverDistance={mapHoverDistance}
          onMapHover={onMapHover}
        />

        {/* Floating Control Buttons (bottom-right, above elevation profile) */}
        <div className="absolute bottom-44 right-4 flex flex-col gap-3 items-end pointer-events-auto" style={{ zIndex: 1000 }}>
          {/* Route List Button */}
          <button
            onClick={() => setShowRouteList(!showRouteList)}
            className="w-20 h-20 rounded-full bg-gray-600 text-white shadow-xl flex items-center justify-center hover:bg-gray-700 active:scale-95 transition-transform text-3xl font-bold"
            title="Routes"
            aria-label="View route list"
          >
            {t('menu.routes')}
          </button>

          {/* Menu Button (Config) */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-20 h-20 rounded-full bg-blue-600 text-white shadow-xl flex flex-col items-center justify-center hover:bg-blue-700 active:scale-95 transition-transform gap-1"
            title="Menu"
            aria-label="Open menu"
          >
            <span className="text-3xl">⚙️</span>
            <span className="text-xs font-bold">MENU</span>
          </button>
        </div>

        {/* Dropdown Menu (positioned independently, appears above button) */}
        {isMenuOpen && (
          <div className="absolute bottom-64 right-4 bg-white rounded-lg shadow-xl border border-gray-200 min-w-max overflow-hidden pointer-events-auto" style={{ zIndex: 1001 }}>
            <button
              onClick={() => {
                setShowUpload(true);
                setIsMenuOpen(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-200 text-sm transition-colors"
            >
              {t('menu.load_gpx')}
            </button>
            <button
              onClick={() => {
                setShowInfo(true);
                setIsMenuOpen(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-200 text-sm transition-colors"
            >
              {t('menu.info_stats')}
            </button>
            <button
              onClick={() => {
                setShowEdit(true);
                setIsMenuOpen(false);
              }}
              disabled={!selectedRoute}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-200 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('menu.edit')}
            </button>
            <button
              onClick={() => {
                if (selectedRoute) downloadGPX(selectedRoute);
                setIsMenuOpen(false);
              }}
              disabled={!selectedRoute}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('menu.export')}
            </button>
          </div>
        )}
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
