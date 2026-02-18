import re
from typing import List, Dict, Any
from .tiles import LanguageType
from dataclasses import dataclass

@dataclass
class PendingMove:
    row: int
    col: int
    type: LanguageType
    value: str

    @classmethod
    def from_dict(cls, data: dict):
        """
        Creates a PendingMove instance from a dictionary sent via Socket.IO.
        """
        return cls(
            row=int(data['row']),
            col=int(data['col']),
            # This converts the string "ENGLISH" into the Enum LanguageType.ENGLISH
            type=LanguageType(data['type']),
            value=str(data['value'])
        )

def is_straight_line(moves: List[PendingMove]):
    if len(moves) < 2: return True
    rows = [m.row for m in moves]
    cols = [m.col for m in moves]
    return len(set(rows)) == 1 or len(set(cols)) == 1

def get_consistent_language(pending_moves: List[PendingMove]) -> LanguageType:
    """
    Checks if all moves in the list are either all English or all Chinese.
    Returns the detected LanguageType.
    Raises ValueError if the moves are mixed or invalid.
    Also checks that all pending moves are single Chinese character or single English letter
    """
    if not pending_moves:
        raise ValueError("No moves provided.")

    # Regex patterns
    # English: A-Z (case insensitive)
    # Chinese: Common Ideographs + Radicals
    en_pattern = r'^[a-zA-Z]$'
    zh_pattern = r'^[\u4e00-\u9fff\u2f00-\u2fdf\u2e80-\u2eff]$'

    detected_langs = set()

    for pending_move in pending_moves:
        val = str(pending_move.value).strip()
        
        if re.match(en_pattern, val):
            detected_langs.add(LanguageType.ENGLISH)
        elif re.match(zh_pattern, val):
            detected_langs.add(LanguageType.CHINESE)
        else:
            raise ValueError(f"Invalid character detected: {val}")

    if len(detected_langs) > 1:
        raise ValueError("Mixed language move: You cannot combine English and Chinese in one turn.")

    # Return the single language present in the set
    return detected_langs.pop()

# Remove position-duplicates i.e. two letters in the same position
def deduplicate_moves(pending_moves: List[PendingMove]) -> List[PendingMove]:
    """
    Ensures only one tile exists per (row, col) coordinate.
    If duplicates exist, the last one in the list wins.
    """
    # Create a mapping of (row, col) -> PendingMove
    unique_moves = { (m.row, m.col): m for m in pending_moves }
    
    # Convert back to a list
    return list(unique_moves.values())