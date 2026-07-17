"""
Pydantic schemas for journey planning API.
"""

from pydantic import BaseModel, Field


class JourneyRequest(BaseModel):
    source_lat: float = Field(..., description="Source latitude")
    source_lng: float = Field(..., description="Source longitude")
    dest_lat: float = Field(..., description="Destination latitude")
    dest_lng: float = Field(..., description="Destination longitude")
    source_name: str | None = Field(default=None, description="Source place name")
    dest_name: str | None = Field(default=None, description="Destination place name")
    city: str = Field(default="pune", description="City identifier (pune, bangalore)")


class StationInfo(BaseModel):
    id: str
    name: str
    line: str
    latitude: float
    longitude: float
    distance_from_user_km: float = Field(description="Distance from user's location in km")
    distance_from_user_meters: float = Field(description="Distance from user's location in meters")


class WalkingSegment(BaseModel):
    distance_meters: float
    duration_minutes: float
    geometry: list[list[float]] = Field(default_factory=list, description="[[lng, lat], ...] polyline")


class MetroSegment(BaseModel):
    line: str
    line_name: str
    stations: list[str] = Field(description="Station IDs in order")
    station_names: list[str] = Field(description="Station names in order")
    direction: str = Field(description="Direction of travel, e.g. 'towards Ramwadi'")
    station_count: int


class TravelModeOption(BaseModel):
    mode: str = Field(description="walking, vehicle, or public_transport")
    mode_name: str = Field(description="Walking, Auto / Two-Wheeler, or Public Bus / Feeder")
    icon: str = Field(description="footprints, car, or bus")
    distance_meters: float
    duration_minutes: float
    fare_estimate: str | None = Field(default=None, description="Estimated fare, e.g. '₹30-40 (Auto)' or 'Free'")
    description: str = Field(description="Practical suggestion or tip")


class JourneyResult(BaseModel):
    success: bool = True
    source_station: StationInfo
    dest_station: StationInfo
    source_walking: WalkingSegment
    dest_walking: WalkingSegment
    source_options: list[TravelModeOption] = Field(default_factory=list, description="Multi-modal options to reach source metro station")
    dest_options: list[TravelModeOption] = Field(default_factory=list, description="Multi-modal options from exit metro station to destination")
    metro_segments: list[MetroSegment]
    interchanges: list[str] = Field(description="Interchange station names")
    total_stations: int
    metro_distance_km: float
    metro_time_minutes: float
    walking_time_minutes: float
    total_time_minutes: float
    ai_summary: str = Field(default="", description="Natural-language journey summary")
    journey_steps: list[str] = Field(default_factory=list, description="Step-by-step journey text")
    metro_route_coords: list[list[float]] = Field(
        default_factory=list, description="[[lng, lat], ...] metro path coordinates"
    )


class NearestStationResponse(BaseModel):
    station: StationInfo
    city: str


class JourneyErrorResponse(BaseModel):
    success: bool = False
    error: str
