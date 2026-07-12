from google import genai
# pyrefly: ignore [missing-import]
from google.genai import types

from app.core.config import settings


class GeminiService:
    """
    Service responsible for communicating with the Gemini API.
    """

    def __init__(self):
        self.client = genai.Client(
            api_key=settings.GEMINI_API_KEY
        )

        self.model = settings.GEMINI_MODEL

    def generate_response(self, message: str) -> str:
        """
        Generate a response from Gemini.
        """

        try:

            response = self.client.models.generate_content(
                model=self.model,
                contents=message,
                config=types.GenerateContentConfig(
                    temperature=0.7,
                    max_output_tokens=1024,
                    system_instruction=(
                        "You are Metro AI, an intelligent assistant for the Metro Guide transit application. "
                        "Help users with metro routes, station details, travel tips, interchanges, fare guidance, "
                        "and navigation across metro cities like Pune, Delhi, Mumbai, and Bangalore. "
                        "Keep answers clear, concise, friendly, and visually structured with bullet points when helpful."
                    ),
                ),
            )

            return response.text

        except Exception as e:
            raise Exception(f"Gemini API Error: {str(e)}")


gemini_service = GeminiService()