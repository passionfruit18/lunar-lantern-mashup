


import * as BoardModule from "./board";
import { gameState } from "./game-state";

const BOARD_SIZE = 15;

// Helper to check if the board is ready
function isGameReady(): boolean {
    return gameState.globalBoard !== null;
}

const GLOW_COLOR = "#ffaa00"; // Warm Lantern Orange
const TEXT_COLOR = "#ffffff"; // Bright White for the core of the letter

// Draw the board!
export function drawBoard(board: BoardModule.Board) {    
    
    gameState.globalBoard = board;
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    prepareCanvas(canvas)
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const size = 40; // square size

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const x = c * size
            const y = r * size
            ctx.strokeStyle = "rgba(255, 215, 0, 0.2)";;
            ctx.strokeRect(x, y, size, size);
            if (board && board[r][c] && board[r][c].tile) {
                // 2. Set the Glow Effect
                ctx.shadowColor = GLOW_COLOR;
                ctx.shadowBlur = 10; // The spread of the glow
                ctx.fillStyle = TEXT_COLOR;
                ctx.font = "20px Arial";
                ctx.fillText(BoardModule.simplePrintSquare(board[r][c]), x + 10, y + 28);
            }
            else {
                const pending = gameState.pendingMoves.find(m => m.row === r && m.col === c);
                if (pending) {
                    // Draw with a different style to indicate it's not submitted
                    // 3. Pending Tiles (Blue Magic Glow)
                    ctx.shadowColor = "#00ccff";
                    ctx.shadowBlur = 15;
                    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
                    ctx.font = "bold 20px Arial";
                    
                    // Center the text slightly differently if you like
                    ctx.fillText(pending.value, x + 10, y + 28);
                    
                    // Optional: Draw a small border around pending tiles
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = "#0066cc";
                    ctx.strokeRect(x + 2, y + 2, size - 4, size - 4);
                    ctx.lineWidth = 1; // Reset line width
                }
            }
        }
    }
}

let canvasInitialised = false


function prepareCanvas(canvas: HTMLCanvasElement) {

    if (!canvasInitialised) {        
        canvas.addEventListener('mousedown', (event: MouseEvent) => {
            console.log("Canvas Clicked")
            // 1. Get the bounding box of the canvas (accounts for scrolling/layout)
            const rect = canvas.getBoundingClientRect();
        
            // 2. Calculate the "Local" X and Y relative to the canvas top-left
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
        
            // 3. Divide by cell size and 'Floor' it to get the integer index
            const cellSize = canvas.width / BOARD_SIZE;
            
            const col = Math.floor(mouseX / cellSize);
            const row = Math.floor(mouseY / cellSize);
        
            // 4. Safety Check: Ensure the click wasn't on the border/padding
            if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE) {
                console.log("Row:", row, "Column:", col)
                if (gameState.globalBoard) {            
                    handleSquareClick(gameState.globalBoard, row, col);
                }
            }
        });
        canvasInitialised = true
    }

}


function handleSquareClick(board: BoardModule.Board, row: number, col: number) {
    const square = board[row][col];
    const inspector = document.getElementById('square-inspector') as HTMLElement;
    const squareDisplayJSON = BoardModule.printAllSquareDetails(square)
    console.log(squareDisplayJSON)
    // Using the Class method or Utility function
    inspector.innerText = squareDisplayJSON; 

    handleSquareClickEnterChar(board, row, col)
}

function handleSquareClickEnterChar(board: BoardModule.Board, row: number, col: number) {
    const rawValue = prompt("Enter a letter or Chinese character:");
    if (!rawValue) return;

    // 1. Clean and Validate length
    const value = rawValue.trim();
    if (value.length !== 1) {
        alert("Please enter exactly one character.");
        return;
    }

    // 2. Automated Language Detection using Regex
    // \u4e00-\u9fa5 covers the common CJK Unified Ideographs block
    const isChinese = /[\u4e00-\u9fa5]/.test(value);
    const isEnglish = /[a-zA-Z]/.test(value);

    if (!isChinese && !isEnglish) {
        alert("Invalid character. Please use English (A-Z) or Chinese characters.");
        return;
    }

    // 3. Push the move using the detected type
    gameState.pendingMoves.push({
        row,
        col,
        type: isEnglish ? BoardModule.LanguageType.ENGLISH : BoardModule.LanguageType.CHINESE,
        value: isEnglish ? value.toUpperCase() : value // Auto-capitalize English
    });

    renderPendingMove(row, col, value);
    
}

function renderPendingMove(row: number, col: number, value: string) {
    if (gameState.globalBoard) {
        drawBoard(gameState.globalBoard)
    }
}
