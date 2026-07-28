// ============================================================
// Map Style Definitions
// Free tile sources for MapLibre GL JS including ESRI Satellite
// ============================================================

import type { StyleSpecification } from 'maplibre-gl';

export interface MapStyleOption {
  id: string;
  name: string;
  url?: string;
  style?: StyleSpecification;
  preview: string;
}

export const MAP_STYLES: MapStyleOption[] = [
  {
    id: 'dark',
    name: 'Dark',
    url: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    preview: 'linear-gradient(135deg, #1a1a2e, #16213e)',
  },
  {
    id: 'streets',
    name: 'Streets',
    url: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
    preview: 'linear-gradient(135deg, #dfe6e9, #b2bec3)',
  },
  {
    id: 'satellite',
    name: 'Satellite',
    style: {
      version: 8,
      sources: {
        'esri-satellite': {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          ],
          tileSize: 256,
        },
      },
      layers: [
        {
          id: 'satellite-layer',
          type: 'raster',
          source: 'esri-satellite',
          paint: {
            'raster-opacity': 1,
          },
        },
      ],
    },
    preview: 'linear-gradient(135deg, #1e3719, #4a693c)',
  },
  {
    id: 'light',
    name: 'Light',
    url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    preview: 'linear-gradient(135deg, #f5f6fa, #dcdde1)',
  },
  {
    id: 'terrain',
    name: 'Terrain',
    style: {
      version: 8,
      sources: {
        'google-terrain': {
          type: 'raster',
          tiles: [
            'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}'
          ],
          tileSize: 256,
        },
      },
      layers: [
        {
          id: 'terrain-layer',
          type: 'raster',
          source: 'google-terrain',
          paint: {
            'raster-opacity': 1,
          },
        },
      ],
    },
    preview: 'linear-gradient(135deg, #6ab04c, #badc58)',
  },
];

export type LightingMode = 'day' | 'dusk' | 'night';

export interface LightingPreset {
  id: LightingMode;
  name: string;
  anchor: 'map' | 'viewport';
  color: string;
  intensity: number;
  position: [number, number, number];
  skyColor: string;
  fogColor: string;
  fogRange: [number, number];
  buildingColor: string;
  buildingOpacity: number;
}

export const LIGHTING_PRESETS: Record<LightingMode, LightingPreset> = {
  day: {
    id: 'day',
    name: 'Day',
    anchor: 'map',
    color: '#ffffff',
    intensity: 0.8,
    position: [1, 45, 45],
    skyColor: '#88ccee',
    fogColor: '#e0f0ff',
    fogRange: [1, 15],
    buildingColor: '#64748b',
    buildingOpacity: 0.85,
  },
  dusk: {
    id: 'dusk',
    name: 'Dusk',
    anchor: 'viewport',
    color: '#ffaa66',
    intensity: 0.6,
    position: [1.5, 90, 20],
    skyColor: '#3d2645',
    fogColor: '#4a2545',
    fogRange: [0.8, 12],
    buildingColor: '#475569',
    buildingOpacity: 0.88,
  },
  night: {
    id: 'night',
    name: 'Night',
    anchor: 'viewport',
    color: '#8888dd',
    intensity: 0.4,
    position: [0.5, 180, 60],
    skyColor: '#0a0a1a',
    fogColor: '#0f0f20',
    fogRange: [0.5, 10],
    buildingColor: '#ffffff',
    buildingOpacity: 0.9,
  },
};

export interface SceneSettings {
  lighting: LightingMode;
  show3DBuildings: boolean;
  showMetroGuideway: boolean;
  showStationHalos: boolean;
  showStationLabels: boolean;
  showNeonGlow: boolean;
  stationSize: number;
}

export const DEFAULT_SCENE_SETTINGS: SceneSettings = {
  lighting: 'night',
  show3DBuildings: true,
  showMetroGuideway: true,
  showStationHalos: true,
  showStationLabels: true,
  showNeonGlow: true,
  stationSize: 1.0,
};
