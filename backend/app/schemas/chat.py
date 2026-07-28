from pydantic import BaseModel, Field
from typing import Any


class ChatRequest(BaseModel):
    message: str = Field(
        ...,
        min_length=1,
        max_length=5000,
        description="User message"
    )
    session_id: str | None = Field(
        default="default_session",
        description="Optional conversation session ID for history tracking"
    )


class ChatResponse(BaseModel):
    success: bool
    response: str
    model: str
    thinking_process: str
    structured_route: dict[str, Any] | None = None  # Full route data for frontend map rendering


