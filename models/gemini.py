import os
import json
import google.generativeai as genai
from dotenv import load_dotenv
from dataclasses import dataclass
from typing import List

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))



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
        self.model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            generation_config={"response_mime_type": "application/json"}
        )

    def calculate_synergy(self, english_words: List[str], chinese_words: List[str]) -> SynergyScoreResult:
        prompt = f"""
        Analyze the relationship between the English words '{", ".join(english_words)}' 
        and the Chinese words '{", ".join(chinese_words)}'.
        Return a JSON object with:
        1. 'synergy_score': (0-10) based on semantic or poetic connection.
        2. 'synergy_explanation': A short, witty 1-sentence explanation in English interspersed with some Chinese characters.
        
        Example: 'Fire' and '水' (Water) = Score 8, "A classic elemental clash!"
        """
        
        response = self.model.generate_content(prompt)
        print(f"Gemini Response: {response}")
        return SynergyScoreResult.from_dict(json.loads(response.text))
    