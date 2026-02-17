import uuid
import random
import string
from flask import Flask, render_template, request
from flask_socketio import SocketIO, join_room, emit
from typing import List, Tuple, Dict, Optional

# --- CONFIGURATION & GLOBALS ---
app = Flask(__name__)
app.config['SECRET_KEY'] = 'hanzi_secret_123'
socketio = SocketIO(app, cors_allowed_origins="*")

class Game:
    def __init__(self, room_code: str):
        self.room_code: str = room_code
        self.board: List[List[str]] = [["" for _ in range(15)] for _ in range(15)]
        self.players: List[Tuple[str, str]] = []  # List of (username, session_id) tuples
        self.status = "waiting"

    def add_user(self, user_data: Tuple[str, str]) -> bool:
        """
        Accepts a tuple (username: string, session_id: string)
        and adds them to the game.
        """
        if len(self.players) < 4:  # Scrabble limit
            self.players.append(user_data)
            print(f"User {user_data[0]} added to Room {self.room_code}")
            return True
        return False
    
# In-memory store for game sessions
# Structure: { session_id: { "players": [id1, id2], "board": [], "tiles": [] } }
sessions = {}

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
    new_game.add_user((username, session_id))
    
    sessions[room_code] = new_game
    
    join_room(room_code)
    print(f"Game Created: {room_code}")
    emit('session_created', {'room_code': room_code, 'username': username, 'board': new_game.board})

@socketio.on('join_session')
def handle_join_session(data):
    """Validates the room code and adds the player to the session."""

    username = data.get('username')
    room_code = data.get('room_code')
    session_id = request.sid

    if room_code in sessions:
        game = sessions[room_code]
        success = game.add_user((username, session_id))
        
        if success:
            join_room(room_code)        

            emit('join_success', {
                'room_code': room_code,
                'username': username,
                'board': game.board
            }, to=session_id)

            emit('player_list_updated', {
                'players': [p[0] for p in game.players]
            }, to=room_code)

        else:
            emit('error', {'message': 'Room Full'})
    else:
        emit('error', {'message': 'Invalid Room Code'})

# --- EXECUTION ---

if __name__ == '__main__':
    # Using eventlet or gevent is recommended for production, 
    # but the built-in development server works for local testing.
    socketio.run(app, debug=True, port=8888)