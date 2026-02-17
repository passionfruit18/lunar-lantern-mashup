import uuid
import random
import string
from flask import Flask, render_template_string, request
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

# --- HTML/JAVASCRIPT UI (Embedded for Single-Script Requirement) ---

HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>Hanzi-Dash Multiplayer</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.0.1/socket.io.js"></script>
    <style>
        body { font-family: sans-serif; text-align: center; background: #f0f0f0; }
        #game-canvas { background: #fff; border: 2px solid #333; cursor: pointer; }
        .menu { margin-top: 50px; }
        .hidden { display: none; }
        #controls { margin-top: 10px; }
    </style>
</head>
<body>
    <h1>Hanzi-Dash 汉字</h1>

    <div id="setup-area" class="menu">
        <button onclick="createGame()">Create New Game</button>
        <br><br>
        <input type="text" id="session-code" placeholder="Enter Code">
        <button onclick="joinGame()">Join Game</button>
    </div>

    <div id="game-area" class="hidden">
        <h3>Room: <span id="display-code"></span></h3>
        <canvas id="game-canvas" width="600" height="600"></canvas>
        <div id="controls">
            <p>Click a square to place a tile (Simulated for Demo)</p>
            <button onclick="leaveGame()">Leave</button>
        </div>
    </div>

    <script>
        const socket = io();
        let currentRoom = "";

        function createGame() {
            socket.emit('create_session');
        }

        function joinGame() {
            const code = document.getElementById('session-code').value.toUpperCase();
            socket.emit('join_session', {room: code});
        }

        socket.on('session_created', (data) => {
            enterRoom(data.room);
        });

        socket.on('joined_room', (data) => {
            enterRoom(data.room);
            drawBoard(data.board);
        });

        function enterRoom(code) {
            currentRoom = code;
            document.getElementById('setup-area').classList.add('hidden');
            document.getElementById('game-area').classList.remove('hidden');
            document.getElementById('display-code').innerText = code;
        }

        function drawBoard(board) {
            const canvas = document.getElementById('game-canvas');
            const ctx = canvas.getContext('2d');
            const size = 40; // square size

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let r = 0; r < 15; r++) {
                for (let c = 0; c < 15; c++) {
                    ctx.strokeStyle = "#ccc";
                    ctx.strokeRect(c * size, r * size, size, size);
                    if (board && board[r][c]) {
                        ctx.fillStyle = "black";
                        ctx.font = "20px Arial";
                        ctx.fillText(board[r][c], c * size + 10, r * size + 28);
                    }
                }
            }
        }

        function leaveGame() {
            location.reload();
        }
    </script>
</body>
</html>
"""

# --- ROUTES & SOCKET EVENTS ---

@app.route('/')
def index():
    """Renders the main game page."""
    return render_template_string(HTML_TEMPLATE)

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