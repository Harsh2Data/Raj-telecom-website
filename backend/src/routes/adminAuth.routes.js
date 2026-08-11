const express = require('express');
const router = express.Router();
const { login, logout, me, listAdmins, createAdmin, updateProfile } = require('../controllers/auth.controller');
const { requireAdmin } = require('../middleware/auth.middleware');

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', requireAdmin, me);
router.patch('/me', requireAdmin, updateProfile);
router.get('/admins', requireAdmin, listAdmins);
router.post('/admins', requireAdmin, createAdmin);

module.exports = router;
