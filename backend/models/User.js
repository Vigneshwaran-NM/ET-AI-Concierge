const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false, // Never returned in queries by default
    },
    lifeStage: {
        type: String,
        enum: ['Student', 'Early Career', 'Mid Career', 'Pre-Retirement', 'Retired'],
        default: 'Early Career',
    },
    riskScore: {
        type: Number,
        min: 1,
        max: 10,
        default: 5,
    },
    riskLabel: {
        type: String,
        enum: ['Conservative', 'Moderate', 'Aggressive'],
        default: 'Moderate',
    },
    portfolio: {
        equity: { type: Number, default: 60 },
        mutualFunds: { type: Number, default: 25 },
        crypto: { type: Number, default: 10 },
        cash: { type: Number, default: 5 },
        totalValue: { type: Number, default: 0 },
        investments: [
            {
                name: { type: String, required: true },
                type: {
                    type: String,
                    enum: ['Equity', 'Mutual Fund', 'Gold', 'FD', 'Crypto', 'Other'],
                    default: 'Equity',
                },
                value: { type: Number, required: true },
                units: { type: Number, default: null },
                symbol: { type: String, default: null },
                addedAt: { type: Date, default: Date.now },
            },
        ],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
