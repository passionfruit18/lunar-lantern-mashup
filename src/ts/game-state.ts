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

    // You can add simple update methods here
    setRoom(id: string) { this.currentRoom = id; },
    setPlayer(id: string) { this.myPlayerId = id; }
};