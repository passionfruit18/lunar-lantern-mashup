
from typing import List, Tuple, Optional
from .board import GameBoard, BOARD_SIZE
from .player import Player, Score
from .moves import is_straight_line, get_consistent_language, PendingMove, deduplicate_moves
from .tiles import create_tile, LanguageType
from .dictionary import Dictionary
from .english import score_english_word
from .chinese_chars import score_chinese_word
from .gemini import SynergyEngine, SynergyScoreResult
import threading

testing: bool = False

class Game:
    def __init__(self, room_code: str):
        self.room_code: str = room_code
        self.board: GameBoard = GameBoard()
        if (testing):
            self.board.initialize_random_tiles()
        self.players: List[Player] = []  # List of (username, session_id) tuples
        self.status = "waiting"
        self.lock = threading.Lock()
        self.synergy_engine = SynergyEngine()

    def add_user(self, username: str, session_id: str) -> bool:
        """
        Accepts a tuple (username: string, session_id: string)
        and adds them to the game.
        """
        if len(self.players) < 4:  # Scrabble limit
            self.players.append(Player(username, session_id))
            print(f"User {username} added to Room {self.room_code}")
            return True
        return False
    
    def get_player_names(self) -> List[str]:
        return [p.username for p in self.players]
    
    # CORE GAME LOOP: EACH MOVE!
    def validate_and_apply_move(self, session_id, pending_moves) -> Tuple[bool, str]:
        # Acquire the lock
        with self.lock:
            try:

                # Find player
                player = self.find_by_session_id(session_id)

                if not player:
                    return False, f"Player ${session_id} cannot be found"
                
                # Check hand exists
                hand = player.hand

                if not hand:
                    return False, "Hand doesn't exist"
                
                # Remove position-duplicates i.e. two letters in the same position
                pending_moves = deduplicate_moves(pending_moves)

                # Check Linearity
                if not is_straight_line(pending_moves):
                    return False, "Moves must be in a straight horizontal or vertical line."                
                
                # Check consistent language and single Chinese characters and single English characters
                # TODO: Should we sort according to position here as well?
                language_type: LanguageType = get_consistent_language(pending_moves)                
                
                # Normalise English to Upper
                pending_move_values = [pending_move.value.upper() for pending_move in pending_moves if pending_move.value]

                # Check move can be made from hand
                if not hand.has_required_tiles(pending_move_values, language_type):
                    return False, f"Hand does not have required values: ${pending_move_values}"

                # Check move can be made on board (empty squares)
                for pending_move in pending_moves:
                    row = pending_move.row
                    col = pending_move.col
                    game_square = self.board.grid[row][col]
                    if (game_square.tile):
                        return False, f"Value already exists at row: ${row}, col: ${col}"
                    
                # TODO: Check that the pending moves, PLUS THE WORDS THEY TOUCH are valid words in dictionary (English OR Chinese)
                # Still need to implement the bridge moves (see board.py) and "English as Chinese"/"Chinese as English"
                # This is going to be tricky. A lot of stuff in GameBoard
                """
                GAME RULES
                2. In a turn, a player can:

                2a-i. Compose a Chinese character, a two-character word,
                or a 4-character ChengYu using the radicals and basic Chinese characters. Scored accordingly.

                2a-ii. Chinese-Chinese reuse:
                Can use a character from another player's Chinese character sequence
                (horizontal or vertical) to start another sequence
                (vertical or horizontal respectively).

                2a-iii. English as Chinese reuse:
                If English sequence forms a Pinyin of a Chinese character,
                the player may re-use that English sequence (from the end of the sequence)
                (whether perpendicularly or in sequence)
                as that Chinese character if they specify what that character is.

                2b-i. Compose an English word as in normal Scrabble.

                2b-ii. English-English reuse: as in normal Scrabble.

                2b-iii. Chinese as English reuse:
                The first letter of the pinyin of the Chinese word
                or any of its radicals can be re-used as an English letter.
                """

                all_sequences = self.board.get_all_formed_words(pending_moves)
                dict = Dictionary()
                success, message = dict.validate_moves(all_sequences)

                # WAIT! Let's test things out a bit before we enable this validation
                if (not success):
                    return False, message

                # Make the moves!
                for pending_move in pending_moves:
                    row = pending_move.row
                    col = pending_move.col
                    game_square = self.board.grid[row][col]
                    # TODO: Compose Chinese character with combination of radicals and basic character.
                    # This is a full-stack feature from front to back end
                    game_square.tile = create_tile(pending_move.value)


                # Subtract pending_moves from Hand
                hand.consume_tiles(pending_move_values, language_type)

                # Replenish Hand
                
                player.hand.replenish_hand()
                
                score = self.calculate_score(pending_moves, all_sequences, language_type)

                player.score_history.append(score)                

                return True, "Success"
            
            except ValueError as e:
                return False, str(e)    
    
    def find_by_session_id(self, session_id: str) -> Optional[Player]:
        """
        Returns the Player object with the matching session_id, 
        or None if no match is found.
        """
        # Using a generator expression (memory efficient)
        return next((p for p in self.players if p.session_id == session_id), None)
    

    def calculate_score(self, pending_moves: List[PendingMove], all_sequences: List[List[PendingMove]], language_type: LanguageType) -> Score:

        """
        Chinese-English dual synergy with AI for score multiplier
        """
        if language_type == LanguageType.ENGLISH:
            english_words = ["".join([m.value for m in moves]) for moves in all_sequences]
            chinese_words = [context['neighbor'] for context in self.board.get_adjacent_synergies(pending_moves)]
            # Could be more than pending_move?
            if chinese_words:
                synergy_score_result: SynergyScoreResult = self.synergy_engine.calculate_synergy(english_words, chinese_words)
                score = Score(english_words,
                            chinese_words,
                            synergy_score_result.synergy_score,
                            synergy_score_result.synergy_explanation,
                            sum(score_english_word(word) for word in english_words),
                            LanguageType.ENGLISH)
            else:
                score = Score(english_words,
                            [],
                            0,
                            "",
                            sum(score_english_word(word) for word in english_words),
                            LanguageType.ENGLISH)
        elif language_type == LanguageType.CHINESE:
            chinese_words = ["".join([m.value for m in moves]) for moves in all_sequences]
            english_words = [context['neighbor'] for context in self.board.get_adjacent_synergies(pending_moves)]
            # Could be more than pending_move?
            if english_words:

                synergy_score_result: SynergyScoreResult = self.synergy_engine.calculate_synergy(english_words, chinese_words)
                score = Score(english_words,
                            chinese_words,
                            synergy_score_result.synergy_score,
                            synergy_score_result.synergy_explanation,
                            sum(score_chinese_word(word) for word in chinese_words),
                            LanguageType.CHINESE)
            else:
                score = Score([],
                            chinese_words,
                            0,
                            "",
                            sum(score_chinese_word(word) for word in chinese_words),
                            LanguageType.CHINESE)
        else:
            raise ValueError(f"Unsupported language type: {language_type}")
        
        return score