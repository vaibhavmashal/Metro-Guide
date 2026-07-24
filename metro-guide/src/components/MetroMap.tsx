import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import maplibregl from 'maplibre-gl';
import { CITY_CONFIGS, type CityConfig } from '../data/cityData';
import { MAP_STYLES, LIGHTING_PRESETS, type SceneSettings } from '../utils/mapStyles';
import type { RouteResult } from '../utils/pathfinding';
import type { JourneyResult } from '../utils/journeyApi';
import { createThreeLayer } from './ThreeLayer';

export interface MetroMapHandle {
  getMap: () => maplibregl.Map | null;
  flyToStation: (stationId: string) => void;
  highlightRoute: (route: RouteResult | null) => void;
  showJourney: (journey: JourneyResult | null) => void;
  clearJourney: () => void;
}

interface MetroMapProps {
  mapStyle: string;
  settings: SceneSettings;
  selectedStation: string | null;
  onStationClick: (stationId: string) => void;
  onMapReady: (map: maplibregl.Map) => void;
  cityConfig?: CityConfig;
}

const MetroMap = forwardRef<MetroMapHandle, MetroMapProps>(
  ({ mapStyle, settings, selectedStation, onStationClick, onMapReady, cityConfig = CITY_CONFIGS.pune }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);
    const animFrameRef = useRef<number>(0);
    const trainMarkersRef = useRef<maplibregl.Marker[]>([]);
    const journeyMarkersRef = useRef<maplibregl.Marker[]>([]);
    const layersAddedRef = useRef(false);
    const prevStyleRef = useRef(mapStyle);
    const cityConfigRef = useRef(cityConfig);
    const prevCityIdRef = useRef(cityConfig.id);
    const currentJourneyRef = useRef<JourneyResult | null>(null);
    const currentRouteRef = useRef<RouteResult | null>(null);

    cityConfigRef.current = cityConfig;

    // ── Journey visualization helpers ──
    const clearJourneyLayers = useCallback(() => {
      const map = mapRef.current;
      if (!map) return;
      // Remove walking route layers
      ['journey-walk-src', 'journey-walk-dest', 'journey-walk-src-dash', 'journey-walk-dest-dash',
       'journey-metro-route', 'journey-metro-glow'].forEach(id => {
        if (map.getLayer(id)) map.removeLayer(id);
      });
      ['journey-walk-src', 'journey-walk-dest', 'journey-metro-route'].forEach(id => {
        if (map.getSource(id)) map.removeSource(id);
      });
      // Remove journey markers
      journeyMarkersRef.current.forEach(m => m.remove());
      journeyMarkersRef.current = [];
    }, []);

    const showJourneyOnMap = useCallback((journey: JourneyResult | null) => {
      const map = mapRef.current;
      if (!map) return;
      clearJourneyLayers();
      if (!journey) return;

      // Source walking route
      if (journey.source_walking.geometry.length >= 2) {
        map.addSource('journey-walk-src', {
          type: 'geojson',
          data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: journey.source_walking.geometry } },
        });
        map.addLayer({
          id: 'journey-walk-src-dash', type: 'line', source: 'journey-walk-src',
          paint: { 'line-color': '#4ade80', 'line-width': 3, 'line-dasharray': [2, 2], 'line-opacity': 0.8 },
        });
      }

      // Dest walking route
      if (journey.dest_walking.geometry.length >= 2) {
        map.addSource('journey-walk-dest', {
          type: 'geojson',
          data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: journey.dest_walking.geometry } },
        });
        map.addLayer({
          id: 'journey-walk-dest-dash', type: 'line', source: 'journey-walk-dest',
          paint: { 'line-color': '#f87171', 'line-width': 3, 'line-dasharray': [2, 2], 'line-opacity': 0.8 },
        });
      }

      // Metro route highlight
      if (journey.metro_route_coords.length >= 2) {
        map.addSource('journey-metro-route', {
          type: 'geojson',
          data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: journey.metro_route_coords } },
        });
        map.addLayer({
          id: 'journey-metro-glow', type: 'line', source: 'journey-metro-route',
          paint: { 'line-color': '#fbbf24', 'line-width': 14, 'line-blur': 10, 'line-opacity': 0.35 },
        });
        map.addLayer({
          id: 'journey-metro-route', type: 'line', source: 'journey-metro-route',
          paint: { 'line-color': '#fbbf24', 'line-width': 4, 'line-dasharray': [2, 1], 'line-opacity': 1 },
        });
      }

      // Source marker (green)
      const srcGeom = journey.source_walking.geometry;
      if (srcGeom.length > 0) {
        const el = document.createElement('div');
        el.className = 'journey-marker-source';
        el.style.cssText = 'width:16px;height:16px;border-radius:50%;background:#4ade80;border:3px solid #fff;box-shadow:0 0 12px #4ade80,0 2px 8px rgba(0,0,0,0.4);';
        const marker = new maplibregl.Marker({ element: el }).setLngLat(srcGeom[0] as [number, number]).addTo(map);
        journeyMarkersRef.current.push(marker);
      }

      // Dest marker (red)
      const destGeom = journey.dest_walking.geometry;
      if (destGeom.length > 0) {
        const el = document.createElement('div');
        el.className = 'journey-marker-dest';
        el.style.cssText = 'width:16px;height:16px;border-radius:50%;background:#f87171;border:3px solid #fff;box-shadow:0 0 12px #f87171,0 2px 8px rgba(0,0,0,0.4);';
        const lastCoord = destGeom[destGeom.length - 1];
        const marker = new maplibregl.Marker({ element: el }).setLngLat(lastCoord as [number, number]).addTo(map);
        journeyMarkersRef.current.push(marker);
      }

      // Fit bounds to show full journey
      const allCoords = [
        ...journey.source_walking.geometry,
        ...journey.metro_route_coords,
        ...journey.dest_walking.geometry,
      ];
      if (allCoords.length >= 2) {
        const bounds = new maplibregl.LngLatBounds();
        allCoords.forEach(c => bounds.extend(c as [number, number]));
        map.fitBounds(bounds, { padding: 100, pitch: 60, duration: 1800 });
      }
    }, [clearJourneyLayers]);

    useImperativeHandle(ref, () => ({
      getMap: () => mapRef.current,
      flyToStation: (stationId: string) => {
        const station = cityConfigRef.current.stations[stationId];
        if (!station || !mapRef.current) return;
        mapRef.current.flyTo({
          center: [station.lng, station.lat],
          zoom: 16.5,
          pitch: 68,
          bearing: -25,
          duration: 2000,
          essential: true,
        });
      },
      highlightRoute: (route: RouteResult | null) => {
        currentRouteRef.current = route;
        highlightRouteOnMap(route);
      },
      showJourney: (journey: JourneyResult | null) => {
        currentJourneyRef.current = journey;
        showJourneyOnMap(journey);
      },
      clearJourney: () => {
        currentJourneyRef.current = null;
        clearJourneyLayers();
      },
    }));

    const highlightRouteOnMap = useCallback((route: RouteResult | null) => {
      const map = mapRef.current;
      if (!map) return;
      if (map.getLayer('route-highlight')) map.removeLayer('route-highlight');
      if (map.getLayer('route-highlight-glow')) map.removeLayer('route-highlight-glow');
      if (map.getSource('route-highlight')) map.removeSource('route-highlight');
      if (!route) return;

      const coords = route.path.map(id => {
        const s = cityConfigRef.current.stations[id];
        return s ? ([s.lng, s.lat] as [number, number]) : null;
      }).filter(Boolean) as [number, number][];

      map.addSource('route-highlight', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: coords },
        },
      });

      map.addLayer({
        id: 'route-highlight-glow',
        type: 'line',
        source: 'route-highlight',
        paint: {
          'line-color': '#fbbf24',
          'line-width': 14,
          'line-blur': 10,
          'line-opacity': 0.4,
        },
      });

      map.addLayer({
        id: 'route-highlight',
        type: 'line',
        source: 'route-highlight',
        paint: {
          'line-color': '#fbbf24',
          'line-width': 4,
          'line-dasharray': [2, 1],
          'line-opacity': 1,
        },
      });

      const bounds = new maplibregl.LngLatBounds();
      coords.forEach(c => bounds.extend(c));
      map.fitBounds(bounds, { padding: 120, pitch: 65, duration: 1500 });
    }, []);

    // Remove existing metro layers before adding new ones
    const removeMetroLayers = useCallback((map: maplibregl.Map) => {
      // Remove station layers
      const stationLayers = ['station-labels', 'station-selected-ring', 'station-circle'];
      stationLayers.forEach(id => {
        if (map.getLayer(id)) map.removeLayer(id);
      });
      if (map.getSource('metro-stations')) map.removeSource('metro-stations');

      // Remove route highlight
      if (map.getLayer('route-highlight')) map.removeLayer('route-highlight');
      if (map.getLayer('route-highlight-glow')) map.removeLayer('route-highlight-glow');
      if (map.getSource('route-highlight')) map.removeSource('route-highlight');

      // Remove 3D infrastructure layer when reloading layers
      if (map.getLayer('three-metro-layer')) map.removeLayer('three-metro-layer');

      // Remove line layers for all cities
      Object.values(CITY_CONFIGS).forEach(cfg => {
        cfg.lines.forEach(l => {
          const mainId = `metro-line-${l.id}-main`;
          const glowId = `metro-line-${l.id}-glow`;
          const sourceId = `metro-line-${l.id}`;
          if (map.getLayer(mainId)) map.removeLayer(mainId);
          if (map.getLayer(glowId)) map.removeLayer(glowId);
          if (map.getSource(sourceId)) map.removeSource(sourceId);
        });
      });
    }, []);

    // Add metro layers for a specific city config
    const addAllLayers = useCallback((map: maplibregl.Map, config: CityConfig) => {
      // Remove any existing metro layers before creating new ones
      removeMetroLayers(map);

      // 1. Add 3D vector tile buildings if available in source
      const style = map.getStyle();
      const sources = style.sources || {};
      const buildingSourceName = Object.keys(sources).find(k => k === 'carto' || k === 'openmaptiles') || Object.keys(sources)[0];

      if (buildingSourceName && !map.getLayer('building-3d') && sources[buildingSourceName]?.type === 'vector') {
        const layers = style.layers || [];
        let labelLayerId: string | undefined;
        for (const layer of layers) {
          if (layer.type === 'symbol' && (layer.layout as Record<string, unknown>)?.['text-field']) {
            labelLayerId = layer.id;
            break;
          }
        }

        map.addLayer(
          {
            id: 'building-3d',
            source: buildingSourceName,
            'source-layer': 'building',
            type: 'fill-extrusion',
            minzoom: 13,
            paint: {
              'fill-extrusion-color': '#2d3748',
              'fill-extrusion-height': [
                'interpolate', ['linear'], ['zoom'],
                13, 0,
                14, ['*', ['coalesce', ['get', 'render_height'], 14], 1]
              ],
              'fill-extrusion-base': 0,
              'fill-extrusion-opacity': 0.88,
            },
          },
          labelLayerId
        );
      }

      // 2. Add Three.js Custom 3D Layer for Elevated Infrastructure & Animated Station Rings
      try {
        const threeLayer = createThreeLayer(
          map,
          {
            showGuideway: settings.showMetroGuideway,
            showStationHalos: settings.showStationHalos,
            showNeonGlow: settings.showNeonGlow,
            stationSize: settings.stationSize,
          },
          config
        );
        map.addLayer(threeLayer);
      } catch (err) {
        console.warn('Three.js layer initialization:', err);
      }

      // 3. Add Metro line track strips on ground/map
      config.lines.forEach(line => {
        const color = config.lineColors[line.id] || { primary: '#a855f7', glow: '#c084fc' };
        const coords = config.routeCoordinates[line.id] || [];
        if (coords.length < 2) return;

        const sourceId = `metro-line-${line.id}`;
        if (map.getSource(sourceId)) return;

        map.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: { line: line.id },
            geometry: { type: 'LineString', coordinates: coords },
          },
        });

        // Outer glow
        map.addLayer({
          id: `${sourceId}-glow`,
          type: 'line',
          source: sourceId,
          paint: {
            'line-color': color.glow,
            'line-width': [
              'interpolate', ['linear'], ['zoom'],
              10, 6,
              14, 16,
              18, 30
            ],
            'line-blur': [
              'interpolate', ['linear'], ['zoom'],
              10, 4,
              14, 14,
              18, 25
            ],
            'line-opacity': 0.45,
          },
        });

        // Main colored line
        map.addLayer({
          id: `${sourceId}-main`,
          type: 'line',
          source: sourceId,
          paint: {
            'line-color': color.primary,
            'line-width': [
              'interpolate', ['linear'], ['zoom'],
              10, 2.5,
              14, 4.5,
              18, 7
            ],
            'line-opacity': 0.95,
          },
        });
      });

      // 4. Add Station Markers
      const stationFeatures = Object.values(config.stations).map(station => {
        const color = config.lineColors[station.line] || { primary: '#a855f7', glow: '#c084fc' };
        return {
          type: 'Feature' as const,
          properties: {
            id: station.id,
            name: station.name,
            line: station.line,
            color: color.primary,
            glowColor: color.glow,
            isInterchange: station.isInterchange,
          },
          geometry: {
            type: 'Point' as const,
            coordinates: [station.lng, station.lat],
          },
        };
      });

      if (!map.getSource('metro-stations')) {
        map.addSource('metro-stations', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: stationFeatures },
        });

        // Transparent hit-test circle for station click selection
        map.addLayer({
          id: 'station-circle',
          type: 'circle',
          source: 'metro-stations',
          paint: {
            'circle-radius': [
              'interpolate', ['linear'], ['zoom'],
              10, 10,
              14, 18,
              18, 30
            ],
            'circle-color': ['get', 'color'],
            'circle-opacity': 0,
            'circle-stroke-opacity': 0,
          },
        });

        // Selected station white halo ring
        map.addLayer({
          id: 'station-selected-ring',
          type: 'circle',
          source: 'metro-stations',
          filter: ['==', ['get', 'id'], ''],
          paint: {
            'circle-radius': [
              'interpolate', ['linear'], ['zoom'],
              10, 14,
              14, 30,
              18, 55
            ],
            'circle-color': '#ffffff',
            'circle-opacity': 0.25,
            'circle-blur': 0.6,
          },
        });

        // Station names (floating labels above station)
        map.addLayer({
          id: 'station-labels',
          type: 'symbol',
          source: 'metro-stations',
          minzoom: 12.5,
          layout: {
            'text-field': ['get', 'name'],
            'text-size': [
              'interpolate', ['linear'], ['zoom'],
              12, 10,
              14, 12,
              18, 15
            ],
            'text-offset': [0, 1.8],
            'text-anchor': 'top',
            'text-font': ['Open Sans Regular'],
            'text-allow-overlap': false,
            'text-optional': true,
          },
          paint: {
            'text-color': '#ffffff',
            'text-halo-color': 'rgba(10,10,26,0.9)',
            'text-halo-width': 2,
          },
        });
      }

      map.on('click', 'station-circle', (e) => {
        if (e.features?.[0]?.properties?.id) {
          onStationClick(e.features[0].properties.id);
        }
      });

      map.on('mouseenter', 'station-circle', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'station-circle', () => {
        map.getCanvas().style.cursor = '';
      });
    }, [onStationClick, removeMetroLayers, settings]);

    // Apply scene settings
    const applySettings = useCallback((map: maplibregl.Map, s: SceneSettings, config: CityConfig) => {
      const lighting = LIGHTING_PRESETS[s.lighting];

      try {
        map.setLight({
          anchor: lighting.anchor,
          color: lighting.color,
          intensity: lighting.intensity,
        });
      } catch { /* noop */ }

      if (map.getLayer('building-3d')) {
        map.setLayoutProperty('building-3d', 'visibility', s.show3DBuildings ? 'visible' : 'none');
        map.setPaintProperty('building-3d', 'fill-extrusion-color', lighting.buildingColor);
        map.setPaintProperty('building-3d', 'fill-extrusion-opacity', lighting.buildingOpacity);
      }

      if (map.getLayer('three-metro-layer')) {
        map.setLayoutProperty('three-metro-layer', 'visibility', s.showMetroGuideway ? 'visible' : 'none');
      }

      config.lines.forEach(line => {
        const mainId = `metro-line-${line.id}-main`;
        const glowId = `metro-line-${line.id}-glow`;
        if (map.getLayer(mainId)) {
          map.setLayoutProperty(mainId, 'visibility', s.showMetroGuideway ? 'visible' : 'none');
        }
        if (map.getLayer(glowId)) {
          map.setLayoutProperty(glowId, 'visibility', s.showNeonGlow ? 'visible' : 'none');
        }
      });

      if (map.getLayer('station-labels')) {
        map.setLayoutProperty('station-labels', 'visibility', s.showStationLabels ? 'visible' : 'none');
      }
    }, []);

    // Animated metro train markers
    const startTrainAnimation = useCallback((map: maplibregl.Map, config: CityConfig) => {
      trainMarkersRef.current.forEach(m => m.remove());
      trainMarkersRef.current = [];

      const lineConfigs = config.lines.map(line => ({
        line: line.id,
        coords: config.routeCoordinates[line.id] || [],
        count: 2,
      })).filter(l => l.coords.length >= 2);

      lineConfigs.forEach(({ line, coords, count }) => {
        const color = config.lineColors[line] || { primary: '#a855f7' };
        for (let i = 0; i < count; i++) {
          const el = document.createElement('div');
          el.style.cssText = `
            width: 14px; height: 14px;
            background: ${color.primary};
            border: 2px solid #ffffff;
            border-radius: 4px;
            box-shadow: 0 0 14px ${color.primary}, 0 0 28px ${color.primary};
            animation: train-pulse 2s ease-in-out infinite;
          `;
          const marker = new maplibregl.Marker({ element: el })
            .setLngLat(coords[0])
            .addTo(map);
          trainMarkersRef.current.push(marker);
        }
      });

      cancelAnimationFrame(animFrameRef.current);

      const animate = (time: number) => {
        const elapsed = time / 1000;
        let idx = 0;
        lineConfigs.forEach(({ coords, count }) => {
          for (let i = 0; i < count; i++) {
            const marker = trainMarkersRef.current[idx];
            if (!marker) { idx++; continue; }
            const total = coords.length - 1;
            const offset = i / count;
            const speed = 0.025;
            const progress = ((elapsed * speed + offset) % 1);
            const seg = Math.floor(progress * total);
            const t = (progress * total) - seg;
            if (seg < total) {
              const lng = coords[seg][0] + (coords[seg + 1][0] - coords[seg][0]) * t;
              const lat = coords[seg][1] + (coords[seg + 1][1] - coords[seg][1]) * t;
              marker.setLngLat([lng, lat]);
            }
            idx++;
          }
        });
        animFrameRef.current = requestAnimationFrame(animate);
      };
      animFrameRef.current = requestAnimationFrame(animate);
    }, []);

    // Initialize map once
    useEffect(() => {
      if (!containerRef.current || mapRef.current) return;

      const selectedStyleObj = MAP_STYLES.find(s => s.id === mapStyle) || MAP_STYLES[0];
      const styleConfig = selectedStyleObj.style || selectedStyleObj.url || MAP_STYLES[0].url!;

      const map = new maplibregl.Map({
        container: containerRef.current,
        style: styleConfig,
        center: cityConfig.center,
        zoom: cityConfig.defaultZoom,
        pitch: cityConfig.defaultPitch,
        bearing: cityConfig.defaultBearing,
        antialias: true,
        maxPitch: 85,
      } as any);

      mapRef.current = map;

      map.on('load', () => {
        addAllLayers(map, cityConfigRef.current);
        applySettings(map, settings, cityConfigRef.current);
        onMapReady(map);
        startTrainAnimation(map, cityConfigRef.current);
        layersAddedRef.current = true;
      });

      return () => {
        cancelAnimationFrame(animFrameRef.current);
        trainMarkersRef.current.forEach(m => m.remove());
        map.remove();
        mapRef.current = null;
        layersAddedRef.current = false;
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handle city change dynamically
    useEffect(() => {
      const map = mapRef.current;
      if (!map || !layersAddedRef.current) return;
      if (prevCityIdRef.current === cityConfig.id) return;
      prevCityIdRef.current = cityConfig.id;

      map.flyTo({
        center: cityConfig.center,
        zoom: cityConfig.defaultZoom,
        pitch: cityConfig.defaultPitch,
        bearing: cityConfig.defaultBearing,
        duration: 2500,
        essential: true,
      });

      addAllLayers(map, cityConfig);
      applySettings(map, settings, cityConfig);
      startTrainAnimation(map, cityConfig);
    }, [cityConfig, addAllLayers, applySettings, startTrainAnimation, settings]);

    // Map style changes
    useEffect(() => {
      const map = mapRef.current;
      if (!map || mapStyle === prevStyleRef.current) return;
      prevStyleRef.current = mapStyle;

      const selectedStyleObj = MAP_STYLES.find(s => s.id === mapStyle) || MAP_STYLES[0];
      const styleConfig = selectedStyleObj.style || selectedStyleObj.url || MAP_STYLES[0].url!;

      trainMarkersRef.current.forEach(m => m.remove());
      trainMarkersRef.current = [];
      cancelAnimationFrame(animFrameRef.current);

      map.setStyle(styleConfig);
      layersAddedRef.current = false;

      map.once('style.load', () => {
        addAllLayers(map, cityConfigRef.current);
        applySettings(map, settings, cityConfigRef.current);
        startTrainAnimation(map, cityConfigRef.current);
        
        if (currentRouteRef.current) {
          highlightRouteOnMap(currentRouteRef.current);
        }
        if (currentJourneyRef.current) {
          showJourneyOnMap(currentJourneyRef.current);
        }
        
        layersAddedRef.current = true;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mapStyle]);

    // Settings changes
    useEffect(() => {
      const map = mapRef.current;
      if (!map || !layersAddedRef.current) return;
      try {
        applySettings(map, settings, cityConfigRef.current);
      } catch {
        // Style may not be loaded yet
      }
    }, [settings, applySettings]);

    // Selected station highlight filter
    useEffect(() => {
      const map = mapRef.current;
      if (!map || !layersAddedRef.current) return;
      try {
        if (map.getLayer('station-selected-ring')) {
          if (selectedStation) {
            map.setFilter('station-selected-ring', ['==', ['get', 'id'], selectedStation]);
          } else {
            map.setFilter('station-selected-ring', ['==', ['get', 'id'], '']);
          }
        }
      } catch { /* noop */ }
    }, [selectedStation]);

    return (
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ position: 'absolute', inset: 0 }}
      />
    );
  }
);

MetroMap.displayName = 'MetroMap';
export default MetroMap;
