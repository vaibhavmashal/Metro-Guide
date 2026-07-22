"""
Journey Planning Service — Core metro route planning logic.

Provides:
  - Station data loading & in-memory caching
  - Haversine distance calculation
  - Nearest metro station detection
  - Dijkstra-based metro graph traversal with interchange penalties
  - Walking direction estimation (Haversine-based + ORS API)
  - AI summary generation via Gemini
"""

import json
import math
import logging
import os
import time
from pathlib import Path
from functools import lru_cache
from typing import Any

import httpx

from app.core.config import settings
from app.core.prompts import JOURNEY_SUMMARY_PROMPT
from app.schemas.journey import (
    JourneyRequest,
    JourneyResult,
    StationInfo,
    WalkingSegment,
    MetroSegment,
    NearestStationResponse,
    TravelModeOption,
)

logger = logging.getLogger(__name__)

# ── Constants ──────────────────────────────────────────────────
METRO_AVG_SPEED_KMH = 33
INTERCHANGE_PENALTY_MINUTES = 5
WALKING_SPEED_KMH = 5
EARTH_RADIUS_KM = 6371

DATA_DIR = Path(__file__).parent.parent / "data"

CITY_FILES = {
    "pune": "pune_stations.json",
}

# ── In-memory station cache ───────────────────────────────────
_station_cache: dict[str, dict[str, Any]] = {}


def _load_stations(city: str) -> dict[str, Any]:
    """Load station data from JSON file, caching in memory."""
    if city in _station_cache:
        return _station_cache[city]

    filename = CITY_FILES.get(city)
    if not filename:
        raise ValueError(f"Unknown city: {city}. Supported: {list(CITY_FILES.keys())}")

    filepath = DATA_DIR / filename
    if not filepath.exists():
        raise FileNotFoundError(f"Station data file not found: {filepath}")

    with open(filepath, "r", encoding="utf-8") as f:
        stations_list = json.load(f)

    # Index by station ID for O(1) lookup
    stations = {s["id"]: s for s in stations_list}
    _station_cache[city] = stations
    logger.info(f"Loaded {len(stations)} stations for {city}")
    return stations


def get_all_stations(city: str) -> dict[str, Any]:
    """Get all stations for a city."""
    return _load_stations(city)


