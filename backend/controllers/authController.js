const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide name, email, and password' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists' });
        }

        // Create user (password is auto-hashed by pre-save hook)
        const user = await User.create({ name, email, password });

        const token = generateToken(user._id);

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                lifeStage: user.lifeStage,
                riskScore: user.riskScore,
                riskLabel: user.riskLabel,
            },
        });
    } catch (error) {
        console.error('Register error:', error.message);
        res.status(500).json({ message: 'Server error during registration', error: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // Find user WITH password (select: false by default, so explicitly include it)
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                lifeStage: user.lifeStage,
                riskScore: user.riskScore,
                riskLabel: user.riskLabel,
                portfolio: user.portfolio,
            },
        });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ message: 'Server error during login', error: error.message });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Protected
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            lifeStage: user.lifeStage,
            riskScore: user.riskScore,
            riskLabel: user.riskLabel,
            portfolio: user.portfolio,
            createdAt: user.createdAt,
        });
    } catch (error) {
        console.error('Get profile error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Protected
const updateProfile = async (req, res) => {
    const { name, lifeStage, riskScore, riskLabel, portfolio } = req.body;

    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update allowed fields
        if (name) user.name = name;
        if (lifeStage) user.lifeStage = lifeStage;
        if (riskScore !== undefined) user.riskScore = riskScore;
        if (riskLabel) user.riskLabel = riskLabel;
        if (portfolio) user.portfolio = { ...user.portfolio, ...portfolio };

        await user.save();

        res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                lifeStage: user.lifeStage,
                riskScore: user.riskScore,
                riskLabel: user.riskLabel,
                portfolio: user.portfolio,
            },
        });
    } catch (error) {
        console.error('Update profile error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { registerUser, loginUser, getProfile, updateProfile };
