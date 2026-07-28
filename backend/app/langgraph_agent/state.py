"""
LangGraph State Definition for Metro Route Chatbot.

MetroChatState holds all intermediate data flowing through
the think → extract_intent → geocode → nearest_station → route_planning → format_response pipeline.
"""

from typing import TypedDict


class MetroChatState(TypedDict):
    # ── Input ────────────────────────────────────────────────
    user_message: str
    session_id: str

    # ── LLM Thinking ─────────────────────────────────────────
    thinking: str

    # ── Intent Extraction ─────────────────────────────────────
    intent_is_route: bool        # True if user wants a metro route
    source_place: str            # Extracted source location name
    destination_place: str       # Extracted destination location name

    # ── Geocoding (Photon + Nominatim) ────────────────────────
    source_lat: float | None
    source_lng: float | None
    dest_lat: float | None
    dest_lng: float | None
    geocode_error: str | None    # Set if geocoding fails

    # ── Nearest Metro Stations ────────────────────────────────
    source_station: dict | None  # Station info from journey_service
    dest_station: dict | None
    station_error: str | None    # Set if station lookup fails

    # ── Dijkstra Route Result ─────────────────────────────────
    route_result: dict | None    # {path, total_distance_km, estimated_time_min, interchanges, line_segments}
    route_error: str | None      # Set if no route found

    # ── Final Output ──────────────────────────────────────────
    final_response: str          # Markdown-formatted chatbot reply
    structured_route: dict | None  # Full structured route for frontend map rendering
