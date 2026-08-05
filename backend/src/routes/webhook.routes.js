const express = require("express");
const router = express.Router();

// Verify Webhook
router.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook Verified");
    return res.status(200).send(challenge);
  }

  console.log("❌ Webhook Verification Failed");
  return res.sendStatus(403);
});

// Receive Webhook Events
router.post("/webhook", (req, res) => {
  console.log(
    "📩 Webhook Event:",
    JSON.stringify(req.body, null, 2)
  );

  res.sendStatus(200);
});

module.exports = router;