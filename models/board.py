
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

    
    def get_continuous_sequence(self, row: int, col: int, d_row: int, d_col: int, language_type: LanguageType) -> List[PendingMove]:
        """
        Crawls the board starting from (row, col) in direction (d_row, d_col).
        Returns a list of tile values and their coordinates.
        UP is d_row = -1, d_col = 0
        DOWN is d_row = 1, d_col = 0
        LEFT is d_row = 0, d_col = -1
        RIGHT is d_row = 0, d_col = 1
        I think.
        
        TODO: Implement Chinese as English and English as Chinese re-use
        GAME RULES
        2a-iii. English as Chinese reuse:
        If English sequence forms a Pinyin of a Chinese character,
        the player may re-use that English sequence (from the end of the sequence)
        (whether perpendicularly or in sequence)
        as that Chinese character if they specify what that character is.
        2b-iii. Chinese as English reuse:
        The first letter of the pinyin of the Chinese word
        or any of its radicals can be re-used as an English letter.
        """


        sequence: List[PendingMove] = []
        curr_r, curr_c = row + d_row, col + d_col
        
        while 0 <= curr_r < BOARD_SIZE and 0 <= curr_c < BOARD_SIZE:
            square = self.grid[curr_r][curr_c]
            if square.tile and square.tile.type == language_type:
                # TODO: Add logic here for Chinese as English and English as Chinese re-use
                # For now, we only collect if it matches the current move's language type
                sequence.append(PendingMove.from_dict({
                    "row": curr_r,
                    "col": curr_c,
                    "value": square.tile.show(),
                    "type": language_type
                }))
                curr_r += d_row
                curr_c += d_col
            else:
                break
        return sequence
    

    
    def get_all_formed_words(self, pending_moves: List[PendingMove]) -> List[List[PendingMove]]:
        """
        Get all the words formed by the pending_moves and
        existing words in the direction (horizontal/vertical) of the move
        AND perpendicular (cross-axis) to the direction of the move
        TODO: If the pending_moves is NOT contiguous, it should have a space of one character
        which is filled in by existing characters.
        """
        if not pending_moves :
            return []

        # 1. Determine direction of the current move
        is_horizontal = all(m.row == pending_moves[0].row for m in pending_moves)
        main_lang = pending_moves[0].type
        
        all_sequences = []
        
        # Sort moves so we crawl from the "start"
        sorted_moves = sorted(pending_moves, key=lambda x: x.col if is_horizontal else x.row)
        first = sorted_moves[0]
        last = sorted_moves[-1]

        # 2. CRAWL MAIN AXIS (Case A & B)
        if is_horizontal:
            # LEFT: col -1
            prefix = self.get_continuous_sequence(first.row, first.col, 0, -1, main_lang)[::-1] # Reverse left crawl
            # RIGHT: col +1
            suffix = self.get_continuous_sequence(last.row, last.col, 0, 1, main_lang)
            main_word = prefix + sorted_moves + suffix
        else:
            # UP: row -1
            prefix = self.get_continuous_sequence(first.row, first.col, -1, 0, main_lang)[::-1] # Reverse up crawl
            # DOWN: row +1
            suffix = self.get_continuous_sequence(last.row, last.col, 1, 0, main_lang)
            main_word = prefix + sorted_moves + suffix

        all_sequences.append(main_word)

        # 3. CRAWL CROSS AXIS (Checking for words created perpendicular to the move)
        for move in pending_moves:
            if is_horizontal:
                # If move is horizontal, check vertical neighbors for each tile
                # UP: row -1
                p = self.get_continuous_sequence(move.row, move.col, -1, 0, main_lang)[::-1]
                # DOWN: row +1
                s = self.get_continuous_sequence(move.row, move.col, 1, 0, main_lang)
            else:
                # If move is vertical, check horizontal neighbors
                # LEFT: col -1
                p = self.get_continuous_sequence(move.row, move.col, 0, -1, main_lang)[::-1]
                # RIGHT: col +1
                s = self.get_continuous_sequence(move.row, move.col, 0, 1, main_lang)
            
            if p or s:
                cross_word = p + [move] + s
                if (len(cross_word) > 1):
                    all_sequences.append(cross_word)

        if main_lang == LanguageType.ENGLISH:
            valid_sequences = [seq for seq in all_sequences if len(seq) > 1]
        elif main_lang == LanguageType.CHINESE:
            valid_sequences = all_sequences
        else:
            raise ValueError(f"Unsupported language type: {main_lang}")

        valid_sequences_print = ", ".join(["".join([m.value for m in moves]) for moves in valid_sequences])
        print(f"All Valid Sequences: {valid_sequences_print}")
        return valid_sequences
    