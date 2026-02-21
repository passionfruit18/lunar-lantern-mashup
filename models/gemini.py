import os
import json
from google import genai
from dotenv import load_dotenv
from dataclasses import dataclass
from typing import List, Tuple
from .player import Player
from pydantic import BaseModel

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
    
class HintResult(BaseModel):
    english_hint: str
    chinese_hint: str

class SynergyEngine:
    def __init__(self):
        # The new client-based approach
        self.client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        self.model_id = "gemini-2.5-flash" # Use the latest 2026 model!

    def calculate_synergy(self, english_words: List[str], chinese_words: List[str]) -> SynergyScoreResult:
        eng_words_joined = ", ".join(english_words)
        chin_words_joined = ", ".join(chinese_words)
        prompt = f"""
        Analyze the relationship between the English words '{eng_words_joined}' 
        and the Chinese words '{chin_words_joined}'.
        If there is any relationship between an English word and a Chinese word, highlight it.
        Return a JSON object with:
        1. 'synergy_score': (0-10) based on semantic or poetic or paradoxical connection.
        2. 'synergy_explanation': A short, witty 1-sentence explanation in English interspersed with some Chinese characters.
        
        Example: 'Fire' and '水' (Water) = Score 8, "A classic elemental clash!"
        """

        print(f"Requesting Gemini to analyse synergy between ENGLISH: [{eng_words_joined}] and CHINESE: [{chin_words_joined}]")
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
    
    def call_gemini_for_hint(self, player: Player) -> HintResult:
        eng_letters_joined = ", ".join(player.hand.english_letters)
        chin_words_joined = ", ".join(player.hand.chinese_characters)
        prompt = f"""
        Give the user a hint.
        
        Return a JSON object with:
        1. 'english_hint': How to form an English word with English letters '{eng_letters_joined}'. Literally give a few examples. Focus on STEM/AI examples. Give brief Latin/Greek/etc. etymology for curious students of English.
        2. 'chinese_hint': Explain (in English) the etymology of Chinese words '{chin_words_joined}'. First give the meaning of the word in a STEM/AI context. This should be inside an HTML <ul> element, each word has a <li> element. The whole explanation should seamlessly blend ancient heritage, historical continuity, and modern metaphor for heritage learners.
        """

        print(f"Requesting Gemini to give a hint for ENGLISH: [{eng_letters_joined}] and CHINESE: [{chin_words_joined}]")
        response = self.client.models.generate_content(
            model=self.model_id,
            contents=prompt,
            config={
                'response_mime_type': 'application/json',
                'response_schema': HintResult,
            }
        )
        
        # The response is now automatically parsed!
        
        print(f"Gemini Response: {response.parsed}")
        return response.parsed