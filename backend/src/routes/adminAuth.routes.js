const express = require('express');
const router = express.Router();
const { login, logout, me } = require('../controllers/auth.controller');
const { requireAdmin } = require('../middleware/auth.middleware');

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', requireAdmin, me);

module.exports = router;
