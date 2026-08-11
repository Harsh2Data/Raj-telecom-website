// One-off script to create (or update the password of) an admin login.
// Run locally or via Render's shell:
//   ADMIN_SEED_NAME="Raj" ADMIN_SEED_EMAIL="owner@example.com" ADMIN_SEED_PASSWORD="..." node scripts/seedAdmin.js
// Uses the same MONGODB_URI / .env as the server.

require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../src/models/Admin');
const { hashPassword } = require('../src/services/auth.service');

async function main() {
  const name = process.env.ADMIN_SEED_NAME;
  const email = process.env.ADMIN_SEED_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!name || !email || !password) {
    console.error('Set ADMIN_SEED_NAME, ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD before running this script.');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('ADMIN_SEED_PASSWORD must be at least 8 characters.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const passwordHash = await hashPassword(password);
  const admin = await Admin.findOneAndUpdate(
    { email: email.toLowerCase().trim() },
    { $set: { name, email: email.toLowerCase().trim(), passwordHash } },
    { upsert: true, new: true }
  );

  console.log(`✅ Admin ready: ${admin.email}`);
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error('❌ Seed failed:', error.message);
  process.exit(1);
});
