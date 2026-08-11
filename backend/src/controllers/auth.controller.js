const Admin = require('../models/Admin');
const { COOKIE_NAME, hashPassword, verifyPassword, signToken } = require('../services/auth.service');

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

// Any logged-in admin can see who else has access — matches the spec's
// "multiple admins, no roles yet" model (no owner/staff distinction).
async function listAdmins(req, res) {
  try {
    const admins = await Admin.find().select('name email createdAt').sort({ createdAt: 1 });
    return res.json({ success: true, admins });
  } catch (error) {
    console.error('List admins failed — database unavailable:', error.message);
    return res.status(503).json({ success: false, message: 'Admin panel is temporarily unavailable. Please try again shortly.' });
  }
}

async function createAdmin(req, res) {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
  }
  if (String(password).length < 8) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  try {
    const existing = await Admin.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An admin with this email already exists.' });
    }
    const passwordHash = await hashPassword(password);
    const admin = await Admin.create({ name: String(name).trim(), email: normalizedEmail, passwordHash });
    return res.status(201).json({
      success: true,
      admin: { id: admin._id, name: admin.name, email: admin.email, createdAt: admin.createdAt }
    });
  } catch (error) {
    console.error('Create admin failed:', error.message);
    return res.status(503).json({ success: false, message: 'Could not create the admin right now. Please try again.' });
  }
}

// Lets an admin rename themselves and/or change their own password. Never
// touches other admins' accounts — there is no delete/edit-others endpoint,
// matching the "no roles yet" scope (nobody is an admin-of-admins).
async function updateProfile(req, res) {
  const { name, currentPassword, newPassword } = req.body || {};
  try {
    const admin = await Admin.findById(req.admin.id);
    if (!admin) return res.status(404).json({ success: false, message: 'Admin account not found.' });

    if (newPassword) {
      if (!currentPassword || !(await verifyPassword(currentPassword, admin.passwordHash))) {
        return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
      }
      if (String(newPassword).length < 8) {
        return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
      }
      admin.passwordHash = await hashPassword(newPassword);
    }

    if (name && String(name).trim()) admin.name = String(name).trim();
    await admin.save();

    // Re-issue the session cookie so a changed name shows up immediately.
    const token = signToken(admin);
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({ success: true, admin: { id: admin._id, name: admin.name, email: admin.email } });
  } catch (error) {
    console.error('Update profile failed:', error.message);
    return res.status(503).json({ success: false, message: 'Could not update your profile right now.' });
  }
}

module.exports = { login, logout, me, listAdmins, createAdmin, updateProfile };
