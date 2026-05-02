import dotenv from "dotenv";
dotenv.config({ override: true });
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./utils/db.js";

import userRoute from "./routes/user.route.js";
import companyRoute from "./routes/company.route.js";
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";
import challengeRoute from "./routes/challenge.route.js";
import aiRoute from "./routes/ai.route.js";
import aiChatRoute from "./routes/aiChat.route.js";
import submissionRoute from "./routes/submission.route.js";
import postRoute from "./routes/post.route.js";
import resumeRoute from "./routes/resume.route.js";
import mockInterviewRoute from "./routes/mockInterview.route.js";
import profileRoutes from "./routes/profile.routes.js";
import resumeRoutesNew from "./routes/resume.routes.js";
import superadminRoute from "./routes/superadmin.route.js";
import analyticsRoute from "./routes/analytics.route.js";

import http from "http";
import { Server } from "socket.io";
import ACTIONS from "./utils/socketAction.js";


const app = express();
console.log("Startup Check - GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "Loaded" : "NOT LOADED");
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://opportunebridge-frontend.onrender.com"],
    methods: ["GET", "POST"],
    credentials: true,
  }
});

const userSocketMap = {};
function getAllConnectedClients(roomId) {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        username: userSocketMap[socketId],
      };
    }
  );
}

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId);
    const clients = getAllConnectedClients(roomId);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id,
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
    socket.in(roomId).emit(ACTIONS.CHAT_MESSAGE, { message, username, socketId: socket.id });
  });

  socket.on('disconnecting', () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });
    delete userSocketMap[socket.id];
    socket.leave();
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

const corsOptions = {
  origin: ["http://localhost:5173", "https://opportunebridge-frontend.onrender.com"],
  credentials: true,
};
app.use(cors(corsOptions));

app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);
app.use("/api/v1/challenge", challengeRoute);
app.use("/api/v1/ai", aiRoute);
app.use("/api/v1/aichat", aiChatRoute);
app.use("/api/v1/submission", submissionRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/resume", resumeRoute);
app.use("/api/v1/mockinterview", mockInterviewRoute);
app.use("/api/v1/profile-new", profileRoutes);
app.use("/api/v1/resume-new", resumeRoutesNew);
app.use("/api/v1/superadmin", superadminRoute);
app.use("/api/v1/analytics", analyticsRoute);


const PORT = process.env.PORT || 8000;

connectDB()
  .then(() => {
    server.listen(PORT, () => console.log(`Server running at port ${PORT}`));
  })
  .catch((err) => console.error("DB connection failed:", err));
