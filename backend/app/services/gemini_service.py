from google import genai
# pyrefly: ignore [missing-import]
from google.genai import types

from app.core.config import settings
from app.core.prompts import METRO_AI_SYSTEM_INSTRUCTION


class GeminiService:
    """
    Service responsible for communicating with the Gemini API.
    """

    def __init__(self):
        self.client = genai.Client(
            api_key=settings.GEMINI_API_KEY
        )

        self.model = settings.GEMINI_MODEL

    def generate_response(self, message: str, history: list[types.Content] | None = None) -> str:
        """
        Generate a response from Gemini using optional multi-turn history.
        """
        try:
            if history:
                contents = history + [types.Content(role="user", parts=[types.Part.from_text(text=message)])]
            else:
                contents = message

            response = self.client.models.generate_content(
                model=self.model,
                contents=contents,
                config=types.GenerateContentConfig(
                    temperature=0.7,
                    max_output_tokens=1024,
                    system_instruction=METRO_AI_SYSTEM_INSTRUCTION,
                ),
            )
            return response.text
        except Exception as e:
            raise Exception(f"Gemini API Error: {str(e)}")

    def get_stream_response(self, message: str, history: list[types.Content] | None = None):
        """
        Generate a streaming response from Gemini using optional multi-turn history, yielding text chunks.
        """
        try:
            if history:
                contents = history + [types.Content(role="user", parts=[types.Part.from_text(text=message)])]
            else:
                contents = message

            response = self.client.models.generate_content_stream(
                model=self.model,
                contents=contents,
                config=types.GenerateContentConfig(
                    temperature=0.7,
                    max_output_tokens=1024,
                    system_instruction=METRO_AI_SYSTEM_INSTRUCTION,
                ),
            )

            for chunk in response:
                if chunk.text:
                    yield chunk.text

        except Exception as e:
            raise Exception(f"Gemini API Error: {str(e)}")


gemini_service = GeminiService()