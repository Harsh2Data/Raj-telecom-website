const express = require("express");
const cors = require("cors");
const webhookRoutes = require("./routes/webhook.routes");
const leadRoutes = require("./routes/lead.routes");
const bookingRoutes = require("./routes/booking.routes");

const app = express();

// Middleware
app.use(cors());
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = Buffer.from(buf);
    }
  })
);

// Routes
app.use("/api", leadRoutes);
app.use("/api", bookingRoutes);
app.use("/", webhookRoutes);
// Test Route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Raj Telecom Backend is running 🚀"
    });
});

module.exports = app;
