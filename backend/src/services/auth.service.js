const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const TOKEN_TTL = '7d';
const COOKIE_NAME = 'rt_admin_token';

function requireSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set — admin login cannot issue sessions without it.');
  return secret;
}

async function hashPassword(plain) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

function signToken(admin) {
  return jwt.sign(
    { id: admin._id.toString(), email: admin.email, name: admin.name },
    requireSecret(),
    { expiresIn: TOKEN_TTL }
  );
}

function verifyToken(token) {
  return jwt.verify(token, requireSecret());
}

module.exports = { COOKIE_NAME, hashPassword, verifyPassword, signToken, verifyToken };
