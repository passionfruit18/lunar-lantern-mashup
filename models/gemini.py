import os
import json
from google import genai
from dotenv import load_dotenv
from dataclasses import dataclass
from typing import List

load_dotenv()


@dataclass
class SynergyScoreResult:
    synergy_score: float
    synergy_explanation: str

    @classmethod
    def from_dict(cls, data: dict) -> 'SynergyScoreResult':
        """
        Initializes the object from a dictionary, with safety fallbacks
        to prevent crashes if the AI returns unexpected keys.
        """
        return cls(
            # Ensure float type, default to 0.0 if missing
            synergy_score=float(data.get("synergy_score", 0.0)),
            # Default to a generic string if missing
            synergy_explanation=str(data.get("synergy_explanation", "No explanation provided."))
        )
    
class SynergyEngine:
    def __init__(self):
        # The new client-based approach
        self.client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        self.model_id = "gemini-2.5-flash" # Use the latest 2026 model!

    def calculate_synergy(self, english_words: List[str], chinese_words: List[str]) -> SynergyScoreResult:
        prompt = f"""
        Analyze the relationship between the English words '{", ".join(english_words)}' 
        and the Chinese words '{", ".join(chinese_words)}'.
        If there is any relationship between an English word and a Chinese word, highlight it.
        Return a JSON object with:
        1. 'synergy_score': (0-10) based on semantic or poetic or paradoxical connection.
        2. 'synergy_explanation': A short, witty 1-sentence explanation in English interspersed with some Chinese characters.
        
        Example: 'Fire' and '水' (Water) = Score 8, "A classic elemental clash!"
        """
        
        response = self.client.models.generate_content(
            model=self.model_id,
            contents=prompt,
            config={
                'response_mime_type': 'application/json',
                'response_schema': SynergyScoreResult,
            }
        )
        
        # The response is now automatically parsed!
        
        print(f"Gemini Response: {response.parsed}")
        return response.parsed
    