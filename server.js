require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const employeeRoutes = require("./routes/employeeRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());

app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many requests. Please try again later."
  }
});

app.use("/api/", apiLimiter);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "COMP3123 Assignment 1 API is running"
  });
});

// Reuse one MongoDB connection
let connectionPromise;

function connectToDatabase() {
  if (!process.env.MONGODB_URI) {
    return Promise.reject(new Error("MONGODB_URI is missing"));
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGODB_URI)
      .catch((error) => {
        connectionPromise = null;
        throw error;
      });
  }

  return connectionPromise;
}

// Ensure the database is connected before handling API requests
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    res.status(503).json({
      message: "Database connection unavailable"
    });
  }
});

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/emp", employeeRoutes);

app.get("/health", (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;

  res.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? "healthy" : "unhealthy",
    database: databaseConnected ? "connected" : "disconnected"
  });
});

// Local development server
if (require.main === module) {
  connectToDatabase()
    .then(() => {
      console.log("MongoDB Atlas connected successfully");

      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error("Failed to connect to MongoDB:", error.message);
      process.exit(1);
    });
}

module.exports = app;