# ── Haversine Distance ────────────────────────────────────────
def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate great-circle distance between two points using Haversine formula.
    Returns distance in kilometers.
    """
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return EARTH_RADIUS_KM * c


# ── Nearest Station Search ────────────────────────────────────
def find_nearest_station(lat: float, lng: float, city: str) -> StationInfo:
    """
    Find the nearest metro station to given coordinates.
    Iterates all stations and returns the closest by Haversine distance.
    Optimized for <100ms (trivially fast for ~50 stations).
    """
    stations = _load_stations(city)
    best_id = None
    best_dist = float("inf")

    for sid, station in stations.items():
        dist = haversine(lat, lng, station["latitude"], station["longitude"])
        if dist < best_dist:
            best_dist = dist
            best_id = sid

    if best_id is None:
        raise ValueError(f"No stations found for city: {city}")

    station = stations[best_id]
    return StationInfo(
        id=station["id"],
        name=station["name"],
        line=station["line"],
        latitude=station["latitude"],
        longitude=station["longitude"],
        distance_from_user_km=round(best_dist, 3),
        distance_from_user_meters=round(best_dist * 1000, 0),
    )


# ── Dijkstra Metro Route ─────────────────────────────────────
def _find_metro_route(
    source_id: str, dest_id: str, stations: dict[str, Any]
) -> dict | None:
    """
    Find optimal metro route using Dijkstra's algorithm with interchange penalties.
    Returns dict with path, distance, time, interchanges, and line segments.
    """
    if source_id not in stations or dest_id not in stations:
        return None

    if source_id == dest_id:
        s = stations[source_id]
        return {
            "path": [source_id],
            "total_distance_km": 0,
            "estimated_time_min": 0,
            "interchanges": [],
            "line_segments": [{"line": s["line"], "stations": [source_id]}],
        }

    # Initialize Dijkstra
    dist = {sid: float("inf") for sid in stations}
    prev = {sid: None for sid in stations}
    dist[source_id] = 0
    visited = set()

    while True:
        # Find unvisited node with smallest distance
        current = None
        current_dist = float("inf")
        for sid in stations:
            if sid not in visited and dist[sid] < current_dist:
                current = sid
                current_dist = dist[sid]

        if current is None or current_dist == float("inf") or current == dest_id:
            break

        visited.add(current)
        current_station = stations[current]

        for neighbor_id in current_station["connected_stations"]:
            if neighbor_id in visited or neighbor_id not in stations:
                continue

            neighbor = stations[neighbor_id]
            edge_dist = haversine(
                current_station["latitude"],
                current_station["longitude"],
                neighbor["latitude"],
                neighbor["longitude"],
            )

            # Interchange penalty — prefer staying on same line
            line_penalty = 0.5 if current_station["line"] != neighbor["line"] else 0
            new_dist = dist[current] + edge_dist + line_penalty

            if new_dist < dist[neighbor_id]:
                dist[neighbor_id] = new_dist
                prev[neighbor_id] = current

    # Reconstruct path
    path = []
    current_id = dest_id
    while current_id is not None:
        path.insert(0, current_id)
        current_id = prev[current_id]

    if not path or path[0] != source_id:
        return None

    # Calculate total distance (without penalties)
    total_distance = 0
    for i in range(1, len(path)):
        s1 = stations[path[i - 1]]
        s2 = stations[path[i]]
        total_distance += haversine(
            s1["latitude"], s1["longitude"], s2["latitude"], s2["longitude"]
        )

    # Find interchanges
    interchanges = []
    for i in range(1, len(path)):
        if stations[path[i - 1]]["line"] != stations[path[i]]["line"]:
            interchanges.append(path[i - 1])

    # Build line segments
    line_segments = []
    current_segment = None
    for station_id in path:
        station = stations[station_id]
        if current_segment is None or current_segment["line"] != station["line"]:
            if current_segment:
                current_segment["stations"].append(station_id)
            current_segment = {"line": station["line"], "stations": [station_id]}
            line_segments.append(current_segment)
        else:
            current_segment["stations"].append(station_id)

    estimated_time = (total_distance / METRO_AVG_SPEED_KMH) * 60 + len(interchanges) * INTERCHANGE_PENALTY_MINUTES

    return {
        "path": path,
        "total_distance_km": round(total_distance, 2),
        "estimated_time_min": round(estimated_time),
        "interchanges": interchanges,
        "line_segments": line_segments,
    }


# ── Walking Directions ────────────────────────────────────────
def _estimate_walking(from_lat: float, from_lng: float, to_lat: float, to_lng: float) -> WalkingSegment:
    """
    Estimate walking distance/time from Haversine.
    Multiply by 1.3 to approximate walking path (vs straight line).
    """
    straight_dist = haversine(from_lat, from_lng, to_lat, to_lng)
    walking_dist = straight_dist * 1.3  # Path factor
    walking_time = (walking_dist / WALKING_SPEED_KMH) * 60

    # Simple straight-line geometry
    geometry = [[from_lng, from_lat], [to_lng, to_lat]]

    return WalkingSegment(
        distance_meters=round(walking_dist * 1000, 0),
        duration_minutes=round(walking_time, 1),
        geometry=geometry,
    )


async def _get_ors_walking(from_lat: float, from_lng: float, to_lat: float, to_lng: float) -> WalkingSegment | None:
    """
    Get walking directions from OpenRouteService API.
    Falls back to None if API key not set or request fails.
    """
    api_key = getattr(settings, "ORS_API_KEY", None)
    if not api_key or api_key == "":
        return None

    try:
        url = "https://api.openrouteservice.org/v2/directions/foot-walking"
        params = {
            "api_key": api_key,
            "start": f"{from_lng},{from_lat}",
            "end": f"{to_lng},{to_lat}",
        }
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(url, params=params)
            if response.status_code != 200:
                logger.warning(f"ORS API returned {response.status_code}")
                return None

            data = response.json()
            features = data.get("features", [])
            if not features:
                return None

            props = features[0]["properties"]["summary"]
            coords = features[0]["geometry"]["coordinates"]

            return WalkingSegment(
                distance_meters=round(props["distance"], 0),
                duration_minutes=round(props["duration"] / 60, 1),
                geometry=coords,
            )
    except Exception as e:
        logger.warning(f"ORS walking directions failed: {e}")
        return None


# ── Line Direction Helpers ────────────────────────────────────
def _get_line_direction(line: str, stations: dict[str, Any], first_station_id: str, last_station_id: str) -> str:
    """Determine travel direction description for a metro line segment."""
    # Collect all stations on this line in sequence order
    line_stations = sorted(
        [s for s in stations.values() if s["line"] == line],
        key=lambda s: s.get("sequence", 0),
    )

    if not line_stations:
        return f"on {line} line"

    first_idx = next((i for i, s in enumerate(line_stations) if s["id"] == first_station_id), 0)
    last_idx = next((i for i, s in enumerate(line_stations) if s["id"] == last_station_id), len(line_stations) - 1)

    if last_idx > first_idx:
        terminus = line_stations[-1]["name"]
    else:
        terminus = line_stations[0]["name"]

    return f"towards {terminus}"


# ── Multi-modal Travel Options Helper ────────────────────────
def _compute_travel_options(walking_seg: WalkingSegment, is_source: bool, station_name: str, place_name: str) -> list[TravelModeOption]:
    """Compute multi-modal travel scenarios (Walking, Vehicle, Public Bus) for first/last mile."""
    d_meters = walking_seg.distance_meters
    d_km = d_meters / 1000.0
    w_mins = walking_seg.duration_minutes

    # 1. Walking
    walking_opt = TravelModeOption(
        mode="walking",
        mode_name="Walking",
        icon="footprints",
        distance_meters=d_meters,
        duration_minutes=w_mins,
        fare_estimate="Free",
        description=f"Direct walk along pedestrian path to {station_name}" if is_source else f"Direct walk to {place_name}"
    )

    # 2. Vehicle (Two-Wheeler / Auto Rickshaw / Cab)
    veh_dist = round(d_meters * 1.1, 0)
    veh_km = veh_dist / 1000.0
    if d_meters < 400:
        veh_time = round(max(1.5, veh_km / 20.0 * 60 + 1), 1)
        veh_fare = "₹25 (Min fare)"
        veh_desc = f"Walking is usually faster for under 400m to {station_name}" if is_source else f"Walking is usually faster for under 400m to {place_name}"
    else:
        veh_time = round(veh_km / 22.0 * 60 + 2.5, 1)  # 22 km/h avg city speed + 2.5 min pickup/drop/traffic
        auto_fare = 25 + max(0.0, (veh_km - 1.5)) * 17
        bike_fare = 15 + veh_km * 8
        veh_fare = f"₹{round(bike_fare)} (Bike) / ₹{round(auto_fare)} (Auto)"
        veh_desc = f"Quickest motorized drop to {station_name}" if is_source else f"Auto Rickshaw or Cab drop to {place_name}"

    vehicle_opt = TravelModeOption(
        mode="vehicle",
        mode_name="Auto / Cab / Bike",
        icon="car",
        distance_meters=veh_dist,
        duration_minutes=veh_time,
        fare_estimate=veh_fare,
        description=veh_desc
    )

    # 3. Public Transport (PMPML Bus / Feeder Service / Shared Auto)
    pub_dist = round(d_meters * 1.15, 0)
    pub_km = pub_dist / 1000.0
    if d_meters < 700:
        pub_time = w_mins
        pub_fare = "Free / ₹10"
        pub_desc = "Walking recommended for short distance (< 700m)"
    else:
        pub_time = round(pub_km / 15.0 * 60 + 5.0, 1)  # 15 km/h avg speed + 5 min wait/stop time
        pub_fare = "₹10–₹15 (PMPML Bus / Shared Auto)"
        pub_desc = f"PMPML bus or feeder service connecting to {station_name}" if is_source else f"PMPML bus or shared auto to {place_name}"

    public_opt = TravelModeOption(
        mode="public_transport",
        mode_name="Public Bus / Feeder",
        icon="bus",
        distance_meters=pub_dist,
        duration_minutes=pub_time,
        fare_estimate=pub_fare,
        description=pub_desc
    )

    return [walking_opt, vehicle_opt, public_opt]


# ── Journey Planner ───────────────────────────────────────────
async def plan_journey(request: JourneyRequest) -> JourneyResult:
    """
    Main journey planning orchestrator.

    1. Find nearest source metro station
    2. Find nearest destination metro station
    3. Compute optimal metro route
    4. Get walking directions (ORS if available, else Haversine estimate)
    5. Build journey steps
    6. Generate AI summary
    """
    start_time = time.time()
    city = request.city.lower()
    stations = _load_stations(city)

    # Step 1 & 2: Find nearest stations
    source_station = find_nearest_station(request.source_lat, request.source_lng, city)
    dest_station = find_nearest_station(request.dest_lat, request.dest_lng, city)

    logger.info(f"Nearest stations: {source_station.name} -> {dest_station.name} ({time.time() - start_time:.3f}s)")

    # Step 3: Compute metro route
    route = _find_metro_route(source_station.id, dest_station.id, stations)
    if route is None:
        raise ValueError(f"No metro route found between {source_station.name} and {dest_station.name}")

    # Step 4: Walking directions
    source_walking_ors = await _get_ors_walking(
        request.source_lat, request.source_lng,
        source_station.latitude, source_station.longitude,
    )
    source_walking = source_walking_ors or _estimate_walking(
        request.source_lat, request.source_lng,
        source_station.latitude, source_station.longitude,
    )

    dest_walking_ors = await _get_ors_walking(
        dest_station.latitude, dest_station.longitude,
        request.dest_lat, request.dest_lng,
    )
    dest_walking = dest_walking_ors or _estimate_walking(
        dest_station.latitude, dest_station.longitude,
        request.dest_lat, request.dest_lng,
    )

    # Step 5: Build metro segments with direction info
    metro_segments = []
    for seg in route["line_segments"]:
        line = seg["line"]
        seg_station_ids = seg["stations"]
        seg_station_names = [stations[sid]["name"] for sid in seg_station_ids]
        direction = _get_line_direction(line, stations, seg_station_ids[0], seg_station_ids[-1])

        # Prettify line name
        line_name_map = {
            "purple": "Purple Line",
            "aqua": "Aqua Line",
            "line3": "Line 3",
        }
        line_name = line_name_map.get(line, line.replace("_", " ").title() + " Line")

        metro_segments.append(
            MetroSegment(
                line=line,
                line_name=line_name,
                stations=seg_station_ids,
                station_names=seg_station_names,
                direction=direction,
                station_count=len(seg_station_ids),
            )
        )

    # Build interchange names
    interchange_names = [stations[sid]["name"] for sid in route["interchanges"]]

    # Step 5: Compute multi-modal options for first/last mile
    source_options = _compute_travel_options(
        source_walking, is_source=True,
        station_name=source_station.name, place_name=request.source_name or "Source"
    )
    dest_options = _compute_travel_options(
        dest_walking, is_source=False,
        station_name=dest_station.name, place_name=request.dest_name or "Destination"
    )

    # Step 6: Build journey steps
    journey_steps = []
    journey_steps.append(
        f"Travel from {request.source_name or 'source'} to {source_station.name} Metro Station "
        f"({int(source_walking.distance_meters)}m, ~{round(source_walking.duration_minutes)} min walk, or check Auto/Bus options)"
    )

    for seg in metro_segments:
        journey_steps.append(
            f"Board {seg.line_name} at {seg.station_names[0]} {seg.direction} "
            f"({seg.station_count} stations)"
        )
        if seg != metro_segments[-1]:
            journey_steps.append(f"Change lines at {seg.station_names[-1]}")

    journey_steps.append(
        f"Exit at {dest_station.name} Metro Station and travel to {request.dest_name or 'destination'} "
        f"({int(dest_walking.distance_meters)}m, ~{round(dest_walking.duration_minutes)} min walk, or check Auto/Bus options)"
    )

    # Step 7: Generate AI summary
    ai_summary = _generate_ai_summary(
        request.source_name or "Source",
        request.dest_name or "Destination",
        source_station,
        dest_station,
        source_walking,
        dest_walking,
        source_options,
        dest_options,
        metro_segments,
        interchange_names,
        len(route["path"]),
        metro_time=route["estimated_time_min"],
        walking_time=source_walking.duration_minutes + dest_walking.duration_minutes,
        total_time=(source_walking.duration_minutes + dest_walking.duration_minutes) + route["estimated_time_min"],
    )

    # Step 8: Assemble metro route coordinates
    metro_route_coords = []
    if route.get("path_coords"):
        metro_route_coords = route["path_coords"]
    else:
        for sid in route["path"]:
            st = stations[sid]
            metro_route_coords.append([st["longitude"], st["latitude"]])

    metro_time = route.get("estimated_time_min", (route["total_distance_km"] / 33.0) * 60)
    walking_time = source_walking.duration_minutes + dest_walking.duration_minutes
    total_time = metro_time + walking_time

    elapsed = time.time() - start_time
    logger.info(f"Journey planned in {elapsed:.3f}s")

    return JourneyResult(
        success=True,
        source_station=source_station,
        dest_station=dest_station,
        source_walking=source_walking,
        dest_walking=dest_walking,
        source_options=source_options,
        dest_options=dest_options,
        metro_segments=metro_segments,
        interchanges=interchange_names,
        total_stations=len(route["path"]),
        metro_distance_km=route["total_distance_km"],
        metro_time_minutes=round(metro_time, 1),
        walking_time_minutes=round(walking_time, 1),
        total_time_minutes=round(total_time, 1),
        ai_summary=ai_summary,
        journey_steps=journey_steps,
        metro_route_coords=metro_route_coords,
    )


def _generate_ai_summary(
    source_name: str,
    dest_name: str,
    source_station: StationInfo,
    dest_station: StationInfo,
    source_walking: WalkingSegment,
    dest_walking: WalkingSegment,
    source_options: list[TravelModeOption],
    dest_options: list[TravelModeOption],
    metro_segments: list[MetroSegment],
    interchange_names: list[str],
    total_stations: int,
    metro_time: float,
    walking_time: float,
    total_time: float,
) -> str:
    """
    Generate a natural-language AI summary of the journey.
    Uses Gemini if available, otherwise falls back to a template.
    """
    # Build the structured data for the prompt
    route_description = []
    for i, seg in enumerate(metro_segments):
        if i == 0:
            route_description.append(f"Board {seg.line_name} at {seg.station_names[0]} {seg.direction}")
        else:
            route_description.append(f"Change to {seg.line_name} at {seg.station_names[0]} {seg.direction}")
        route_description.append(f"  Travel {seg.station_count} stations to {seg.station_names[-1]}")

    route_text = "\n".join(route_description)
    interchange_text = ", ".join(interchange_names) if interchange_names else "None (direct route)"

    def get_mode_details(options: list[TravelModeOption]) -> dict:
        details = {}
        for opt in options:
            if opt.mode == "walking":
                details["walk_minutes"] = round(opt.duration_minutes)
                details["walk_meters"] = int(opt.distance_meters)
            elif opt.mode == "vehicle":
                details["auto_minutes"] = round(opt.duration_minutes)
                details["auto_fare"] = opt.fare_estimate or "Fare varies"
            elif opt.mode == "public_transport":
                details["bus_minutes"] = round(opt.duration_minutes)
                details["bus_fare"] = opt.fare_estimate or "Fare varies"
        return details

    src_det = get_mode_details(source_options)
    dst_det = get_mode_details(dest_options)

    prompt_data = JOURNEY_SUMMARY_PROMPT.format(
        source_name=source_name,
        dest_name=dest_name,
        source_station_name=source_station.name,
        dest_station_name=dest_station.name,
        source_walk_meters=src_det.get("walk_meters", int(source_walking.distance_meters)),
        source_walk_minutes=src_det.get("walk_minutes", round(source_walking.duration_minutes)),
        source_auto_minutes=src_det.get("auto_minutes", max(2, round(source_walking.duration_minutes / 4.5))),
        source_auto_fare=src_det.get("auto_fare", "₹50 Auto / ₹25 Bike"),
        source_bus_minutes=src_det.get("bus_minutes", max(5, round(source_walking.duration_minutes / 3.0))),
        source_bus_fare=src_det.get("bus_fare", "₹10 Bus"),
        dest_walk_meters=dst_det.get("walk_meters", int(dest_walking.distance_meters)),
        dest_walk_minutes=dst_det.get("walk_minutes", round(dest_walking.duration_minutes)),
        dest_auto_minutes=dst_det.get("auto_minutes", max(2, round(dest_walking.duration_minutes / 4.5))),
        dest_auto_fare=dst_det.get("auto_fare", "₹50 Auto / ₹25 Bike"),
        dest_bus_minutes=dst_det.get("bus_minutes", max(5, round(dest_walking.duration_minutes / 3.0))),
        dest_bus_fare=dst_det.get("bus_fare", "₹10 Bus"),
        route_description=route_text,
        interchange_info=interchange_text,
        total_stations=total_stations,
        metro_time=round(metro_time),
    )

    try:
        from app.services.gemini_service import gemini_service

        summary = gemini_service.generate_response(
            prompt_data,
            system_instruction="You are Metro AI, generating clear, concise, complete, and practical step-by-step metro journey guides. Always emphasize that users can choose Walking OR Auto/Bike/Cab OR PMPML Bus to reach or exit metro stations, so they never feel forced to walk long distances. Complete your response fully without truncating."
        )
        return summary
    except Exception as e:
        logger.warning(f"AI summary generation failed, using template: {e}")
        return _template_summary(
            source_name, dest_name, source_station, dest_station,
            source_walking, dest_walking, source_options, dest_options,
            metro_segments, interchange_names, total_stations, metro_time, walking_time, total_time,
        )


def _template_summary(
    source_name: str,
    dest_name: str,
    source_station: StationInfo,
    dest_station: StationInfo,
    source_walking: WalkingSegment,
    dest_walking: WalkingSegment,
    source_options: list[TravelModeOption],
    dest_options: list[TravelModeOption],
    metro_segments: list[MetroSegment],
    interchange_names: list[str],
    total_stations: int,
    metro_time: float,
    walking_time: float,
    total_time: float,
) -> str:
    """Fallback template-based summary when Gemini is unavailable."""
    lines = []
    src_auto = source_options[1] if len(source_options) > 1 else None
    src_bus = source_options[2] if len(source_options) > 2 else None
    dst_auto = dest_options[1] if len(dest_options) > 1 else None
    dst_bus = dest_options[2] if len(dest_options) > 2 else None

    lines.append(
        f"1. **To {source_station.name} Metro Station** from {source_name} ({int(source_walking.distance_meters)}m):\n"
        f"   • **Walk:** ~{round(source_walking.duration_minutes)} min\n"
        f"   • **Auto/Bike:** ~{src_auto.duration_minutes if src_auto else max(2, round(source_walking.duration_minutes/4.5))} min ({src_auto.fare_estimate if src_auto else '₹50 Auto'})\n"
        f"   • **PMPML Bus:** ~{src_bus.duration_minutes if src_bus else max(5, round(source_walking.duration_minutes/3.0))} min ({src_bus.fare_estimate if src_bus else '₹10 Bus'})"
    )
    lines.append("")

    step_num = 2
    for i, seg in enumerate(metro_segments):
        if i == 0:
            lines.append(f"{step_num}. **Board the {seg.line_name}** {seg.direction} at **{seg.station_names[0]}**.")
        else:
            lines.append(f"{step_num}. **Interchange to {seg.line_name}** {seg.direction} at **{seg.station_names[0]}**.")
        step_num += 1
        lines.append(f"   Travel **{seg.station_count} station{'s' if seg.station_count > 1 else ''}** to **{seg.station_names[-1]}** (~{round(metro_time)} min total metro ride).")
        lines.append("")

    lines.append(
        f"{step_num}. **Exit at {dest_station.name} Metro Station** and reach {dest_name} ({int(dest_walking.distance_meters)}m):\n"
        f"   • **Walk:** ~{round(dest_walking.duration_minutes)} min\n"
        f"   • **Auto/Bike:** ~{dst_auto.duration_minutes if dst_auto else max(2, round(dest_walking.duration_minutes/4.5))} min ({dst_auto.fare_estimate if dst_auto else '₹50 Auto'})\n"
        f"   • **PMPML Bus:** ~{dst_bus.duration_minutes if dst_bus else max(5, round(dest_walking.duration_minutes/3.0))} min ({dst_bus.fare_estimate if dst_bus else '₹10 Bus'})"
    )
    return "\n".join(lines)
