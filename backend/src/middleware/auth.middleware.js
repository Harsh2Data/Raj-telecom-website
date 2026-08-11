const { COOKIE_NAME, verifyToken } = require('../services/auth.service');

function requireAdmin(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not logged in.' });
  }
  try {
    req.admin = verifyToken(token);
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Session expired — please log in again.' });
  }
}

module.exports = { requireAdmin };
