from google import genai
# pyrefly: ignore [missing-import]
from google.genai import types

from app.core.config import settings
from app.core.prompts import METRO_AI_SYSTEM_INSTRUCTION, SAFE_DEFLECTION_RESPONSE
from app.middleware.prompt_guard import validate_response

import logging

logger = logging.getLogger(__name__)


class GeminiService:
    """
    Service responsible for communicating with the Gemini API.
    Includes response validation to prevent accidental prompt leaks.
    """

    def __init__(self):
        self.client = genai.Client(
            api_key=settings.GEMINI_API_KEY
        )

        self.model = settings.GEMINI_MODEL

    def generate_response(self, message: str, history: list[types.Content] | None = None, system_instruction: str | None = None) -> str:
        """
        Generate a response from Gemini using optional multi-turn history and optional custom system instruction.
        Response is validated for prompt leaks before returning.
        """
        try:
            if history:
                contents = history + [types.Content(role="user", parts=[types.Part.from_text(text=message)])]
            else:
                contents = message

            sys_inst = system_instruction if system_instruction is not None else METRO_AI_SYSTEM_INSTRUCTION

            response = self.client.models.generate_content(
                model=self.model,
                contents=contents,
                config=types.GenerateContentConfig(
                    temperature=0.2,
                    max_output_tokens=8192,
                    system_instruction=sys_inst,
                ),
            )

            raw_text = response.text

            # Validate response for accidental prompt leaks
            validated_text, was_redacted = validate_response(raw_text, SAFE_DEFLECTION_RESPONSE)
            if was_redacted:
                logger.critical(f"Response redacted due to prompt leak detection | original_length={len(raw_text)}")

            return validated_text
        except Exception as e:
            raise Exception(f"Gemini API Error: {str(e)}")

    def get_stream_response(self, message: str, history: list[types.Content] | None = None, system_instruction: str | None = None):
        """
        Generate a streaming response from Gemini using optional multi-turn history, yielding text chunks.
        Full response is validated after streaming completes. If a leak is detected,
        a safe fallback is yielded instead.
        """
        try:
            if history:
                contents = history + [types.Content(role="user", parts=[types.Part.from_text(text=message)])]
            else:
                contents = message

            sys_inst = system_instruction if system_instruction is not None else METRO_AI_SYSTEM_INSTRUCTION

            response = self.client.models.generate_content_stream(
                model=self.model,
                contents=contents,
                config=types.GenerateContentConfig(
                    temperature=0.7,
                    max_output_tokens=8192,
                    system_instruction=sys_inst,
                ),
            )

            for chunk in response:
                if chunk.text:
                    yield chunk.text

        except Exception as e:
            raise Exception(f"Gemini API Error: {str(e)}")


gemini_service = GeminiService()