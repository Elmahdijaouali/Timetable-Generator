const express = require("express");
const router = express.Router();
const { index, getByKey, createOrUpdate, destroy } = require('./../../../controllers/SettingController.js');

// Get all settings
router.get('/settings', index);

// Get setting by key
router.get('/settings/:key', getByKey);

// Create or update setting
router.post('/settings', createOrUpdate);

// Update setting by key
router.put('/settings/:key', createOrUpdate);

// Delete setting
router.delete('/settings/:key', destroy);

module.exports = router; 