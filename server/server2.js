// server2.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();
const { initializeCollections } = require("./database/mongoCollections");
const { initializeFirebase } = require("./app/services/firebase");

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.DEV_CLIENT_URL,
    methods: "GET,PUT,POST,DELETE",
    credentials: true,
  })
);

// WebSocket setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.DEV_CLIENT_URL,
  },
});

app.set("io", io);

// WebSocket setup
io.on("connection", async (socket) => {
  console.log("New client connected");
  
  try {
    const wagers = await getAllWagers(); // Fetch wagers on connection
    socket.emit("wagersUpdate", wagers);
  } catch (err) {
    console.error("Error fetching wagers for WebSocket:", err.message);
  }
  
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Initialize database
initializeCollections().then(() => console.log("Collections initialized"));
initializeFirebase().then(() => console.log("Firebase initialized"));

// Import routes
app.use("/api/users", require("./app/routes/usersRoutes"));
app.use("/api/logs", require("./app/routes/logsRoutes"));
app.use("/api/plaid", require("./app/routes/plaidRoutes"));
app.use("/api/stripe", require("./app/routes/stripeRoutes"));
app.use("/api/geofencing", require("./app/routes/geofencingRoutes"));
app.use("/api/age-restriction", require("./app/routes/ageRestrictionRoutes"));
app.use("/api/wagers", require("./app/routes/wagersRoutes"));
app.use("/api/bets", require("./app/routes/betsRoutes"));
app.use("/api/seasons", require("./app/routes/seasonsRoutes"));
app.use("/api/tournaments", require("./app/routes/tournamentsRoutes"));
app.use("/api/series", require("./app/routes/seriesRoutes"));
app.use("/api/matches", require("./app/routes/matchesRoutes"));
app.use("/api/teams", require("./app/routes/teamsRoutes"));
app.use("/api/players", require("./app/routes/playersRoutes"));

// Start server
const PORT = process.env.DEV_SERVER_URL_PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));