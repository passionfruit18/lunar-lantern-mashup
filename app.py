import uuid
import random
import string
from flask import Flask, render_template, request, session
from flask_socketio import SocketIO, join_room, emit
from typing import List, Tuple, Dict, Optional
from models.board import GameBoard, BOARD_SIZE
from models.player import Player, Score
from models.moves import is_straight_line, get_consistent_language, PendingMove, deduplicate_moves
from models.tiles import create_tile, LanguageType
from models.dictionary import Dictionary
from models.english import score_english_word
from models.chinese_chars import score_chinese_word
import threading

# --- CONFIGURATION & GLOBALS ---
app = Flask(__name__)
app.config['SECRET_KEY'] = 'hanzi_secret_123'
socketio = SocketIO(app, cors_allowed_origins="*")

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

    def add_user(self, username: string, session_id: string) -> bool:
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
                
                # Remove position-duplicates i.e. two letters in the same position
                pending_moves = deduplicate_moves(pending_moves)

                # Check Linearity
                if not is_straight_line(pending_moves):
                    return False, "Moves must be in a straight horizontal or vertical line."                
                
                # Check consistent language and single Chinese characters and single English characters
                language_type: LanguageType = get_consistent_language(pending_moves)

                

                hand = player.hand

                if not hand:
                    return False, "Hand doesn't exist"
                
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
                    
                # TODO: Check that the pending moves, PLUS THE WORDS THEY TOUCH is a valid word in dictionary (English OR Chinese)
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
                
                if language_type == LanguageType.ENGLISH:
                    english_words = ["".join([m.value for m in moves]) for moves in all_sequences]
                    score = Score(english_words,
                                  [],
                                  0,
                                  "",
                                  sum(score_english_word(word) for word in english_words))
                elif language_type == LanguageType.CHINESE:
                    chinese_words = ["".join([m.value for m in moves]) for moves in all_sequences]
                    score = Score([],
                                  chinese_words,
                                  0,
                                  "",
                                  sum(score_chinese_word(word) for word in chinese_words))
                else:
                    raise ValueError(f"Unsupported language type: {language_type}")
                
                player.score_history.append(score)
                # TODO: Add basic scoring method and add Score to player with dictionary
                # TODO: Add Chinese-English dual synergy with AI for score multiplier

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
    
# In-memory store for game sessions
# Structure: { session_id: { "players": [id1, id2], "board": [], "tiles": [] } }
sessions: Dict[str, Game] = {}

# --- CORE GAME LOGIC ---

def generate_session_code(length=5):
    """Generates a unique 5-letter uppercase code for room entry."""
    return ''.join(random.choices(string.ascii_uppercase, k=length))

def create_new_game():
    """Initializes the state for a new game session."""
    return {
        "board": [["" for _ in range(BOARD_SIZE)] for _ in range(BOARD_SIZE)],
        "players": {},
        "turn": None,
        "status": "waiting"
    }

# --- ROUTES & SOCKET EVENTS ---

@app.before_request
def ensure_user_id():
    if 'user_id' not in session:
        session['user_id'] = str(uuid.uuid4()) # This stays the same on refresh!

@app.route('/')
def index():
    """Renders the main game page."""
    return render_template('index.html')

@socketio.on('create_session')
def handle_create_session(data):
    """Creates a room, registers it, and notifies the creator."""

    username = data.get('username')
    tab_session_id = data.get('player_id')  # Unique ID for this specific connection
    
    # 1. Generate Lucky Room Code
    room_code = generate_session_code()
    
    # 2. Initialize Game Object
    new_game = Game(room_code)
    new_game.add_user(username, tab_session_id)
    
    sessions[room_code] = new_game
    
    join_room(room_code)
    print(f"Game Created: {room_code}")
    emit('session_created', {
        'room_code': room_code,
        'username': username,
        'board': new_game.board.to_dict()})
    emit('player_list_updated', {
        'players': [p.to_dict() for p in new_game.players]
    }, to=room_code)

@socketio.on('join_session')
def handle_join_session(data):
    """Validates the room code and adds the player to the session."""

    username = data.get('username')
    room_code = data.get('room_code')
    socket_session_id = request.sid
    tab_session_id = data.get('player_id')

    if room_code in sessions:
        game: Game = sessions[room_code]
        player = game.find_by_session_id(tab_session_id)        
        if (player): # You already have an "account" in the game, join it again
            print(f"Player: ${player.to_dict()}")
            join_session_inner(room_code, player.username, game.board, socket_session_id, game.players)
        else:
            success = game.add_user(username, tab_session_id)
            if success:
                join_session_inner(room_code, username, game.board, socket_session_id, game.players)

            else:
                emit('error', {'message': 'Room Full'})
    else:
        emit('error', {'message': 'Invalid Room Code'})


def join_session_inner(room_code, username, game_board, socket_session_id, game_players):
    join_room(room_code)
    emit('join_success', {
            'room_code': room_code,
            'username': username,
            'board': game_board.to_dict()
        }, to=socket_session_id)
    emit('player_list_updated', {
            'players': [p.to_dict() for p in game_players]
        }, to=room_code)
    
@socketio.on('submit_move')
def handle_submit_move(data):
    """Validates the room code and adds the player to the session."""
    

    pendingMoves = data.get('pendingMoves')
    print(f"Pending Moves: ${pendingMoves}")
    # Typescript Dict to Python Class
    pending_moves = [PendingMove.from_dict(pendingMove) for pendingMove in pendingMoves]
    def inner_func(room_code, session_id, game: Game):

        success, message = game.validate_and_apply_move(session_id, pending_moves)
        
        if success:

            emit('update_board', {
                'board': game.board.to_dict()
            }, to=room_code)
            emit('player_list_updated', {
                'players': [p.to_dict() for p in game.players]
            }, to=room_code)

        else:
            emit('error', {'message': message})

    with_room_code_and_tab_session_id_and_game(data, request, inner_func)


def with_room_code_and_tab_session_id_and_game(data, request, inner_func):
    room_code = data.get('room_code')
    tab_session_id = data.get('player_id')

    if room_code in sessions:
        game: Game = sessions[room_code]
        inner_func(room_code, tab_session_id, game)
    else:
        emit('error', {'message': 'Invalid Room Code'})

# --- EXECUTION ---

if __name__ == '__main__':
    # Using eventlet or gevent is recommended for production, 
    # but the built-in development server works for local testing.
    socketio.run(app, debug=True, port=8888)