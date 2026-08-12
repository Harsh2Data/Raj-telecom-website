const express = require('express');
const router = express.Router();
const { dashboard, list, getOne, sendMessage, setStatus, updateRepairStage, templates, sendTemplate } = require('../controllers/conversation.controller');
const { getMedia } = require('../controllers/media.controller');

// Mounted behind requireAdmin in app.js — every route here already assumes an authenticated admin.
router.get('/dashboard', dashboard);
router.get('/templates', templates);
router.get('/conversations', list);
router.get('/conversations/:id', getOne);
router.post('/conversations/:id/messages', sendMessage);
router.post('/conversations/:id/template', sendTemplate);
router.patch('/conversations/:id', setStatus);
router.patch('/conversations/:id/repair-stage', updateRepairStage);
router.get('/media/:messageId', getMedia);

module.exports = router;
