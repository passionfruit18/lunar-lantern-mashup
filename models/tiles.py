
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

import re
from typing import List, Optional, Union

def create_tile(user_input: str) -> Union[EnglishTile, ChineseTileGroup]:
    """
    Factory function to return an EnglishTile or ChineseTileGroup 
    based on the input character.
    """
    # Remove whitespace just in case
    char = user_input.strip()
    
    if not char:
        raise ValueError("Input cannot be empty")

    # Regex for English letters (A-Z, a-z)
    if re.match(r'^[a-zA-Z]$', char):
        return EnglishTile(char)
    
    # Check if the character is in the Chinese/Radical Unicode blocks
    # \u4e00-\u9fff: Common CJK Unified Ideographs
    # \u2f00-\u2fdf: Kangxi Radicals
    # \u2e80-\u2eff: CJK Radicals Supplement
    if re.match(r'^[\u4e00-\u9fff\u2f00-\u2fdf\u2e80-\u2eff]$', char):
        # Even though it's a single char, we initialize it as the first part
        return ChineseTileGroup(parts=[char])
    
    raise ValueError(f"Unsupported character: {char}")