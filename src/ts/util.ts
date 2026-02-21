
import { Board } from "./board";

export const socket = io({
    transports: ["websocket"] 
});


export interface SessionData {
    room_code: string;
    username: string;
    board: Board;    // Uses the Board type defined above
}



export const toggleLoaders = (show: boolean): void => {
    const loaders = document.querySelectorAll<HTMLElement>('.lantern-loader');
    loaders.forEach((loader) => {
        loader.style.display = show ? 'block' : 'none';
    });
};

// Make elements draggable (used for hint scroll)
export function makeDraggable(el: HTMLElement) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    el.onmousedown = (e: MouseEvent) => {
        e.preventDefault();
        // Get mouse position at startup
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    };

    function elementDrag(e: MouseEvent) {
        e.preventDefault();
        // Calculate new cursor position
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // Set element's new position
        el.style.top = (el.offsetTop - pos2) + "px";
        el.style.left = (el.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // Stop moving when mouse button is released
        document.onmouseup = null;
        document.onmousemove = null;
    }
}