import { useRef, useEffect, useState } from 'react';
import { Waypoint } from '../types';
import { useTexts } from '../contexts/TextContext';
import { calculateGradient, gradientToColor } from '../utils/elevationColor';
import { distanceToCoordinate } from '../utils/waypointInterpolation';

const haversine = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return 2 * R * Math.asin(Math.sqrt(a));
};

interface DataPoint {
  distance: number;
  elevation: number;
  color: string;
}

interface TooltipInfo {
  x: number;
  y: number;
  distance: string;
  elevation: string;
}

interface HoverData {
  distance: number;  // km (actual hovered distance)
  elevation: number; // meters
  lat: number;       // interpolated coordinate
  lon: number;       // interpolated coordinate
}

const M = { top: 12, right: 14, left: 55, bottom: 36 };
const CHART_H = 160;

interface Props {
  waypoints: Waypoint[];
  onHover?: (data: HoverData | null) => void;
  mapHoverDistance?: number | null;
}

export const ElevationProfile = ({ waypoints, onHover, mapHoverDistance }: Props) => {
  const { t } = useTexts();
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [svgWidth, setSvgWidth] = useState(600);
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) setSvgWidth(containerRef.current.clientWidth);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  if (!waypoints || waypoints.length < 2) return null;

  // Cumulative distances
  const distances: number[] = [0];
  for (let i = 1; i < waypoints.length; i++) {
    distances.push(
      distances[i - 1] +
        haversine(waypoints[i - 1].lat, waypoints[i - 1].lon, waypoints[i].lat, waypoints[i].lon),
    );
  }

  // Build data points with gradient colours
  const data: DataPoint[] = waypoints.map((wp, i) => {
    const wpAny = wp as any;
    const elev =
      wpAny.ele !== undefined
        ? typeof wpAny.ele === 'number'
          ? wpAny.ele
          : parseFloat(wpAny.ele)
        : 0;

    let color = '#CCCCCC';
    if (i < waypoints.length - 1) {
      const wp2Any = waypoints[i + 1] as any;
      const ele1 =
        wpAny.ele !== undefined
          ? typeof wpAny.ele === 'number'
            ? wpAny.ele
            : parseFloat(wpAny.ele)
          : undefined;
      const ele2 =
        wp2Any.ele !== undefined
          ? typeof wp2Any.ele === 'number'
            ? wp2Any.ele
            : parseFloat(wp2Any.ele)
          : undefined;
      const gradient = calculateGradient(
        wp.lat, wp.lon, ele1,
        waypoints[i + 1].lat, waypoints[i + 1].lon, ele2,
      );
      color = gradientToColor(gradient);
    }

    return {
      distance: parseFloat(distances[i].toFixed(3)),
      elevation: Math.round(elev),
      color,
    };
  });

  const elevations = data.map(d => d.elevation);
  const minElev = Math.min(...elevations);
  const maxElev = Math.max(...elevations);
  const hasData = maxElev > minElev;

  const yDomainMin = hasData ? minElev - 20 : 0;
  const yDomainMax = hasData ? maxElev + 20 : 100;
  const xMax = data[data.length - 1].distance || 1;

  // Chart plot area
  const innerW = Math.max(10, svgWidth - M.left - M.right);
  const innerH = CHART_H - M.top - M.bottom;

  // Linear scale helpers
  const toX = (d: number) => M.left + (d / xMax) * innerW;
  const toY = (e: number) =>
    M.top + (1 - (e - yDomainMin) / (yDomainMax - yDomainMin)) * innerH;

  // Ticks
  const xTickCount = Math.max(2, Math.min(6, Math.floor(innerW / 70)));
  const xTicks = Array.from({ length: xTickCount + 1 }, (_, i) => (i / xTickCount) * xMax);
  const yTicks = Array.from({ length: 5 }, (_, i) =>
    yDomainMin + (i / 4) * (yDomainMax - yDomainMin),
  );

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const rect = svgEl.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (mx < M.left || mx > svgWidth - M.right || my < M.top || my > CHART_H - M.bottom) {
      setTooltip(null);
      onHover?.(null);
      return;
    }

    const hoveredDist = ((mx - M.left) / innerW) * xMax;
    let nearest = data[0];
    let minDiff = Infinity;
    for (const pt of data) {
      const diff = Math.abs(pt.distance - hoveredDist);
      if (diff < minDiff) { minDiff = diff; nearest = pt; }
    }

    setTooltip({
      x: mx,
      y: my,
      distance: nearest.distance.toFixed(2),
      elevation: String(nearest.elevation),
    });

    // Calculate interpolated coordinates for map hover marker
    const coords = distanceToCoordinate(hoveredDist, waypoints, xMax);
    if (coords && onHover) {
      onHover({
        distance: hoveredDist,
        elevation: nearest.elevation,
        lat: coords.lat,
        lon: coords.lon,
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full bg-gradient-to-b from-amber-50 to-amber-100 p-4 border-t border-gray-300"
    >
      <div className="text-xs font-semibold text-gray-700 mb-2">
        Elevation Profile{' '}
        {hasData
          ? `(${minElev.toFixed(0)}m – ${maxElev.toFixed(0)}m)`
          : t('messages.no_elevation')}
      </div>

      <div style={{ position: 'relative' }}>
        <svg
          ref={svgRef}
          width={svgWidth}
          height={CHART_H}
          style={{ display: 'block', userSelect: 'none' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setTooltip(null)}
        >
          {/* Horizontal grid lines */}
          {yTicks.map((tick, i) => (
            <line
              key={`yg${i}`}
              x1={M.left} y1={toY(tick)}
              x2={svgWidth - M.right} y2={toY(tick)}
              stroke="#d4a574" strokeDasharray="3 3" strokeWidth={0.8}
            />
          ))}

          {/* Vertical grid lines */}
          {xTicks.map((tick, i) => (
            <line
              key={`xg${i}`}
              x1={toX(tick)} y1={M.top}
              x2={toX(tick)} y2={CHART_H - M.bottom}
              stroke="#d4a574" strokeDasharray="3 3" strokeWidth={0.8}
            />
          ))}

          {/* Coloured elevation segments */}
          {data.map((pt, idx) => {
            if (idx === 0) return null;
            const prev = data[idx - 1];
            return (
              <line
                key={`s${idx}`}
                x1={toX(prev.distance)} y1={toY(prev.elevation)}
                x2={toX(pt.distance)}  y2={toY(pt.elevation)}
                stroke={pt.color}
                strokeWidth={2.5}
                strokeLinecap="round"
              />
            );
          })}

          {/* Y axis */}
          <line
            x1={M.left} y1={M.top}
            x2={M.left} y2={CHART_H - M.bottom}
            stroke="#aaa" strokeWidth={1}
          />
          {yTicks.map((tick, i) => (
            <g key={`yt${i}`}>
              <line
                x1={M.left - 4} y1={toY(tick)}
                x2={M.left}     y2={toY(tick)}
                stroke="#aaa" strokeWidth={1}
              />
              <text
                x={M.left - 6}
                y={toY(tick)}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize={10}
                fill="#666"
              >
                {Math.round(tick)}
              </text>
            </g>
          ))}
          {/* Y axis label */}
          <text
            x={11}
            y={M.top + innerH / 2}
            textAnchor="middle"
            fontSize={10}
            fill="#666"
            transform={`rotate(-90, 11, ${M.top + innerH / 2})`}
          >
            Elevation (m)
          </text>

          {/* X axis */}
          <line
            x1={M.left} y1={CHART_H - M.bottom}
            x2={svgWidth - M.right} y2={CHART_H - M.bottom}
            stroke="#aaa" strokeWidth={1}
          />
          {xTicks.map((tick, i) => (
            <g key={`xt${i}`}>
              <line
                x1={toX(tick)} y1={CHART_H - M.bottom}
                x2={toX(tick)} y2={CHART_H - M.bottom + 4}
                stroke="#aaa" strokeWidth={1}
              />
              <text
                x={toX(tick)}
                y={CHART_H - M.bottom + 14}
                textAnchor="middle"
                fontSize={10}
                fill="#666"
              >
                {tick < 1 ? tick.toFixed(2) : tick.toFixed(1)}
              </text>
            </g>
          ))}
          {/* X axis label */}
          <text
            x={M.left + innerW / 2}
            y={CHART_H - 3}
            textAnchor="middle"
            fontSize={10}
            fill="#666"
          >
            Distance (km)
          </text>

          {/* Tooltip crosshair */}
          {tooltip && (
            <line
              x1={tooltip.x} y1={M.top}
              x2={tooltip.x} y2={CHART_H - M.bottom}
              stroke="#666" strokeWidth={1} strokeDasharray="3 3"
              pointerEvents="none"
            />
          )}

          {/* Map hover marker */}
          {mapHoverDistance !== undefined && mapHoverDistance !== null && (() => {
            let markerElevation: number | undefined;
            for (const pt of data) {
              if (Math.abs(pt.distance - mapHoverDistance) < 0.01) {
                markerElevation = pt.elevation;
                break;
              }
            }
            if (markerElevation === undefined) {
              let nearest = data[0];
              let minDiff = Infinity;
              for (const pt of data) {
                const diff = Math.abs(pt.distance - mapHoverDistance);
                if (diff < minDiff) { minDiff = diff; nearest = pt; }
              }
              markerElevation = nearest.elevation;
            }
            return markerElevation !== undefined ? (
              <circle
                cx={toX(mapHoverDistance)}
                cy={toY(markerElevation)}
                r={10}
                fill="white"
                stroke="black"
                strokeWidth={1.5}
                pointerEvents="none"
              />
            ) : null;
          })()}
        </svg>

        {/* Tooltip popup */}
        {tooltip && (
          <div
            style={{
              position: 'absolute',
              top: Math.max(4, tooltip.y - 50),
              left: tooltip.x < svgWidth / 2 ? tooltip.x + 12 : tooltip.x - 115,
              background: '#fff',
              border: '1px solid #ccc',
              borderRadius: 4,
              padding: '3px 8px',
              fontSize: 11,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
            }}
          >
            <div><strong>{tooltip.distance} km</strong></div>
            <div>Elevation: {tooltip.elevation} m</div>
          </div>
        )}
      </div>
    </div>
  );
};
