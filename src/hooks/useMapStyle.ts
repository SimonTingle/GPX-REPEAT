import { useState } from 'react';
import { MapStyle } from '../types';

export const useMapStyle = () => {
  const [style, setStyle] = useState<MapStyle>(() => {
    return (localStorage.getItem('mapStyle') as MapStyle) || 'osm';
  });

  const handleStyleChange = (newStyle: MapStyle) => {
    setStyle(newStyle);
    localStorage.setItem('mapStyle', newStyle);
  };

  const getTileUrl = () => {
    switch (style) {
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'terrain':
        return 'https://tile.opentopomap.org/{z}/{x}/{y}.png';
      case 'topo':
        return 'https://a.tile.opentopomap.org/{z}/{x}/{y}.png';
      case 'hybrid':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
      default:
        return 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
  };

  const getAttribution = () => {
    switch (style) {
      case 'satellite':
        return '&copy; Esri';
      case 'terrain':
        return '&copy; OpenTopoMap';
      case 'topo':
        return '&copy; OpenTopoMap | &copy; OpenStreetMap contributors';
      case 'hybrid':
        return '&copy; Esri';
      default:
        return '&copy; OpenStreetMap contributors';
    }
  };

  return { style, setStyle: handleStyleChange, getTileUrl, getAttribution };
};
