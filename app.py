import uuid
import random
import string
from flask import Flask, render_template, request
from flask_socketio import SocketIO, join_room, emit
from typing import List, Tuple, Dict, Optional
from models.board import GameBoard
from models.player import Player
from models.moves import is_straight_line
from models.tiles import create_tile
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
    
    def validate_and_apply_move(self, session_id, pending_moves) -> Tuple[str, str]:
        # 1. Acquire the lock
        with self.lock:
            # 2. Check Linearity
            if not is_straight_line(pending_moves):
                return False, "Moves must be in a straight horizontal or vertical line."
            
            # TODO: Check all characters are either English or Chinese

            # TODO: Make sure spots to be filled are empty!
            # This was kind of checked on the front end as well but just to make sure
                    

            # TODO: Make sure pending_moves can be made from Hand

            # 3. Apply to board
            for m in pending_moves:
                self.board.grid[m['row']][m['col']].tile = create_tile(m['value'])


            # TODO: Subtract pending_moves from Hand

            # 4. Replenish Hand
            player = self.find_by_session_id(session_id)
            if player:
                player.hand.replenish_hand()

            # TODO: Add scoring method (with AI haha) and add Score to player

            return True, "Success"
    
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
        "board": [["" for _ in range(15)] for _ in range(15)],
        "players": {},
        "turn": None,
        "status": "waiting"
    }

# --- ROUTES & SOCKET EVENTS ---

@app.route('/')
def index():
    """Renders the main game page."""
    return render_template('index.html')

@socketio.on('create_session')
def handle_create_session(data):
    """Creates a room, registers it, and notifies the creator."""

    username = data.get('username')
    session_id = request.sid  # Unique ID for this specific connection
    
    # 1. Generate Lucky Room Code
    room_code = generate_session_code()
    
    # 2. Initialize Game Object
    new_game = Game(room_code)
    new_game.add_user(username, session_id)
    
    sessions[room_code] = new_game
    
    join_room(room_code)
    print(f"Game Created: {room_code}")
    emit('session_created', {
        'room_code': room_code,
        'username': username,
        'board': new_game.board.to_dict()})

@socketio.on('join_session')
def handle_join_session(data):
    """Validates the room code and adds the player to the session."""

    username = data.get('username')
    room_code = data.get('room_code')
    session_id = request.sid

    if room_code in sessions:
        game: Game = sessions[room_code]
        success = game.add_user(username, session_id)
        
        if success:
            join_room(room_code)        

            emit('join_success', {
                'room_code': room_code,
                'username': username,
                'board': game.board.to_dict()
            }, to=session_id)

            emit('player_list_updated', {
                'players': [p.to_dict() for p in game.players]
            }, to=room_code)

        else:
            emit('error', {'message': 'Room Full'})
    else:
        emit('error', {'message': 'Invalid Room Code'})

@socketio.on('submit_move')
def handle_submit_move(data):
    """Validates the room code and adds the player to the session."""
    

    pendingMoves = data.get('pendingMoves')
    def inner_func(room_code, session_id, game: Game):

        success, message = game.validate_and_apply_move(session_id, pendingMoves)
        
        if success:

            emit('update_board', {
                'board': game.board.to_dict()
            }, to=room_code)
            emit('player_list_updated', {
                'players': [p.to_dict() for p in game.players]
            }, to=room_code)

        else:
            emit('error', {'message': message})

    with_room_code_and_session_id_and_game(data, request, inner_func)


def with_room_code_and_session_id_and_game(data, request, inner_func):
    room_code = data.get('room_code')
    session_id = request.sid

    if room_code in sessions:
        game: Game = sessions[room_code]
        inner_func(room_code, session_id, game)
    else:
        emit('error', {'message': 'Invalid Room Code'})

# --- EXECUTION ---

if __name__ == '__main__':
    # Using eventlet or gevent is recommended for production, 
    # but the built-in development server works for local testing.
    socketio.run(app, debug=True, port=8888)