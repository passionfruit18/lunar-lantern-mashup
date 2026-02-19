import uuid
import random
import string
from flask import Flask, render_template, request
from flask_socketio import SocketIO, join_room, emit
from typing import Dict
from models.board import BOARD_SIZE
from models.moves import PendingMove
from models.game import Game
import os
import nltk


nltk.download('words')


# --- CONFIGURATION & GLOBALS ---
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('FLASK_SECRET_KEY', 'dev-key-for-local-only')
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='gevent', manage_session=False)
    
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
    """Submit Move to the Core Game Engine"""
    
    pendingMoves = data.get('pendingMoves')
    print(f"Pending Moves: ${pendingMoves}")
    # Translate Dict to Python Class
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

port = int(os.environ.get("PORT", 8888))

if __name__ == '__main__':
    # Using eventlet or gevent is recommended for production, 
    # but the built-in development server works for local testing.
    socketio.run(app, debug=True, port=port)