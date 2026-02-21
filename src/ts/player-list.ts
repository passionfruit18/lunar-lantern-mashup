
import { socket } from "./util";

import * as PlayerModule from "./player";

// This fires for everyone whenever the player list changes
socket.on('player_list_updated', (data: {'players': PlayerModule.PlayerData[]}) => {
    updatePlayerSidebar(data.players);
});

function updatePlayerSidebar(players: PlayerModule.PlayerData[]) {
    const listElement = document.getElementById('player-list') as HTMLElement;
    listElement.innerHTML = ""; // Clear current list
    players.forEach(player => {
        const li = document.createElement('li');
        li.innerHTML = PlayerModule.printAllPlayerDetailsPretty(player);
        listElement.appendChild(li);
    });
}