from app.schemas.chat import ChatRequest, ChatResponse

request = ChatRequest(
    message="Hello Metro AI"
)

print(request)

response = ChatResponse(
    success=True,
    response="Hello! How can I help you?",
    model="gemini-2.5-flash",
    thinking_process="User greeted the assistant."
)

print(response)