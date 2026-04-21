require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth");
const goalRoutes = require("./routes/goals");
const aiRoutes = require("./routes/ai");
const predictionRoutes = require("./routes/predictions");
const templateRoutes = require("./routes/templates");
const progressRoutes = require("./routes/Progress");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:8081",
  process.env.CLIENT_ORIGIN,
].filter(Boolean);

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.json({ ok: true, message: "VisionBoard API running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/goals", authMiddleware, goalRoutes);
app.use("/api/ai", authMiddleware, aiRoutes);
app.use("/api/predictions", authMiddleware, predictionRoutes);
app.use("/api/templates", authMiddleware, templateRoutes);
app.use("/api/progress", authMiddleware, progressRoutes);
app.use("/api/entries", require("./routes/entries"));

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
  });
