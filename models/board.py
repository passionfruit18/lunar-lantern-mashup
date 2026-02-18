
from enum import Enum, auto
from typing import List, Optional, Union
from .tiles import EnglishTile, ChineseTileGroup, TileType, LanguageType  # Local import
from .chinese_chars import selectRandomChineseCharacter
from .moves import PendingMove
from .dictionary import Dictionary
import random

BOARD_SIZE = 15;

class SquareType(Enum):
    NORMAL = auto()
    SPECIAL_TRANSLATION = auto()
    DOUBLE_POINT = auto()
    TRIPLE_POINT = auto()

class GameSquare:
    def __init__(self, square_type: SquareType = SquareType.NORMAL):
        self.square_type = square_type
        self.tile: Optional[TileType] = None

    def is_occupied(self) -> bool:
        return self.tile is not None
    
    def to_dict(self):
        return {
            "square_type": self.square_type.name, # Converts Enum to string "NORMAL"
            "tile": self.tile.to_dict() if self.tile else None
        }

class GameBoard:
    def __init__(self, size: int = BOARD_SIZE):
        self.size = size
        # Generating a 2D grid of GameSquare objects
        self.grid: List[List[GameSquare]] = [
            [GameSquare() for _ in range(size)] for _ in range(size)
        ]
        self._setup_special_squares()

    def _setup_special_squares(self):
        """Internal method to place bonuses on the board."""
        # Example: Placing a translation square in the center
        center = self.size // 2
        self.grid[center][center] = GameSquare(SquareType.SPECIAL_TRANSLATION)

    def place_tile(self, row: int, col: int, tile: TileType) -> bool:
        if 0 <= row < self.size and 0 <= col < self.size:
            target_square = self.grid[row][col]
            if not target_square.is_occupied():
                target_square.tile = tile
                return True
        return False
    
    def to_dict(self):
        """
        Recursively converts the entire 15x15 grid into 
        a list of lists of dictionaries.
        """
        return [
            [square.to_dict() for square in row] 
            for row in self.grid
        ]
    
    def initialize_random_tiles(self):
        """
        Populates every square on the 15x15 board with 
        either an EnglishTile or a ChineseTileGroup.
        """
        english_pool = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

        for row in range(self.size):
            for col in range(self.size):
                # 50/50 chance between English and Chinese
                if random.random() > 0.5:
                    char = random.choice(english_pool)
                    self.grid[row][col].tile = EnglishTile(char)
                else:
                    # Create a group with 1 to 3 random radicals
                    # count = random.randint(1, 3)
                    # For testing, count = 1
                    # TODO: Switch this back when I have the logic for combining tiles
                    count = 1
                    parts = [selectRandomChineseCharacter()]
                    group = ChineseTileGroup(parts)
                    group.combine() # Set the actualized_char
                    self.grid[row][col].tile = group