// ============================================================
// Journey API Client — Geocoding, reverse geocoding, journey planning
// Uses Nominatim (free) for geocoding, backend for journey planning
// ============================================================

import { CITY_CONFIGS } from '../data/cityData';

export interface LocationResult {
  lat: number;
  lng: number;
  displayName: string;
  shortName: string;
  category?: string;
  type?: 'station' | 'place';
}

export interface StationInfo {
  id: string;
  name: string;
  line: string;
  latitude: number;
  longitude: number;
  distance_from_user_km: number;
  distance_from_user_meters: number;
}

export interface WalkingSegment {
  distance_meters: number;
  duration_minutes: number;
  geometry: number[][];
}

export interface MetroSegment {
  line: string;
  line_name: string;
  stations: string[];
  station_names: string[];
  direction: string;
  station_count: number;
}

export interface TravelModeOption {
  mode: string;
  mode_name: string;
  icon: string;
  distance_meters: number;
  duration_minutes: number;
  fare_estimate?: string;
  description: string;
}

export interface JourneyResult {
  success: boolean;
  source_station: StationInfo;
  dest_station: StationInfo;
  source_walking: WalkingSegment;
  dest_walking: WalkingSegment;
  source_options: TravelModeOption[];
  dest_options: TravelModeOption[];
  metro_segments: MetroSegment[];
  interchanges: string[];
  total_stations: number;
  metro_distance_km: number;
  metro_time_minutes: number;
  walking_time_minutes: number;
  total_time_minutes: number;
  ai_summary: string;
  journey_steps: string[];
  metro_route_coords: number[][];
}

// ── Multi-Source Google-Maps-Style Autocomplete ─────────────────────

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const PHOTON_BASE = 'https://photon.komoot.io';

const CITY_BOUNDS: Record<string, string> = {
  pune: '73.65,18.75,74.15,18.35', // min_lon, max_lat, max_lon, min_lat
  bangalore: '77.40,13.15,77.80,12.75',
};

let _searchAbortController: AbortController | null = null;

export async function searchLocations(
  query: string,
  city: string = 'pune'
): Promise<LocationResult[]> {
  if (!query || query.trim().length < 2) return [];

  if (_searchAbortController) {
    _searchAbortController.abort();
  }
  _searchAbortController = new AbortController();
  const signal = _searchAbortController.signal;

  const results: LocationResult[] = [];
  const qLower = query.trim().toLowerCase();
  const queryTokens = qLower.split(/\s+/).filter(Boolean);
  const cityCfg = CITY_CONFIGS[city as keyof typeof CITY_CONFIGS] || CITY_CONFIGS.pune;

  // 1. Instant local station matching (top priority)
  try {
    Object.values(cityCfg.stations).forEach((station: any) => {
      const nameMatch = station.name?.toLowerCase().includes(qLower);
      const nearbyMatch = station.nearbyPlaces?.some((p: string) =>
        p.toLowerCase().includes(qLower) || queryTokens.every((t) => p.toLowerCase().includes(t))
      );
      if (nameMatch || nearbyMatch) {
        results.push({
          lat: station.lat,
          lng: station.lng,
          shortName: `${station.name} Metro Station`,
          displayName: `${station.name} Metro Station (${station.nearbyPlaces?.[0] || cityCfg.name})`,
          category: 'Metro Station',
          type: 'station',
        });
      }
    });
  } catch (e) {
    console.error('Error matching local stations:', e);
  }

  // 3. Query Photon API & Nominatim in parallel with multi-word enhancement
  try {
    const center = cityCfg.center;
    const hasCityInQuery = qLower.includes(cityCfg.name.toLowerCase());
    const searchQuery = hasCityInQuery ? query.trim() : `${query.trim()} ${cityCfg.name}`;

    const photonParams = new URLSearchParams({
      q: searchQuery,
      lat: center[1].toString(),
      lon: center[0].toString(),
      limit: '8',
    });

    const bounds = CITY_BOUNDS[city] || CITY_BOUNDS.pune;
    const nominatimParams = new URLSearchParams({
      q: searchQuery,
      format: 'json',
      limit: '6',
      addressdetails: '1',
      viewbox: bounds,
      countrycodes: 'in',
    });

    const [photonRes, nominatimRes] = await Promise.allSettled([
      fetch(`${PHOTON_BASE}/api/?${photonParams}`, { signal }),
      fetch(`${NOMINATIM_BASE}/search?${nominatimParams}`, {
        signal,
        headers: { 'Accept-Language': 'en' },
      }),
    ]);

    // Process Photon results
    if (photonRes.status === 'fulfilled' && photonRes.value.ok) {
      const data = await photonRes.value.json();
      const features = data.features || [];
      features.forEach((feat: any) => {
        const props = feat.properties || {};
        const coords = feat.geometry?.coordinates || [];
        if (coords.length < 2) return;

        const shortName = props.name || props.street || props.locality || props.city || 'Place';
        const parts = [
          props.name,
          props.street,
          props.locality || props.district,
          props.city,
        ].filter(Boolean);
        const displayName = parts.join(', ');

        const category = _formatOsmCategory(props.osm_key, props.osm_value, props.type);

        const isDup = results.some(
          (r) => Math.abs(r.lat - coords[1]) < 0.001 && Math.abs(r.lng - coords[0]) < 0.001
        );
        if (!isDup) {
          results.push({
            lat: coords[1],
            lng: coords[0],
            shortName,
            displayName: displayName || shortName,
            category,
            type: 'place',
          });
        }
      });
    }

    // Process Nominatim results
    if (nominatimRes.status === 'fulfilled' && nominatimRes.value.ok) {
      const data = await nominatimRes.value.json();
      data.forEach((item: any) => {
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        const isDup = results.some(
          (r) => Math.abs(r.lat - lat) < 0.001 && Math.abs(r.lng - lng) < 0.001
        );
        if (!isDup) {
          const shortName = _extractShortName(item);
          const addr = item.address || {};
          const category = _formatOsmCategory(item.class, item.type, addr.type);
          results.push({
            lat,
            lng,
            shortName,
            displayName: item.display_name,
            category,
            type: 'place',
          });
        }
      });
    }

    // 4. Fallback search if few results found for a multi-word query (e.g., "Siddhant Towers Kothrud" fallback to "Kothrud")
    if (results.length < 3 && queryTokens.length > 1) {
      const fallbackTerm = queryTokens.find((t) =>
        ['kothrud', 'baner', 'wakad', 'hinjewadi', 'swargate', 'shivajinagar', 'yerawada', 'viman', 'kalyani', 'hadapsar', 'pimpri', 'bhosari', 'dapodi', 'khadki'].includes(t)
      ) || queryTokens[queryTokens.length - 1];

      if (fallbackTerm && fallbackTerm.length >= 3) {
        const fallbackParams = new URLSearchParams({
          q: `${fallbackTerm} ${cityCfg.name}`,
          lat: center[1].toString(),
          lon: center[0].toString(),
          limit: '4',
        });
        const fbRes = await fetch(`${PHOTON_BASE}/api/?${fallbackParams}`, { signal }).catch(() => null);
        if (fbRes && fbRes.ok) {
          const fbData = await fbRes.json();
          (fbData.features || []).forEach((feat: any) => {
            const props = feat.properties || {};
            const coords = feat.geometry?.coordinates || [];
            if (coords.length < 2) return;
            const shortName = props.name || props.street || props.locality || props.city || 'Place';
            const parts = [props.name, props.street, props.locality || props.district, props.city].filter(Boolean);
            const isDup = results.some((r) => Math.abs(r.lat - coords[1]) < 0.001 && Math.abs(r.lng - coords[0]) < 0.001);
            if (!isDup) {
              results.push({
                lat: coords[1],
                lng: coords[0],
                shortName,
                displayName: parts.join(', ') || shortName,
                category: _formatOsmCategory(props.osm_key, props.osm_value, props.type),
                type: 'place',
              });
            }
          });
        }
      }
    }
  } catch (e: any) {
    if (e.name !== 'AbortError') {
      console.error('Geocoding error:', e);
    }
  }

  return results.slice(0, 10);
}

