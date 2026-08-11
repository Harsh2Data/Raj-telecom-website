const express = require('express');
const router = express.Router();
const { dashboard, list, getOne, sendMessage, setStatus } = require('../controllers/conversation.controller');

// Mounted behind requireAdmin in app.js — every route here already assumes an authenticated admin.
router.get('/dashboard', dashboard);
router.get('/conversations', list);
router.get('/conversations/:id', getOne);
router.post('/conversations/:id/messages', sendMessage);
router.patch('/conversations/:id', setStatus);

module.exports = router;
