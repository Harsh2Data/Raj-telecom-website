const Admin = require('../models/Admin');
const { hashPassword } = require('./auth.service');

// Runs once at server startup, after MongoDB connects. Only ever creates an
// admin if the collection is completely empty — a genuine bootstrap, not a
// "sync env vars on every restart" mechanism, so it won't silently reset a
// password you've since changed through the app. Exists so a first login can
// be created without shell access to the server (e.g. Render's free tier).
async function ensureSeedAdmin() {
  const name = process.env.ADMIN_SEED_NAME;
  const email = process.env.ADMIN_SEED_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!name || !email || !password) return; // nothing configured — skip quietly

  const existingCount = await Admin.countDocuments();
  if (existingCount > 0) return; // already bootstrapped, never overwrite

  if (password.length < 8) {
    console.warn('⚠️ ADMIN_SEED_PASSWORD is under 8 characters — skipping admin bootstrap.');
    return;
  }

  const passwordHash = await hashPassword(password);
  await Admin.create({ name, email: email.toLowerCase().trim(), passwordHash });
  console.log(`✅ Bootstrapped first admin login: ${email}`);
}

module.exports = { ensureSeedAdmin };
