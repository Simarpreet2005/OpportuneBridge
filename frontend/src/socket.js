import { io } from 'socket.io-client';

export const initSocket = async () => {
    const BACKEND_URL = import.meta.env.VITE_API_URL 
        ? new URL(import.meta.env.VITE_API_URL).origin 
        : 'http://localhost:8000';

    const options = {
        'force new connection': true,
        reconnectionAttempt: 'Infinity',
        timeout: 10000,
        transports: ['websocket'],
    };
    return io(BACKEND_URL, options);
};