function _formatOsmCategory(key?: string, value?: string, type?: string): string {
  const val = value || type || key;
  if (!val) return 'Location';
  const vLower = val.toLowerCase();
  if (vLower.includes('station') || vLower.includes('railway') || vLower.includes('metro')) return 'Metro Station';
  if (vLower.includes('restaurant') || vLower.includes('cafe') || vLower.includes('food')) return 'Restaurant';
  if (vLower.includes('mall') || vLower.includes('shop') || vLower.includes('market')) return 'Shopping';
  if (vLower.includes('hospital') || vLower.includes('clinic') || vLower.includes('doctor')) return 'Healthcare';
  if (vLower.includes('school') || vLower.includes('college') || vLower.includes('university')) return 'Education';
  if (vLower.includes('office') || vLower.includes('company') || vLower.includes('it')) return 'Office / IT Park';
  if (vLower.includes('park') || vLower.includes('garden')) return 'Park';
  return val.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

export async function reverseGeocode(lat: number, lng: number): Promise<LocationResult | null> {
  try {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lng.toString(),
      format: 'json',
      addressdetails: '1',
    });

    const response = await fetch(`${NOMINATIM_BASE}/reverse?${params}`, {
      headers: { 'Accept-Language': 'en' },
    });

    if (!response.ok) return null;

    const item = await response.json();

    return {
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      displayName: item.display_name,
      shortName: _extractShortName(item),
    };
  } catch (e) {
    console.error('Reverse geocoding error:', e);
    return null;
  }
}

function _extractShortName(item: any): string {
  const addr = item.address || {};
  // Try to build a sensible short name
  const parts = [
    addr.amenity || addr.building || addr.road || addr.neighbourhood || addr.suburb || '',
    addr.city || addr.town || addr.village || '',
  ].filter(Boolean);
  return parts.join(', ') || item.display_name?.split(',').slice(0, 2).join(',') || 'Selected Location';
}

// ── Journey Planning API ────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function planJourney(
  sourceLat: number,
  sourceLng: number,
  destLat: number,
  destLng: number,
  sourceName?: string,
  destName?: string,
  city: string = 'pune'
): Promise<JourneyResult> {
  const response = await fetch(`${API_BASE}/api/journey/plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source_lat: sourceLat,
      source_lng: sourceLng,
      dest_lat: destLat,
      dest_lng: destLng,
      source_name: sourceName || undefined,
      dest_name: destName || undefined,
      city,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || `Journey planning failed (${response.status})`);
  }

  return response.json();
}
