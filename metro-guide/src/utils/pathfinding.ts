// ============================================================
// Pathfinding — Dijkstra's Algorithm for Metro Route
// City-agnostic: works with any station map
// ============================================================

import { haversineDistance, METRO_AVG_SPEED_KMH, type Station } from '../data/metroData';

export interface RouteResult {
  path: string[];           // station IDs in order
  totalDistance: number;    // km
  estimatedTime: number;    // minutes
  interchanges: string[];   // station IDs where line changes
  lineSegments: { line: string; stations: string[] }[];
}

interface DijkstraNode {
  id: string;
  distance: number;
  previous: string | null;
}

export function findRoute(
  sourceId: string,
  destId: string,
  stations: Record<string, Station>
): RouteResult | null {
  const source = stations[sourceId];
  const dest   = stations[destId];
  if (!source || !dest) return null;

  if (sourceId === destId) {
    return {
      path: [sourceId],
      totalDistance: 0,
      estimatedTime: 0,
      interchanges: [],
      lineSegments: [{ line: source.line, stations: [sourceId] }],
    };
  }

  // Initialize Dijkstra nodes
  const nodes: Record<string, DijkstraNode> = {};
  const visited = new Set<string>();

  for (const id of Object.keys(stations)) {
    nodes[id] = { id, distance: id === sourceId ? 0 : Infinity, previous: null };
  }

  while (true) {
    // Find unvisited node with smallest distance
    let current: DijkstraNode | null = null;
    for (const node of Object.values(nodes)) {
      if (!visited.has(node.id) && (current === null || node.distance < current.distance)) {
        current = node;
      }
    }

    if (!current || current.distance === Infinity || current.id === destId) break;

    visited.add(current.id);
    const currentStation = stations[current.id];

    for (const neighborId of currentStation.connectedStations) {
      if (visited.has(neighborId)) continue;
      const neighbor = stations[neighborId];
      if (!neighbor) continue;

      const dist = haversineDistance(
        currentStation.lat, currentStation.lng,
        neighbor.lat, neighbor.lng
      );

      // Small penalty for line changes — prefer staying on same line
      const linePenalty = currentStation.line !== neighbor.line ? 0.5 : 0;
      const newDist = current.distance + dist + linePenalty;

      if (newDist < nodes[neighborId].distance) {
        nodes[neighborId].distance = newDist;
        nodes[neighborId].previous = current.id;
      }
    }
  }

  // Reconstruct path
  const path: string[] = [];
  let currentId: string | null = destId;
  while (currentId) {
    path.unshift(currentId);
    currentId = nodes[currentId]?.previous ?? null;
  }

  if (path[0] !== sourceId) return null;

  // Calculate total distance
  let totalDistance = 0;
  for (let i = 1; i < path.length; i++) {
    const s1 = stations[path[i - 1]];
    const s2 = stations[path[i]];
    totalDistance += haversineDistance(s1.lat, s1.lng, s2.lat, s2.lng);
  }

  // Find interchanges
  const interchanges: string[] = [];
  for (let i = 1; i < path.length; i++) {
    if (stations[path[i - 1]].line !== stations[path[i]].line) {
      interchanges.push(path[i - 1]);
    }
  }

  // Build line segments
  const lineSegments: { line: string; stations: string[] }[] = [];
  let currentSegment: { line: string; stations: string[] } | null = null;

  for (const stationId of path) {
    const station = stations[stationId];
    if (!currentSegment || currentSegment.line !== station.line) {
      if (currentSegment) currentSegment.stations.push(stationId);
      currentSegment = { line: station.line, stations: [stationId] };
      lineSegments.push(currentSegment);
    } else {
      currentSegment.stations.push(stationId);
    }
  }

  const estimatedTime = (totalDistance / METRO_AVG_SPEED_KMH) * 60 + interchanges.length * 5;

  return {
    path,
    totalDistance: Math.round(totalDistance * 100) / 100,
    estimatedTime: Math.round(estimatedTime),
    interchanges,
    lineSegments,
  };
}
