import { Route } from '../types';

export const generateGPX = (route: Route): string => {
  const escapeXml = (str: string) => str.replace(/[<>&'"]/g, c => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;'
  }[c] || c));

  const reps = route.repetitions > 0 ? route.repetitions : 1;
  const expectedTotal = route.waypoints.length * reps;

  // PRE-CHECK
  const withEle = route.waypoints.filter(wp => wp.ele != null).length;
  const withoutEle = route.waypoints.length - withEle;
  const elevations = route.waypoints.map(wp => wp.ele).filter((e): e is number => e != null);
  const minEle = elevations.length ? Math.min(...elevations) : null;
  const maxEle = elevations.length ? Math.max(...elevations) : null;

  console.group('[GPX Export] Pre-check');
  console.log('Route name        :', route.name);
  console.log('Waypoints/lap     :', route.waypoints.length);
  console.log('Repetitions       :', reps);
  console.log('Expected trkpts   :', expectedTotal);
  console.log('Distance/lap      :', route.distance.toFixed(2), 'km');
  console.log('Total distance    :', (route.distance * reps).toFixed(2), 'km');
  console.log('Points WITH ele   :', withEle, `(${((withEle / route.waypoints.length) * 100).toFixed(1)}%)`);
  console.log('Points WITHOUT ele:', withoutEle);
  if (minEle !== null && maxEle !== null) {
    console.log('Elevation range   :', minEle.toFixed(1), 'm –', maxEle.toFixed(1), 'm');
  } else {
    console.warn('PRE-CHECK WARN: no elevation data found — <ele> tags will be omitted');
  }
  if (route.waypoints.length === 0) {
    console.error('PRE-CHECK FAIL: no waypoints — export will be empty');
  }
  console.groupEnd();

  let gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="GPX Repeat - Route Editor" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${escapeXml(route.name)}</name>
    <desc>Edited route - Distance: ${route.distance.toFixed(2)} km x ${reps} reps = ${(route.distance * reps).toFixed(2)} km total</desc>
    <author>
      <name>GPX Repeat</name>
    </author>
    <time>${new Date(route.createdAt).toISOString()}</time>
  </metadata>
  <trk>
    <name>${escapeXml(route.name)}</name>
    <desc>${Object.entries(route.options).map(([k, v]) => `${k}: ${v}`).join(', ') || 'Custom route'}</desc>
    <trkseg>`;

  let globalIdx = 0;
  for (let rep = 0; rep < reps; rep++) {
    route.waypoints.forEach((wp) => {
      gpx += `
      <trkpt lat="${wp.lat}" lon="${wp.lon}">
        ${wp.ele != null ? `<ele>${wp.ele}</ele>` : ''}
        <time>${new Date(route.createdAt + globalIdx * 60000).toISOString()}</time>
      </trkpt>`;
      globalIdx++;
    });
  }

  gpx += `
    </trkseg>
  </trk>
  <wpt lat="${route.waypoints[0].lat}" lon="${route.waypoints[0].lon}">
    <name>Start</name>
    <sym>parking</sym>
  </wpt>
  <wpt lat="${route.waypoints[Math.floor(route.waypoints.length / 2)].lat}" lon="${route.waypoints[Math.floor(route.waypoints.length / 2)].lon}">
    <name>Midpoint (lap 1)</name>
    <sym>scenic</sym>
  </wpt>
</gpx>`;

  // POST-CHECK
  const actualTotal = (gpx.match(/<trkpt /g) || []).length;
  const actualEle = (gpx.match(/<ele>/g) || []).length;
  // ele tags appear inside trkpts AND in the two <wpt> blocks (which have no ele), so
  // expected ele count = withEle * reps  (only trkpts carry elevation)
  const expectedEle = withEle * reps;

  console.group('[GPX Export] Post-check');
  console.log('Expected trkpts   :', expectedTotal);
  console.log('Actual trkpts     :', actualTotal);
  if (actualTotal === expectedTotal) {
    console.log('TRKPT CHECK PASS ✓');
  } else {
    console.error('TRKPT CHECK FAIL ✗ expected', expectedTotal, 'got', actualTotal);
  }
  console.log('Expected <ele>    :', expectedEle);
  console.log('Actual <ele>      :', actualEle);
  if (actualEle === expectedEle) {
    console.log('ELEVATION CHECK PASS ✓ all ele tags present across all reps');
  } else if (actualEle === 0 && expectedEle === 0) {
    console.warn('ELEVATION CHECK WARN: no elevation data in source — exported without <ele>');
  } else {
    console.error('ELEVATION CHECK FAIL ✗ expected', expectedEle, 'ele tags, got', actualEle);
  }
  console.log('GPX size          :', (gpx.length / 1024).toFixed(1), 'KB');
  console.groupEnd();

  return gpx;
};

export const downloadGPX = (route: Route) => {
  const gpxContent = generateGPX(route);
  const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${route.name.replace(/\s+/g, '_')}_x${Math.max(1, route.repetitions)}.gpx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
