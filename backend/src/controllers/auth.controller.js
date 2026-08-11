const Admin = require('../models/Admin');
const { COOKIE_NAME, verifyPassword, signToken } = require('../services/auth.service');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  let admin;
  try {
    admin = await Admin.findOne({ email: String(email).toLowerCase().trim() });
  } catch (error) {
    console.error('Login failed — database unavailable:', error.message);
    return res.status(503).json({ success: false, message: 'Admin panel is temporarily unavailable. Please try again shortly.' });
  }

  if (!admin || !(await verifyPassword(password, admin.passwordHash))) {
    return res.status(401).json({ success: false, message: 'Incorrect email or password.' });
  }

  const token = signToken(admin);
  res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
  return res.json({ success: true, admin: { id: admin._id, name: admin.name, email: admin.email } });
}

function logout(req, res) {
  res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  return res.json({ success: true });
}

function me(req, res) {
  return res.json({ success: true, admin: req.admin });
}

module.exports = { login, logout, me };
