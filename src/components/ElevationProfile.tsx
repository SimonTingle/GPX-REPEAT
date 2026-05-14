import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Waypoint } from '../types';
import { useTexts } from '../contexts/TextContext';
import { calculateGradient, gradientToColor } from '../utils/elevationColor';

const haversine = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return 2 * R * Math.asin(Math.sqrt(a));
};

interface DataPoint {
  distance: number;
  elevation: number;
  color: string;
}

// Custom shape component that renders colored line segments
const ColoredLineShape = (props: any) => {
  const { points } = props;
  if (!points || points.length < 2) return null;

  // Draw line segments with colors from the data
  return (
    <g>
      {points.map((point: any, idx: number) => {
        if (idx === 0) return null;
        const prevPoint = points[idx - 1];
        const currentColor = point.payload?.color || '#16a34a';

        return (
          <line
            key={idx}
            x1={prevPoint.x}
            y1={prevPoint.y}
            x2={point.x}
            y2={point.y}
            stroke={currentColor}
            strokeWidth={2.5}
          />
        );
      })}
    </g>
  );
};

export const ElevationProfile = ({ waypoints }: { waypoints: Waypoint[] }) => {
  const { t } = useTexts();
  if (!waypoints || waypoints.length < 2) {
    return null;
  }

  // Calculate cumulative distance for each point
  const distances: number[] = [0];
  for (let i = 1; i < waypoints.length; i++) {
    const dist = haversine(
      waypoints[i - 1].lat,
      waypoints[i - 1].lon,
      waypoints[i].lat,
      waypoints[i].lon
    );
    distances.push(distances[i - 1] + dist);
  }

  // Build elevation profile data with color for each point based on gradient to next point
  const data: DataPoint[] = waypoints.map((wp, i) => {
    const wpAny = wp as any;
    const elev = wpAny.ele !== undefined ?
      (typeof wpAny.ele === 'number' ? wpAny.ele : parseFloat(wpAny.ele)) : 0;

    // Calculate gradient from this point to the next point (if not last point)
    let color = '#CCCCCC'; // default gray
    if (i < waypoints.length - 1) {
      const wp1Any = wp as any;
      const wp2Any = waypoints[i + 1] as any;
      const ele1 = wp1Any.ele !== undefined ? (typeof wp1Any.ele === 'number' ? wp1Any.ele : parseFloat(wp1Any.ele)) : undefined;
      const ele2 = wp2Any.ele !== undefined ? (typeof wp2Any.ele === 'number' ? wp2Any.ele : parseFloat(wp2Any.ele)) : undefined;

      const gradient = calculateGradient(wp.lat, wp.lon, ele1, waypoints[i + 1].lat, waypoints[i + 1].lon, ele2);
      color = gradientToColor(gradient);
    }

    return {
      distance: parseFloat(distances[i].toFixed(2)),
      elevation: Math.round(elev),
      color,
    };
  });

  // Get elevation range
  const elevations = data.map(d => d.elevation);
  const minElev = Math.min(...elevations);
  const maxElev = Math.max(...elevations);

  // If all zeros, show basic profile anyway
  const hasData = maxElev > minElev;

  const yDomain = hasData
    ? [minElev - 20, maxElev + 20]
    : [0, 100];

  return (
    <div className="w-full bg-gradient-to-b from-amber-50 to-amber-100 p-4 border-t border-gray-300">
      <div className="text-xs font-semibold text-gray-700 mb-2">
        Elevation Profile {hasData ? `(${minElev.toFixed(0)}m - ${maxElev.toFixed(0)}m)` : t('messages.no_elevation')}
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d4a574" />
          <XAxis
            dataKey="distance"
            label={{ value: 'Distance (km)', position: 'insideBottomRight', offset: -5, fontSize: 11 }}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            domain={yDomain}
            label={{ value: 'Elevation (m)', angle: -90, position: 'insideLeft', fontSize: 11 }}
            tick={{ fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px', fontSize: 12 }}
            formatter={(value: any) => {
              const num = typeof value === 'number' ? value : parseFloat(value);
              return `${num.toFixed(0)}m`;
            }}
            labelFormatter={(label) => `${parseFloat(label).toFixed(2)} km`}
          />

          {/* Use custom shape to render colored line segments */}
          <Line
            type="natural"
            dataKey="elevation"
            stroke="#16a34a"
            dot={false}
            strokeWidth={2.5}
            isAnimationActive={false}
            shape={<ColoredLineShape />}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
