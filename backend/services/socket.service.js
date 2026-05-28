import ACTIONS from "../utils/socketAction.js";
import { logger } from "../utils/logger.js";

const userSocketMap = {};

const getAllConnectedClients = (io, roomId) => {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => ({
        socketId,
        username: userSocketMap[socketId]
    }));
};

export const configureSocket = (io) => {
    io.on("connection", (socket) => {
        logger.info("Socket connected", { socketId: socket.id });

        socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
            userSocketMap[socket.id] = username;
            socket.join(roomId);

            const clients = getAllConnectedClients(io, roomId);
            clients.forEach(({ socketId }) => {
                io.to(socketId).emit(ACTIONS.JOINED, {
                    clients,
                    username,
                    socketId: socket.id
                });
            });
        });

        socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
            socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
        });

        socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
            io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
        });

        socket.on(ACTIONS.OFFER, ({ to, offer }) => {
            io.to(to).emit(ACTIONS.OFFER, { from: socket.id, offer });
        });

        socket.on(ACTIONS.ANSWER, ({ to, answer }) => {
            io.to(to).emit(ACTIONS.ANSWER, { from: socket.id, answer });
        });

        socket.on(ACTIONS.ICE_CANDIDATE, ({ to, candidate }) => {
            io.to(to).emit(ACTIONS.ICE_CANDIDATE, { from: socket.id, candidate });
        });

        socket.on(ACTIONS.CHAT_MESSAGE, ({ roomId, message, username }) => {
            socket.in(roomId).emit(ACTIONS.CHAT_MESSAGE, {
                message,
                username,
                socketId: socket.id
            });
        });

        socket.on("disconnecting", () => {
            [...socket.rooms].forEach((roomId) => {
                socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                    socketId: socket.id,
                    username: userSocketMap[socket.id]
                });
            });

            delete userSocketMap[socket.id];
        });
    });
};
