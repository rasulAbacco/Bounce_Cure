// frontend/src/sockets.js
import { io } from "socket.io-client";

export function createSocket({ userId, userName }) {
    const socket = io("http://localhost:5000", {
        query: { userId, userName },
        autoConnect: true,
    });
    return socket;
}
