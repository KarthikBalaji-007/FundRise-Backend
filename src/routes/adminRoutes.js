const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const { adminOnly } = require('../middlewares/adminCheck');
const { getAllUsers } = require('../controllers/adminController');

// Admin-only routes
router.get('/users', authenticate, adminOnly, getAllUsers);

module.exports = router;
