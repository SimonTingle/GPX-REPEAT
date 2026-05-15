# Changelog

All notable changes to this project will be documented in this file.

## [0.6.1] - 2026-05-15

### Fixed
- ensure /app/data directory exists in Docker image for persistent visitor data

## [0.6.0] - 2026-05-15

### Added
- mobile landscape shows scaled desktop; portrait shows rotate prompt

## [0.5.2] - 2026-05-15

### Fixed
- add write permissions to GitHub Actions workflow
- correct GitHub Actions workflow YAML syntax errors

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.0] - 2026-05-15

### Added
- **Multi-language support**: Full internationalization with 8 languages (English, Spanish, French, German, Italian, Portuguese, Japanese, Chinese)
- **Elevation gradient coloring**: Map polylines and elevation profile now display color-coded gradients (red for uphill, blue for downhill, gray for flat)
- **Mobile-responsive design**: Complete responsive UI from desktop to mobile portrait/landscape
- **Custom elevation profile visualization**: Pure SVG-based elevation chart with synchronized coloring
- **Pace-per-gradient legend**: Interactive legend showing adjusted running pace based on elevation steepness
- **Bidirectional hover markers**: Synchronized white hollow dot markers when hovering between map and elevation profile
- **Live visitor counter**: Real-time stats showing current viewers, today's visitors, and lifetime counts
- **Map style selector**: Support for OSM, Satellite, Terrain, Topo, and Hybrid map styles
- **Docker containerization**: Complete Docker and Docker Compose setup with persistent data volumes
- **CapRover deployment configuration**: Ready-to-deploy configuration for CapRover hosting
- **GPX file processing**: Support for GPX 1.0 and 1.1 formats with multi-lap route analysis
- **Rest time tracking**: Calculate rest intervals between laps with race timing analysis

### Fixed
- Elevation profile rendering with correct distance scaling (resolved Recharts x-axis compression issues)
- Elevation color synchronization across map, profile, and legend with accurate threshold boundaries
- Crypto.randomUUID fallback for HTTP contexts (Docker local development)
- Language dropdown z-index and mobile UI layout issues
- TypeScript strict mode compatibility for Docker builds
- Translation validation across all 8 languages

### Technical
- **Framework**: React 18.2.0 with TypeScript 5.0 strict mode
- **Map library**: Leaflet 4.2.1 with OpenStreetMap and satellite tile layers
- **Backend**: Flask 3.0.0 REST API for GPX processing
- **Styling**: Tailwind CSS 3.3 with responsive utilities
- **Build tool**: Vite 5.0 for optimized production builds
- **Charts**: Custom SVG rendering (replaced Recharts for elevation profiles)

### Notes
- This is version 0.5.0, reflecting a feature-rich beta status with multiple major features implemented
- All colors are synchronized and accurate across all visualizations
- The app is mobile-first with full responsive design support
- Development and deployment are fully containerized with Docker
