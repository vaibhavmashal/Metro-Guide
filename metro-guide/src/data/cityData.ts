// ============================================================
// City Data Registry — Unified city-agnostic config
// Supports Pune and Bangalore metro networks
// ============================================================

import {
  STATIONS as PUNE_STATIONS,
  LINES as PUNE_LINES,
  LINE_COLORS as PUNE_LINE_COLORS,
  ROUTE_COORDINATES as PUNE_ROUTE_COORDS,
  PUNE_CENTER,
  DEFAULT_ZOOM as PUNE_ZOOM,
  DEFAULT_PITCH as PUNE_PITCH,
  DEFAULT_BEARING as PUNE_BEARING,
  type Station,
  type LineInfo,
} from './metroData';

import {
  BLR_STATIONS,
  BLR_LINES,
  BLR_LINE_COLORS,
  BLR_ROUTE_COORDINATES,
  BLR_CENTER,
  BLR_DEFAULT_ZOOM,
  BLR_DEFAULT_PITCH,
  BLR_DEFAULT_BEARING,
} from './bangaloreMetroData';

export type CityId = 'pune' | 'bangalore';

export interface CityConfig {
  id: CityId;
  name: string;               // short: "Pune", "Bengaluru"
  fullLabel: string;          // "Pune Metro 3D"
  subtitle: string;           // shown in header subtitle
  center: [number, number];   // [lng, lat]
  defaultZoom: number;
  defaultPitch: number;
  defaultBearing: number;
  stations: Record<string, Station>;
  lines: LineInfo[];
  lineColors: Record<string, { primary: string; glow: string; rgb: [number, number, number] }>;
  routeCoordinates: Record<string, [number, number][]>;
  lineColorsDef: { name: string; color: string }[];  // for header subtitle
}

export const CITY_CONFIGS: Record<CityId, CityConfig> = {
  pune: {
    id: 'pune',
    name: 'Pune',
    fullLabel: 'Pune Metro 3D',
    subtitle: 'Purple · Aqua · Line 3 · interactive 3D map',
    center: PUNE_CENTER,
    defaultZoom: PUNE_ZOOM,
    defaultPitch: PUNE_PITCH,
    defaultBearing: PUNE_BEARING,
    stations: PUNE_STATIONS as Record<string, Station>,
    lines: PUNE_LINES as LineInfo[],
    lineColors: PUNE_LINE_COLORS as Record<string, { primary: string; glow: string; rgb: [number, number, number] }>,
    routeCoordinates: PUNE_ROUTE_COORDS as Record<string, [number, number][]>,
    lineColorsDef: [
      { name: 'Purple', color: '#a855f7' },
      { name: 'Aqua',   color: '#06b6d4' },
      { name: 'Line 3', color: '#ec4899' },
    ],
  },
  bangalore: {
    id: 'bangalore',
    name: 'Bengaluru',
    fullLabel: 'Namma Metro 3D',
    subtitle: 'Purple · Green · Yellow · Namma Metro',
    center: BLR_CENTER,
    defaultZoom: BLR_DEFAULT_ZOOM,
    defaultPitch: BLR_DEFAULT_PITCH,
    defaultBearing: BLR_DEFAULT_BEARING,
    stations: BLR_STATIONS,
    lines: BLR_LINES,
    lineColors: BLR_LINE_COLORS as Record<string, { primary: string; glow: string; rgb: [number, number, number] }>,
    routeCoordinates: BLR_ROUTE_COORDINATES as Record<string, [number, number][]>,
    lineColorsDef: [
      { name: 'Purple', color: '#9b30ff' },
      { name: 'Green',  color: '#22c55e' },
      { name: 'Yellow', color: '#f59e0b' },
    ],
  },
};

export const CITIES: { id: CityId; name: string; emoji: string }[] = [
  { id: 'pune',      name: 'Pune',      emoji: '🟣' },
  { id: 'bangalore', name: 'Bengaluru', emoji: '🟢' },
];
