from typing import List, Optional
from .chinese_chars import selectRandomChineseCharacter
from .english import selectRandomEnglishLetter
from .tiles import LanguageType
import uuid
from collections import Counter

class Score:
    def __init__(
        self, 
        english_words: List[str], 
        chinese_words: List[str], 
        synergy_score: float, 
        synergy_explanation: str,
        base_value: float,
        move_language: LanguageType
    ):
        self.english_words = english_words
        self.chinese_words = chinese_words
        self.synergy_score = synergy_score  # 0 to 10
        self.synergy_explanation = synergy_explanation
        
        # Multiplier: 1.0 (at 0/10) to 3.0 (at 10/10)
        self.multiplier = 1 + (2 * (self.synergy_score / 10))
        self.final_score = base_value * self.multiplier
        self.move_language = move_language

    def to_dict(self):
        return {
            "english_words": self.english_words,
            "chinese_words": self.chinese_words,
            "synergy_score": self.synergy_score,
            "synergy_explanation": self.synergy_explanation,
            "multiplier": round(self.multiplier, 2),
            "final_score": round(self.final_score, 2),
            "move_language": self.move_language
        }

class Hand:
    def __init__(self):
        self.chinese_characters: List[str] = []
        self.english_letters: List[str] = []

    def replenish_hand(self):
        """Refills hand to exactly 10 of each type."""
        while len(self.chinese_characters) < 20:
            self.chinese_characters.append(selectRandomChineseCharacter())
            
        while len(self.english_letters) < 10:
            self.english_letters.append(selectRandomEnglishLetter())

    def to_dict(self):
        return {
            "chinese": self.chinese_characters,
            "english": self.english_letters
        }
    
    def has_required_tiles(self, pending_values: List[str], lang: LanguageType) -> bool:
        """
        Checks if the hand contains all the characters needed for the move,
        accounting for duplicates.
        """
        # 1. Select the correct sub-hand
        current_hand = self.english_letters if lang == LanguageType.ENGLISH else self.chinese_characters
        
        # 2. Count occurrences in the hand and the requested move
        hand_counts = Counter(current_hand)
        move_counts = Counter(pending_values)
        
        # 3. Ensure every character in the move exists in the hand in sufficient quantity
        for char, count in move_counts.items():
            if hand_counts[char] < count:
                return False
        return True

    def consume_tiles(self, pending_values: List[str], lang: LanguageType):
        """
        Removes the used tiles from the hand. 
        Assumes has_required_tiles was already called and returned True.
        """
        current_hand = self.english_letters if lang == LanguageType.ENGLISH else self.chinese_characters
        
        for char in pending_values:
            # remove() removes only the first occurrence of the value
            current_hand.remove(char)

class Player:
    def __init__(self, username: str, session_id: str):
        self.username = username
        self.session_id = session_id
        self.hand = Hand()
        self.score_history: List[Score] = []
        
        # Initial draw
        self.hand.replenish_hand()

    @property
    def total_score(self) -> float:
        return sum(s.final_score for s in self.score_history)
    
    def to_dict(self):
        return {
            "username": self.username,
            "session_id": self.session_id,
            "hand": self.hand.to_dict(),
            "score_history": [s.to_dict() for s in self.score_history],
            "total_score": round(self.total_score, 2)
        }