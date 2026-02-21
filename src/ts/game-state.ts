import * as BoardModule from "./board";

export type PendingMove = {
    row: number,
    col: number,
    type: BoardModule.LanguageType,
    value: string }

function getOrCreatePlayerId(): string {
    let pid = sessionStorage.getItem('player_id');
    if (!pid) {
        pid = crypto.randomUUID(); // Generate a unique ID
        sessionStorage.setItem('player_id', pid);
    }
    return pid;
}

export const gameState = {
    currentRoom: null as string | null,
    myPlayerId: getOrCreatePlayerId(),
    globalBoard: null as BoardModule.Board | null,
    pendingMoves: [] as PendingMove[],

    // You can add simple update methods here
    setRoom(id: string) { this.currentRoom = id; },
    setPlayer(id: string) { this.myPlayerId = id; }
};