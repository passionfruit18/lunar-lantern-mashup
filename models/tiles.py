
from typing import List, Optional, Union

from enum import Enum

class LanguageType(str, Enum):
    ENGLISH = "ENGLISH"
    CHINESE = "CHINESE"

class EnglishTile:
    def __init__(self, char: str):
        self.char = char.upper()
        self.points = 1 # Simplified for now

    def to_dict(self):
        return {
            "type": LanguageType.ENGLISH,
            "display": self.char,
            "points": self.points
        }

class ChineseTileGroup:
    def __init__(self, parts: List[str]):
        self.parts = parts  # e.g., ["氵", "工", "口"]
        self.actualized_char: Optional[str] = None

    def verify(self) -> bool:
        """
        Logic to check if 'parts' exist in a dictionary 
        to form a valid Hanzi.
        """
        # Placeholder for dictionary lookup logic
        # TODO: Implement properly
        return len(self.parts) > 0 

    def combine(self) -> Optional[str]:
        """Actualises the components into a single character."""
        if self.verify():
            # Logic to merge parts would go here
            # TODO: Implement properly
            self.actualized_char = "".join(self.parts) 
            return self.actualized_char
        return None
    
    def to_dict(self):
        return {
            "type": LanguageType.CHINESE,
            "display": self.actualized_char,
            "components": self.parts
        }

# Type alias for clarity
TileType = Union[EnglishTile, ChineseTileGroup]