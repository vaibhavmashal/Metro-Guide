from pydantic import BaseModel, Field


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


