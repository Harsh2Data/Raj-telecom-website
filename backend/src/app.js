const path = require("path");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const webhookRoutes = require("./routes/webhook.routes");
const leadRoutes = require("./routes/lead.routes");
const bookingRoutes = require("./routes/booking.routes");
const adminAuthRoutes = require("./routes/adminAuth.routes");
const adminConversationRoutes = require("./routes/adminConversation.routes");
const { requireAdmin } = require("./middleware/auth.middleware");

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = Buffer.from(buf);
    }
}));

// Routes
app.use("/api", leadRoutes);
app.use("/api", bookingRoutes);
app.use("/", webhookRoutes);

// Admin panel — API + static frontend, both served from this same backend
// (no separate frontend project/deploy for it).
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin", requireAdmin, adminConversationRoutes);
app.use("/admin", express.static(path.join(__dirname, "../public/admin")));

app.get("/api/whatsapp/status", (req, res) => {
    res.json({
        success: true,
        outboundConfigured: Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.PHONE_NUMBER_ID && process.env.OWNER_PHONE),
        webhookVerificationConfigured: Boolean(process.env.VERIFY_TOKEN),
        webhookSignatureConfigured: Boolean(process.env.META_APP_SECRET),
        allowUnverifiedWebhooks: process.env.ALLOW_UNVERIFIED_WEBHOOKS === "true",
        publicWebhookUrl: process.env.WEBHOOK_PUBLIC_URL || null
    });
});
// Test Route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Raj Telecom Backend is running 🚀"
    });
});

// Catch-all JSON error handler — must be last. Without this, Express's
// default handler renders an HTML page with the raw error stack trace,
// which both breaks every client here (they all expect JSON) and leaks
// internals. Express 5 auto-forwards rejected async route handlers here.
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err.stack || err.message);
    res.status(err.status || 500).json({
        success: false,
        message: err.expose ? err.message : "Something went wrong. Please try again."
    });
});

module.exports = app;
