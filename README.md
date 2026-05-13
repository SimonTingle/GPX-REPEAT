# 🗺️ GPX Repeat — Multi-Lap Route Planner & Race Timing Tool

<div align="center">

![GPX Repeat Banner](https://img.shields.io/badge/GPX_Repeat-Route_Planner-blue?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyIDJDOC4xMyAyIDUgNS4xMyA1IDljMCA1LjI1IDcgMTMgNyAxM3M3LTcuNzUgNy0xM2MwLTMuODctMy4xMy03LTctN3ptMCA5LjVjLTEuMzggMC0yLjUtMS4xMi0yLjUtMi41czEuMTItMi41IDIuNS0yLjUgMi41IDEuMTIgMi41IDIuNS0xLjEyIDIuNS0yLjUgMi41eiIvPjwvc3ZnPg==)

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Flask](https://img.shields.io/badge/Flask-3.0.0-000000?style=flat-square&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org/)
[![gpxpy](https://img.shields.io/badge/gpxpy-1.6.2-orange?style=flat-square)](https://github.com/tkrajina/gpxpy)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9.4-199900?style=flat-square&logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![Recharts](https://img.shields.io/badge/Recharts-3.8.1-22B5BF?style=flat-square)](https://recharts.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](https://github.com/your-repo/pulls)
[![Open Source](https://img.shields.io/badge/Open-Source-red?style=flat-square&logo=opensourceinitiative&logoColor=white)](https://opensource.org/)
[![Build Status](https://img.shields.io/badge/Build-Passing-success?style=flat-square)](https://github.com/your-repo)
[![Code Style](https://img.shields.io/badge/Code_Style-TypeScript_Strict-blue?style=flat-square)](https://www.typescriptlang.org/tsconfig#strict)
[![Backend](https://img.shields.io/badge/Backend-Flask_REST_API-green?style=flat-square)](https://flask.palletsprojects.com/)
[![Storage](https://img.shields.io/badge/Storage-localStorage-purple?style=flat-square)](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
[![Maps](https://img.shields.io/badge/Maps-OpenStreetMap_%2B_Satellite-lightgrey?style=flat-square)](https://openstreetmap.org/)
[![Version](https://img.shields.io/badge/Version-0.0.1-informational?style=flat-square)](package.json)
[![Platform](https://img.shields.io/badge/Platform-Web_%2B_Mobile_Responsive-ff69b4?style=flat-square)](https://github.com/your-repo)

</div>

---

## 📖 Table of Contents

- [What is GPX Repeat?](#-what-is-gpx-repeat)
- [Why This App Exists](#-why-this-app-exists)
- [Features at a Glance](#-features-at-a-glance)
- [Architecture Overview](#-architecture-overview)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Using the App](#-using-the-app)
- [Route Analytics](#-route-analytics)
- [Timing Calculator](#-timing-calculator)
- [GPX Export with Physical Repetitions](#-gpx-export-with-physical-repetitions)
- [Map Styles](#-map-styles)
- [Elevation Profile](#-elevation-profile)
- [Backend API Reference](#-backend-api-reference)
- [Bugs Fixed — Full History](#-bugs-fixed--full-history)
- [Supported GPX Formats](#-supported-gpx-formats)
- [Contributing](#-contributing)
- [License](#-license)
- [Find This App](#-find-this-app--hashtags)

---

## 🏃 What is GPX Repeat?

**GPX Repeat** is a web-based tool for athletes, race directors, and coaches who plan **multi-lap running routes**. It is purpose-built for events like **Backyard Ultras**, circuit trail races, and any endurance event where a fixed loop is completed multiple times.

Upload any `.gpx` file from Wikiloc, Garmin, Strava, Komoot, or any GPS device. Set how many laps you plan to run, enter your target pace, start time, and rest period between laps — and GPX Repeat instantly calculates your total distance, total event duration, and predicted finish time.

When you are ready, export a **physically repeated GPX file** — meaning the track points are written out N times so your GPS watch, Garmin device, or any GPX-compatible app sees the full multi-lap route as one continuous track.

---

## 💡 Why This App Exists

Most GPS apps (Garmin Connect, Strava, Komoot, Wikiloc) let you view a single lap route. None of them let you simply say _"repeat this loop 17 times and calculate when I finish."_ 

For Backyard Ultra events in particular — where athletes run a ~6.7 km loop every hour — being able to:
- See the exact total distance across all laps
- Calculate finish time given a target pace and rest time
- Export a **physically looped GPX** for use in navigation apps

...is essential for race planning and crew coordination.

GPX Repeat fills this gap.

---

## ✨ Features at a Glance

| Feature | Description |
|---|---|
| 📂 **GPX Upload** | Upload any `.gpx` file up to 50 MB via drag-and-drop or file picker |
| 🗺️ **Interactive Map** | Full Leaflet map with auto-fit-to-bounds on route load |
| 🎨 **5 Map Styles** | OSM Street, Satellite, Terrain, Topo, Hybrid tile layers |
| 📈 **Elevation Profile** | Recharts line graph showing elevation vs. distance for the selected route |
| 📊 **Route Analytics** | 20+ live statistics: distance, waypoint density, complexity, bounds, center coordinates, efficiency score |
| 🔁 **Lap Repetition** | Set any number of repetitions — total distance updates everywhere instantly |
| ⏱️ **Timing Calculator** | Target pace (MM:SS/km) × laps + rest between laps → total duration and finish time |
| 🕐 **Start/Finish Time** | Enter a start time (HH:MM) to calculate predicted wall-clock finish time |
| 💾 **Persistent Storage** | All routes and settings saved to localStorage — survives page refresh |
| 📤 **Physical GPX Export** | Export repeats the track points N times in the file — your GPS device sees the full multi-lap route |
| 🔍 **Export Debugging** | Pre- and post-check logs in the browser console verify waypoint count and elevation tag integrity on every export |
| 📱 **Mobile-Friendly** | Touch swipe-to-delete on route cards; responsive layout |
| ✏️ **Route Editing** | Edit name, repetitions, timing fields, and custom key-value options |
| 🏔️ **Elevation Stats** | Min, max, average elevation; total gain and loss from the backend parser |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (React SPA)                      │
│                                                                 │
│  ┌──────────────┐    ┌───────────────┐    ┌──────────────────┐ │
│  │  Dashboard   │    │     Map       │    │ ElevationProfile │ │
│  │  (sidebar)   │    │  (Leaflet)    │    │   (Recharts)     │ │
│  │              │    │               │    │                  │ │
│  │ • Upload     │    │ • Polyline    │    │ • Elev vs dist   │ │
│  │ • Stats      │    │ • 5 tile      │    │ • Auto Y-scale   │ │
│  │ • Edit       │    │   styles      │    │ • Hover tooltip  │ │
│  │ • Timing     │    │ • fitBounds   │    │                  │ │
│  │ • Export     │    │               │    │                  │ │
│  └──────┬───────┘    └───────────────┘    └──────────────────┘ │
│         │                                                       │
│  ┌──────▼──────────────────┐    ┌──────────────────────────┐   │
│  │       useGPX (hook)     │    │     timeCalc.ts          │   │
│  │  • routes state         │    │  • parseMmSs / parseHhMm │   │
│  │  • updateRoute          │    │  • formatDuration        │   │
│  │  • deleteRoute          │    │  • calcTiming            │   │
│  │  • localStorage I/O     │    │  • formatFinishTime      │   │
│  └─────────────────────────┘    └──────────────────────────┘   │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │               localStorage  ("routes" key)             │    │
│  │  [ { id, name, waypoints[], distance, repetitions,     │    │
│  │      options{}, targetPace, startTime, restTime } ]    │    │
│  └────────────────────────────────────────────────────────┘    │
└────────────────────────────┬────────────────────────────────────┘
                             │ POST /parse-gpx (multipart)
                             │ (file upload only — no ongoing API calls)
                ┌────────────▼──────────────┐
                │    Flask Backend          │
                │    (localhost:5000)       │
                │                          │
                │  • gpxpy parses file      │
                │  • Extracts <trkpt> only  │
                │  • Haversine distance     │
                │  • Elevation gain/loss    │
                │  • Returns JSON payload   │
                └───────────────────────────┘
```

### Key Design Decisions

- **Single source of truth**: `useGPX()` is called exactly once in `App.tsx`. All child components receive `routes`, `updateRoute`, and `deleteRoute` as props. This prevents the dual-instance state divergence bug (see Bug #7 below).
- **Backend for parsing, frontend for everything else**: The Python backend handles GPX parsing because `gpxpy` correctly handles all GPX namespace variants, calculates accurate elevation gain/loss, and cleanly separates `<trk>` from `<wpt>` data. All other logic (stats, timing, export, map rendering) is pure frontend.
- **localStorage-only persistence**: No database, no authentication, no network dependency after the initial file parse. The app works offline once a route is loaded.

---

## 🛠️ Tech Stack

### Frontend

| Library | Version | Purpose |
|---|---|---|
| React | 18.2.0 | UI component framework |
| TypeScript | 5.0 | Static typing throughout |
| Vite | 5.0 | Dev server and production bundler |
| Tailwind CSS | 3.3 | Utility-first styling |
| Leaflet | 1.9.4 | Interactive map engine |
| react-leaflet | 4.2.1 | React bindings for Leaflet |
| Recharts | 3.8.1 | Elevation profile chart |

### Backend

| Library | Version | Purpose |
|---|---|---|
| Flask | 3.0.0 | REST API server |
| flask-cors | 4.0.0 | Cross-origin requests from Vite dev server |
| gpxpy | 1.6.2 | GPX file parsing (industry standard) |

### Map Tile Providers

| Style | Provider | Notes |
|---|---|---|
| OSM (Street) | OpenStreetMap | Default, free, no API key |
| Satellite | Esri World Imagery | Free, no API key |
| Terrain | Stamen Terrain | Free, no API key |
| Topo | OpenTopoMap | Free, no API key |
| Hybrid | Esri World Imagery + Labels | Free, no API key |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- pip

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/gpx-repeat.git
cd gpx-repeat
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Set Up the Python Backend

```bash
cd backend
python -m venv venv

# macOS / Linux
source venv/bin/activate

# Windows
venv\Scripts\activate

pip install -r requirements.txt
```

### 4. Start the Backend Server

```bash
# From the backend/ directory, with venv activated
python app.py
# Runs on http://localhost:5000
```

### 5. Start the Frontend Dev Server

```bash
# From the project root
npm run dev
# Runs on http://localhost:5173
```

### 6. Open in Browser

Navigate to `http://localhost:5173` and upload a `.gpx` file to get started.

### Build for Production

```bash
npm run build
# Output in dist/
```

---

## 📁 Project Structure

```
gpx-repeat/
├── backend/
│   ├── app.py                  # Flask REST API — GPX parsing endpoint
│   ├── requirements.txt        # Python dependencies
│   └── venv/                   # Python virtual environment (gitignored)
│
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx       # Left sidebar — upload, stats, edit, timing, export
│   │   ├── Map.tsx             # Leaflet map + tile switcher + bounds auto-zoom
│   │   └── ElevationProfile.tsx # Recharts elevation vs distance chart
│   │
│   ├── hooks/
│   │   ├── useGPX.ts           # Route state, localStorage I/O, CRUD operations
│   │   └── useMapStyle.ts      # Active tile layer state + tile URL/attribution getters
│   │
│   ├── types/
│   │   └── index.ts            # Route, Waypoint, Option, MapStyle interfaces
│   │
│   ├── utils/
│   │   ├── gpxExport.ts        # Generate & download repeated GPX with pre/post checks
│   │   ├── stats.ts            # calculateStats — 20+ route analytics
│   │   └── timeCalc.ts         # Pace/time utilities — parseMmSs, calcTiming, etc.
│   │
│   ├── App.tsx                 # Root — single useGPX instance, prop drilling
│   └── main.tsx                # Vite entry point
│
├── GPX_PARSING.md              # Technical documentation on GPX format handling
├── README.md                   # This file
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 📱 Using the App

### Step 1 — Upload a GPX File

Click **Upload GPX** in the left sidebar. Select any `.gpx` file from your device. The app:

1. Validates the file type and size (max 50 MB)
2. Sends the file to the Flask backend (`POST /parse-gpx`)
3. The backend parses track points using `gpxpy`, calculates distance using the Haversine formula, and returns elevation stats
4. The route is added to the list, the map zooms to its bounds, and the elevation profile is rendered below the map

A progress bar (0–100%) tracks each stage of the upload pipeline.

### Step 2 — Explore the Route

The map auto-zooms to fit the route. Use the tile switcher in the top-right corner to toggle between OSM, Satellite, Terrain, Topo, and Hybrid views. The elevation profile is rendered below the map showing elevation (metres) vs. cumulative distance (kilometres).

### Step 3 — Set Repetitions and Timing

Click **Edit** on any selected route. The edit panel lets you set:

| Field | Format | Example |
|---|---|---|
| Route name | Text | `Backyard Ultra Loop` |
| Repetitions | Integer | `17` |
| Target Pace | MM:SS/km | `07:30` |
| Start Time | HH:MM | `08:00` |
| Rest per Lap | MM:SS | `10:00` |

Click **Save**. The stats panel immediately updates with all derived timing values.

### Step 4 — Read Your Race Plan

The **⏱ Timing** block in the stats panel shows:

- **Pace**: your entered target pace
- **Lap time**: time to complete one lap at that pace
- **Rest total**: total accumulated rest across all lap gaps
- **Total duration**: full event time including all laps and rests
- **Start → Finish**: predicted wall-clock start and finish times

### Step 5 — Export Your GPX

Click **Export GPX**. The downloaded file contains the route's track points written **N times**, once per repetition, all in one continuous `<trkseg>`. Open it in Garmin Connect, Komoot, or any GPX app — it will show the full multi-lap route.

The filename format is `RouteName_x7.gpx` so you immediately know it contains 7 laps.

The browser console logs a full pre-check and post-check report for every export, verifying that the `<trkpt>` count and `<ele>` tag count exactly match expectations.

---

## 📊 Route Analytics

The **Route Analytics** panel is visible whenever a route is selected. It shows 20+ statistics calculated live from the route's waypoints:

| Stat | Description |
|---|---|
| **Lap dist** | Distance of one lap in kilometres |
| **Points** | Total number of GPS track points |
| **Reps** | Current repetitions setting |
| **Total** | Total distance = lap dist × reps |
| **Density** | Average waypoints per kilometre |
| **Complexity** | Low / Medium / High based on point count |
| **Efficiency** | Straight-line distance ÷ actual distance × 100% |
| **Start Lat/Lon** | Coordinates of the first track point |
| **End Lat** | Latitude of the final track point |
| **North/South/East/West** | Bounding box of the route |
| **Center Lat/Lon** | Geographic midpoint of the bounding box |
| **Est Speed** | Rough speed estimate in km/h |
| **Created / Time** | When the route was loaded into the app |
| **Name** | Route name |
| **Custom** | Count of user-defined custom option fields |

---

## ⏱️ Timing Calculator

The timing calculator is the core feature for race planning. All calculations are performed by `src/utils/timeCalc.ts` — a standalone module of pure functions with no React dependencies.

### Formulae

```
effectiveReps  = max(1, repetitions)      // treat 0 reps as 1 lap
lapSecs        = distance_km × parseMmSs(targetPace)
restGaps       = max(0, effectiveReps − 1)
restSecs       = parseMmSs(restTime) × restGaps
totalSecs      = (lapSecs × effectiveReps) + restSecs
finishMins     = parseHhMm(startTime) + floor(totalSecs ÷ 60)
finishTime     = finishMins wrapped to 24 h → "HH:MM"
```

### Example — Backyard Ultra Planning

- Route: 6.75 km loop
- Repetitions: 7
- Target Pace: `06:00` /km
- Start Time: `08:00`
- Rest per Lap: `05:00`

| Calculated Value | Result |
|---|---|
| Lap time | 40:30 (6.75 km × 360 s/km) |
| Rest gaps | 6 (between laps 1–2, 2–3, … 6–7) |
| Rest total | 30:00 (6 × 5 min) |
| Total duration | 5:13:30 |
| Finish time | 13:13 |

### Edge Cases Handled

| Situation | Behaviour |
|---|---|
| `targetPace` empty or `00:00` | Timing block hidden entirely |
| `restTime` empty | Rest = 0, rest row omitted from display |
| `startTime` empty | Finish time omitted; total duration still shown |
| `repetitions` = 0 | Treated as 1 lap for all timing calculations |
| Multi-day events | Finish time wraps past midnight correctly |

---

## 📤 GPX Export with Physical Repetitions

The export system (`src/utils/gpxExport.ts`) physically writes the route's track points N times into a single `<trkseg>` — rather than just duplicating a route reference. This means:

- Any GPX-capable app sees **one long continuous track**, not a looped reference
- Total track point count = `waypoints_per_lap × repetitions`
- Timestamps are sequential, incrementing 60 seconds per point, so the file has plausible timing across the entire event
- Elevation data (`<ele>` tags) is preserved on every repeated point
- The `<metadata>` block describes the total distance and repetition count

### Export Filename Convention

```
RouteName_x7.gpx      ← 7 repetitions
RouteName_x1.gpx      ← single lap (repetitions = 0 or 1)
```

### Browser Console Export Report

Every export prints a grouped report to the browser console:

```
[GPX Export] Pre-check
  Route name        : Backyard Ultra Loop
  Waypoints/lap     : 573
  Repetitions       : 7
  Expected trkpts   : 4011
  Distance/lap      : 6.75 km
  Total distance    : 47.25 km
  Points WITH ele   : 573 (100.0%)
  Points WITHOUT ele: 0
  Elevation range   : 358.6 m – 516.4 m

[GPX Export] Post-check
  Expected trkpts   : 4011
  Actual trkpts     : 4011
  TRKPT CHECK PASS ✓
  Expected <ele>    : 4011
  Actual <ele>      : 4011
  ELEVATION CHECK PASS ✓ all ele tags present across all reps
  GPX size          : 847.3 KB
```

---

## 🗺️ Map Styles

Five tile styles are available via buttons in the top-right corner of the map:

| Button | Style | Provider | Best For |
|---|---|---|---|
| **osm** | OpenStreetMap Street | OpenStreetMap | Urban routes, road navigation |
| **satellite** | Esri World Imagery | Esri | Trail visibility, terrain verification |
| **terrain** | Stamen Terrain | Stamen | Elevation shading, hill routes |
| **topo** | OpenTopoMap | OpenTopoMap | Contour lines, mountain routes |
| **hybrid** | Satellite + Labels | Esri | Best of both satellite and named features |

All tile providers are free to use with no API key required.

---

## 📈 Elevation Profile

The elevation profile is rendered below the map by `src/components/ElevationProfile.tsx` using Recharts.

- **X-axis**: Cumulative distance in kilometres
- **Y-axis**: Elevation in metres, auto-scaled to ±20 m beyond the actual min/max
- **Line**: Smooth natural curve in green (`#16a34a`)
- **Background**: Amber gradient to visually distinguish it from the map
- **Tooltip**: Shows exact distance and elevation on hover
- Elevation is extracted from the `ele` field on every waypoint
- If a route has no elevation data, the profile shows `(No elevation data)` and renders a flat baseline

---

## 🔌 Backend API Reference

The Flask backend runs on `http://localhost:5000`.

### `POST /parse-gpx`

Parses a GPX file and returns structured route data.

**Request**
```
Content-Type: multipart/form-data
Body: file=<gpx file>
```

**Response `200 OK`**
```json
{
  "success": true,
  "waypoints": [
    { "lat": 27.923698, "lon": -15.446708, "ele": 378.624, "time": "2026-04-09T20:07:33Z" }
  ],
  "distance": 6.75,
  "elevationGain": 253.0,
  "elevationLoss": 253.0,
  "maxElevation": 516.4,
  "minElevation": 358.6,
  "avgElevation": 446.4,
  "bounds": {
    "north": 27.944946,
    "south": 27.923179,
    "east": -15.444286,
    "west": -15.454533
  },
  "pointCount": 573,
  "metadata": {
    "name": "Route Name",
    "description": "Route description",
    "creator": "Wikiloc"
  }
}
```

**Response `400 Bad Request`**
```json
{ "error": "Error description" }
```

### `GET /health`

Health check endpoint.

**Response `200 OK`**
```json
{ "status": "ok" }
```

### Parsing Strategy

The backend uses a strict priority order to avoid distance inflation from mixing data types:

1. **Track points** (`<trkpt>` inside `<trk>`) — used if any tracks exist. These represent the actual GPS-recorded path and give accurate distance and elevation.
2. **Named waypoints** (`<wpt>`) — used only as a fallback when no track data is present. These are checkpoint markers, not route paths.

This is why GPX files from Wikiloc (which contain both `<wpt>` checkpoint markers _and_ `<trk>` GPS recordings) are parsed correctly at their true distance rather than an inflated figure.

---

## 🐛 Bugs Fixed — Full History

This section documents every significant bug discovered and resolved during development, in chronological order. Each entry describes the symptom, root cause, and fix applied.

---

### Bug 1 — Distance Inflation from Mixed GPX Data Types

**Symptom**: A Wikiloc route that should be 6.75 km was displayed as 10.91 km. The route on the map showed extra connecting lines that did not match the actual trail.

**Root Cause**: The initial GPX parser mixed `<wpt>` (named checkpoint markers, e.g. "Km 1" through "Km 6") and `<trkpt>` (the 573 actual GPS track points) into a single array and calculated distance across all of them combined.

**Fix**: The backend now checks `len(gpx_data.tracks) > 0` first and exclusively uses `<trkpt>` data from `<trk>` segments. Named `<wpt>` markers are only used as a fallback when absolutely no track data exists.

**Result**: Distance correctly calculated as 6.75 km, matching Wikiloc exactly.

---

### Bug 2 — Elevation Data Silently Dropped at Waypoint Mapping

**Symptom**: The elevation profile showed "No elevation data" even though the GPX file clearly had elevation values. The backend was returning `ele` values in the JSON response.

**Root Cause**: `Dashboard.tsx` mapped backend waypoints as:
```typescript
// BEFORE (broken)
waypoints = data.waypoints.map(w => ({ lat: w.lat, lon: w.lon }));
//                                                    ^^^ ele missing!
```
The `ele` field was simply never included in the mapped object. Every waypoint was stored as `{lat, lon}` with elevation silently discarded.

**Fix**:
```typescript
// AFTER (fixed)
waypoints = data.waypoints.map(w => ({ lat: w.lat, lon: w.lon, ele: w.ele }));
```

---

### Bug 3 — Exported GPX Had No Elevation Tags

**Symptom**: After exporting a GPX file and re-uploading it, the elevation profile was flat ("No elevation data"). The original uploaded file had full elevation data.

**Root Cause**: The initial `gpxExport.ts` generated `<trkpt>` entries without any `<ele>` child element:
```xml
<!-- BEFORE (broken output) -->
<trkpt lat="27.923" lon="-15.446">
  <time>2026-05-13T08:00:00.000Z</time>
</trkpt>
```

**Fix**: Added conditional `<ele>` tag emission:
```typescript
${wp.ele != null ? `<ele>${wp.ele}</ele>` : ''}
```
```xml
<!-- AFTER (correct output) -->
<trkpt lat="27.923" lon="-15.446">
  <ele>378.624</ele>
  <time>2026-05-13T08:00:00.000Z</time>
</trkpt>
```

---

### Bug 4 — `parseGPX` Frontend Fallback Dropped Elevation

**Symptom**: If the frontend's own `parseGPX` function in `useGPX.ts` was ever used (e.g., if the backend was unavailable), all elevation data would be lost.

**Root Cause**: The DOM-based XML parser pushed waypoints with no `ele` extraction:
```typescript
// BEFORE (broken)
waypoints.push({ lat, lon });  // no ele
```

**Fix**: Extract the `<ele>` child element and include it conditionally:
```typescript
// AFTER (fixed)
const eleEl = pt.getElementsByTagName('ele')[0];
const ele = eleEl ? parseFloat(eleEl.textContent || '') : undefined;
waypoints.push({ lat, lon, ...(ele != null && !isNaN(ele) ? { ele } : {}) });
```

---

### Bug 5 — Dead Code: Invalid CSS Selector Using XPath Syntax

**Symptom**: TypeScript error on `useGPX.ts` — `Property 'namedItem' is missing in type 'NodeListOf<Element>'`.

**Root Cause**: A fallback block used `querySelectorAll('[local-name()="trkpt"]')` which is XPath syntax, not CSS. CSS selectors do not support `local-name()`. The result would always be empty, and the return type `NodeListOf<Element>` was incompatible with the variable's declared type `HTMLCollectionOf<Element>`.

**Fix**: Removed the dead code block entirely. `getElementsByTagName()` already handles namespaced GPX documents correctly — the fallback was unnecessary.

---

### Bug 6 — Unused `saveRoutes` Causing TypeScript Warning

**Symptom**: TypeScript reported `'saveRoutes' is declared but its value is never read` in `useGPX.ts`.

**Root Cause**: A `saveRoutes` helper function was defined using `useCallback` but never called — each of `addRoute`, `updateRoute`, and `deleteRoute` wrote to `localStorage` directly.

**Fix**: Removed the unused `saveRoutes` declaration.

---

### Bug 7 — Dual `useGPX()` Instances: Save Did Not Update Stats

**Symptom**: After clicking Save in the edit panel, the Route Analytics stats panel did not update. Changing repetitions and clicking Save appeared to do nothing — the stats still showed the old values.

**Root Cause**: `useGPX()` was called in both `App.tsx` and `Dashboard.tsx`. React hooks create completely independent state instances per call site. When `Dashboard.tsx` called `updateRoute`, it updated `Dashboard`'s own private routes state — but `App.tsx` had its own separate routes state that was never updated. The map and stats panel read from `App`'s routes, not `Dashboard`'s.

```
App.tsx:          useGPX() → routes_A  ← map, stats read from here (stale)
Dashboard.tsx:    useGPX() → routes_B  ← updateRoute wrote here (never seen by App)
```

**Fix**: `useGPX()` is called exactly once, in `App.tsx`. `updateRoute` and `deleteRoute` are passed down to `Dashboard` as props. There is now a single source of truth.

```typescript
// App.tsx
const { routes, updateRoute, deleteRoute } = useGPX();

// Dashboard.tsx — no longer calls useGPX()
export const Dashboard = ({ routes, updateRoute, deleteRoute, ... }) => { ... }
```

---

### Bug 8 — `selectedRoute` Stale After Save

**Symptom**: Even after fixing Bug 7, clicking Save updated the route list but the selected route displayed in the stats panel still showed old values until the user clicked away and back.

**Root Cause**: `App.tsx` held `selectedRoute` as a separate `useState`. When `updateRoute` was called, it updated `routes` but `selectedRoute` was still pointing at the old object reference. The `useEffect` that synced `selectedRoute` from `routes` had no immediate effect because React batched the state update.

**Fix 1** — `handleSaveRoute` immediately calls `onSelectRoute` with the merged object:
```typescript
onSelectRoute({ ...editRoute, ...updates });
```

**Fix 2** — A `useEffect` in `App.tsx` syncs `selectedRoute` whenever `routes` changes:
```typescript
useEffect(() => {
  if (selectedRoute && routes.length > 0) {
    const updatedRoute = routes.find(r => r.id === selectedRoute.id);
    if (updatedRoute && updatedRoute !== selectedRoute) {
      setSelectedRoute(updatedRoute);
    }
  }
}, [routes]);
```

---

### Bug 9 — TypeScript Error: `unknown` Not Assignable to Input `value`

**Symptom**: Build error: `Type 'unknown' is not assignable to type 'string | number | readonly string[] | undefined'` in `Dashboard.tsx`.

**Root Cause**: Custom options are stored as `Record<string, unknown>`. When rendering the options list, `opt.value` (typed `unknown`) was passed directly as the `value` prop of an `<input>` element, which expects `string | number | ...`.

**Fix**: Explicitly cast to string at the render site:
```typescript
value={String(opt.value)}
```

---

### Bug 10 — GPX Export Not Physically Repeating the Route

**Symptom**: Exporting a route with 7 repetitions produced a GPX file with only one lap's worth of track points (573 points, not 4,011).

**Root Cause**: The export function iterated `route.waypoints.forEach(...)` exactly once, regardless of the `repetitions` setting. Repetitions only affected the metadata description text — not the actual track point output.

**Fix**: Wrapped the waypoint loop in a `for (let rep = 0; rep < reps; rep++)` outer loop, with a `globalIdx` counter for sequential timestamps across all repetitions:
```typescript
let globalIdx = 0;
for (let rep = 0; rep < reps; rep++) {
  route.waypoints.forEach(wp => {
    gpx += `<trkpt ...><time>${new Date(route.createdAt + globalIdx++ * 60000).toISOString()}</time></trkpt>`;
  });
}
```

---

### Bug 11 — Elevation Integrity Not Verified Across Repeated Laps

**Symptom**: No way to confirm that elevation data was preserved across all N repetitions in the exported file.

**Root Cause**: No post-export verification existed.

**Fix**: Added `<ele>` tag counting in the post-check:
```
Expected <ele>  : 4011   (573 points × 7 reps)
Actual <ele>    : 4011
ELEVATION CHECK PASS ✓
```

---

### Bug 12 — `localStorage` Auto-Clear Broke Route Loading

**Symptom**: All routes disappeared on every page load. The route list was always empty.

**Root Cause**: An early `useEffect` was added to clear `localStorage` on startup. It ran after `useGPX()` initialised from storage — so routes loaded, then the clear ran and immediately erased them, then the component re-rendered with an empty list.

**Fix**: Removed the auto-clear entirely. Routes persist correctly across sessions as intended.

---

## 📄 Supported GPX Formats

| Format | Support |
|---|---|
| GPX 1.0 | ✅ Full support |
| GPX 1.1 | ✅ Full support (most common) |
| Wikiloc exports | ✅ Tested and verified |
| Garmin Connect exports | ✅ Supported |
| Strava exports | ✅ Supported |
| Komoot exports | ✅ Supported |
| Files with both `<wpt>` and `<trk>` | ✅ Track prioritised, waypoints ignored |
| Files with `<trk>` only | ✅ |
| Files with `<wpt>` only | ✅ (fallback mode) |
| Multiple tracks / segments | ✅ Processed sequentially |
| Files without elevation | ✅ (elevation profile shows "(No elevation data)") |
| Files over 50 MB | ❌ Rejected at upload |
| Non-GPX files | ❌ Rejected at upload |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "Add your-feature-name"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please make sure TypeScript compiles without errors (`npx tsc --noEmit`) before submitting a PR.

### Ideas for Future Contributions

- [ ] Douglas-Peucker route simplification for cleaner map display
- [ ] Noise filtering for GPS elevation data
- [ ] 3D elevation visualization
- [ ] Pace/speed calculations from GPX timestamps
- [ ] GPX waypoint markers (checkpoints displayed on map)
- [ ] Multi-route comparison view
- [ ] Crew aid station time predictions per lap
- [ ] Dark mode
- [ ] PWA / offline-first support
- [ ] Import routes from Strava/Garmin API

---

## 📜 License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

```
MIT License

Copyright (c) 2026 GPX Repeat

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

## 🔍 Find This App — Hashtags

Search for this project, share your race plans, and connect with the endurance community using these tags:

**Race Formats**
`#backyardultra` `#backyardultrarunning` `#bigsdbackyard` `#letsbackyard` `#lasthuman` `#ultramarathon` `#ultrarunning` `#trailrunning` `#trailrace` `#circuitrun` `#laprunning` `#mountainrunning` `#nightrunning`

**Distances & Events**
`#5k` `#10k` `#halfmarathon` `#marathon` `#50k` `#100k` `#100miles` `#endurance` `#multisport` `#triathlon` `#cycling` `#hiking` `#fastpacking`

**GPX & Tech**
`#gpx` `#gpxfile` `#gpxeditor` `#gpxviewer` `#gpxtools` `#routeplanning` `#routeeditor` `#pacetracking` `#garmin` `#garminconnect` `#strava` `#stravatools` `#wikiloc` `#komoot` `#openstreetmap` `#runanalytics` `#runnersofinstagram`

**Running Community**
`#runningapp` `#runcommunity` `#runningcommunity` `#trailrunninglife` `#runnertools` `#raceplanning` `#raceday` `#crewlife` `#pacerunner` `#runcoach` `#runtraining` `#ultrarunner` `#runningnerds`

**Tech & Dev**
`#reactjs` `#typescript` `#flask` `#python` `#leafletjs` `#recharts` `#vite` `#tailwindcss` `#opensource` `#webdev` `#javascript` `#sportstech` `#fitnessapp` `#fitnesstech` `#runtech`

**Elevation & Terrain**
`#elevationprofile` `#mountainrace` `#corsaincollina` `#trailrunnerclub` `#vertical` `#climbingroutes` `#trailsofinstagram` `#hikingtrails` `#topomap` `#satellitemap`

---

<div align="center">

Made for runners, by runners. 🏔️

**[⬆ Back to Top](#️-gpx-repeat--multi-lap-route-planner--race-timing-tool)**

</div>
