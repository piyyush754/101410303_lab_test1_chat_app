const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const socketIo = require("socket.io");
require("dotenv").config();

// Import Routes
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");

// Initialize App
const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true })); // Allows URL-encoded data


// MongoDB Connection
mongoose
  .connect("mongodb://127.0.0.1:27017/chatApp", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

const users = new Set(); // Store online users

// Socket.io Logic
io.on("connection", (socket) => {
  console.log("✅ New client connected");

  socket.on("joinRoom", ({ username, room }) => {
    socket.join(room);
    users.add(username);
    io.emit("updateUsers", Array.from(users)); // Send updated user list to all clients
    io.to(room).emit("message", { user: "Chat Bot", text: `${username} joined the chat` });
  });

  socket.on("sendGroupMessage", async (data) => {
    io.to(data.room).emit("message", { user: data.from_user, text: data.message });
  });

  socket.on("sendPrivateMessage", async (data) => {
    io.to(data.to_user).emit("message", { user: data.from_user, text: data.message });
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected");
  });
});

app.get("/api/users", (req, res) => {
  res.json(Array.from(users));
});

server.listen(5000, () => console.log("🚀 Server running on port 5000"));
