const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getProfile,
    updateProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/me', protect, getProfile);      // session restore on page reload
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;
