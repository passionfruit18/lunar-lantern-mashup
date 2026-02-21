import { makeDraggable, socket, toggleLoaders } from "./util";
import { gameState } from "./game-state";

interface HintResultData {
    englishHint: string;
    chineseHint: string;
}

function toggleHintButton(isLoading: boolean) {
    const hintBtn = document.getElementById('hint-btn') as HTMLButtonElement;
    if (!hintBtn) return;

    if (isLoading) {
        hintBtn.disabled = true;
        hintBtn.innerText = "Consulting Oracle...";
        hintBtn.style.opacity = "0.5";
        hintBtn.style.cursor = "not-allowed";
    } else {
        hintBtn.disabled = false;
        hintBtn.innerText = "Get Hint";
        hintBtn.style.opacity = "1";
        hintBtn.style.cursor = "pointer";
    }
}

export function getHint() {
    // Show that specific lantern spinner we built!
    toggleLoaders(true);
    toggleHintButton(true); // Disable Hint Button
    
    // Emit the request with the specific type
    socket.emit('request_hint', { 
        room_code: gameState.currentRoom, 
        player_id: gameState.myPlayerId
    });
}

// This fires for everyone whenever the player list changes
socket.on('display_hint', (data: HintResultData) => {
    toggleLoaders(false)
    toggleHintButton(false) // Re-enable hint button
    display_hint(data)
});

export function display_hint(hintResult: HintResultData) {
    const hintScrolls = document.querySelectorAll<HTMLElement>('.hint-scroll');
    hintScrolls.forEach((hintScroll) => {
        hintScroll.innerHTML = `
        <div class="english-hint">
            <h2>English Hint:</h2>
            <p>
                ${hintResult.englishHint}
            </p>
        </div>
        <div class="chinese-hint">
            <h2>Chinese Hint:</h2>
            <p>
                ${hintResult.chineseHint}
            </p>
        </div>
        `
    });
}


export function makeHintScrollDraggable() {
    const hintScrollElement = document.querySelector('.hint-scroll') as HTMLElement;

    if (hintScrollElement) {
        // Attach the draggable logic we built
        makeDraggable(hintScrollElement);
        console.log("Hint Scroll initialized and draggable.");
    } else {
        console.warn("Hint Scroll element not found in the DOM.");
    }
}