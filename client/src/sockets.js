// frontend/src/sockets.js
import { io } from "socket.io-client";
const API_URL = import.meta.env.VITE_VRI_URL;

export function createSocket({ userId, userName }) {
    const socket = io(`${API_URL}`, {
        query: { userId, userName },
        autoConnect: true,
    });
    return socket;
}
