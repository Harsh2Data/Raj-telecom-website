require('dotenv').config();

const http = require('http');
const app = require('./src/app');
const { connectDB } = require('./src/config/db');
const { init: initSocket } = require('./src/realtime/socket');
const { ensureSeedAdmin } = require('./src/services/adminBootstrap.service');

const port = process.env.PORT || 5000;
const server = http.createServer(app);

initSocket(server);

// MongoDB is only required for the admin panel (conversations/messages/auth).
// The existing customer-facing lead/booking/webhook routes must keep working
// even if it's unreachable or not configured yet, so a Mongo failure is
// logged, not fatal — the server still starts either way.
connectDB()
  .then(() => ensureSeedAdmin())
  .catch((error) => {
    console.error('⚠️ MongoDB unavailable — admin panel features are disabled until this is fixed:', error.message);
  });

server.listen(port, () => {
  console.log(`Raj Telecom backend is running on port ${port}`);
});
