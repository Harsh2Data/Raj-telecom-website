const express = require("express");
const cors = require("cors");
const leadRoutes = require("./routes/lead.routes");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api", leadRoutes);


// Test Route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Raj Telecom Backend is running 🚀"
    });
});

module.exports = app;