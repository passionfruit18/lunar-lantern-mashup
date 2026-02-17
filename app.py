import uuid
import random
import string
from flask import Flask, render_template, request
from flask_socketio import SocketIO, join_room, emit

# --- CONFIGURATION & GLOBALS ---
app = Flask(__name__)
app.config['SECRET_KEY'] = 'hanzi_secret_123'
socketio = SocketIO(app, cors_allowed_origins="*")

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
def handle_create_session():
    """Creates a room, registers it, and notifies the creator."""
    code = generate_session_code()
    sessions[code] = create_new_game()
    join_room(code)
    print(f"Game Created: {code}")
    emit('session_created', {'room': code})

@socketio.on('join_session')
def handle_join_session(data):
    """Validates the room code and adds the player to the session."""
    room = data.get('room')
    if room in sessions:
        join_room(room)
        # Add player logic could go here
        emit('joined_room', {'room': room, 'board': sessions[room]['board']})
    else:
        emit('error', {'message': 'Invalid Room Code'})

# --- EXECUTION ---

if __name__ == '__main__':
    # Using eventlet or gevent is recommended for production, 
    # but the built-in development server works for local testing.
    socketio.run(app, debug=True, port=8888)