"""
Journey Planning API endpoints.
"""

from fastapi import APIRouter, HTTPException
from app.schemas.journey import (
    JourneyRequest,
    JourneyResult,
    JourneyErrorResponse,
    NearestStationResponse,
)
from app.services.journey_service import (
    plan_journey,
    find_nearest_station,
    get_all_stations,
)

router = APIRouter(
    prefix="/journey",
    tags=["Journey Planning"],
)


@router.post("/plan", response_model=JourneyResult)
async def journey_plan_endpoint(request: JourneyRequest):
    """
    Plan a complete metro journey from source to destination coordinates.

    Returns:
      - Nearest source & destination metro stations
      - Optimal metro route with interchanges
      - Walking directions to/from metro stations
      - Estimated travel times
      - AI-generated natural-language summary
    """
    try:
        result = await plan_journey(request)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Journey planning failed: {str(e)}")


@router.get("/nearest")
async def nearest_station_endpoint(lat: float, lng: float, city: str = "pune"):
    """
    Find the nearest metro station to given coordinates.
    """
    try:
        station = find_nearest_station(lat, lng, city)
        return NearestStationResponse(station=station, city=city)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/stations/{city}")
async def list_stations_endpoint(city: str):
    """
    Get all metro stations for a given city.
    """
    try:
        stations = get_all_stations(city)
        return {
            "city": city,
            "count": len(stations),
            "stations": list(stations.values()),
        }
    except (ValueError, FileNotFoundError) as e:
        raise HTTPException(status_code=404, detail=str(e))
