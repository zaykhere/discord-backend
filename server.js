const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const PORT = process.env.PORT || process.env.API_PORT;

const app = express();
app.use(express.json());
app.use(cors());

const socketServer = require("./socketServer");

// Importing Routes

const authRoutes = require("./routes/authRoutes");

// Using routes

app.use("/api/auth",authRoutes);

const server = http.createServer(app);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
      console.log(`Connected to database`);
    });
    
  })
  .catch((err) => {
    console.log(`Connection failed: ${err}`)
  })