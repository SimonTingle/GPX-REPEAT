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

interface ColoredSegment {
  color: string;
  gradient: number;
  data: { distance: number; elevation: number }[];
}

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

  // Build elevation profile data
  const data = waypoints.map((wp, i) => {
    const wpAny = wp as any;
    const elev = wpAny.ele !== undefined ?
      (typeof wpAny.ele === 'number' ? wpAny.ele : parseFloat(wpAny.ele)) : 0;

    return {
      distance: parseFloat(distances[i].toFixed(2)),
      elevation: Math.round(elev),
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

  // Build colored segments: each segment is 2 consecutive waypoints
  const coloredSegments: ColoredSegment[] = [];
  for (let i = 0; i < waypoints.length - 1; i++) {
    const wp1 = waypoints[i];
    const wp2 = waypoints[i + 1];
    const wp1Any = wp1 as any;
    const wp2Any = wp2 as any;

    const ele1 = wp1Any.ele !== undefined ? (typeof wp1Any.ele === 'number' ? wp1Any.ele : parseFloat(wp1Any.ele)) : undefined;
    const ele2 = wp2Any.ele !== undefined ? (typeof wp2Any.ele === 'number' ? wp2Any.ele : parseFloat(wp2Any.ele)) : undefined;

    const gradient = calculateGradient(wp1.lat, wp1.lon, ele1, wp2.lat, wp2.lon, ele2);
    const color = gradientToColor(gradient);

    // Each segment contains 2 data points (from point i to point i+1)
    coloredSegments.push({
      color,
      gradient,
      data: [data[i], data[i + 1]],
    });
  }

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

          {/* Render colored segments as connected line segments */}
          {coloredSegments.map((segment, idx) => (
            <Line
              key={idx}
              data={segment.data}
              type="natural"
              dataKey="elevation"
              stroke={segment.color}
              dot={false}
              strokeWidth={2.5}
              isAnimationActive={false}
              connectNulls={true}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
