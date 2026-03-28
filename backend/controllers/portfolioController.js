const User = require('../models/User');

// @desc   Get portfolio for current user
// @route  GET /api/portfolio
// @access Protected
const getPortfolio = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('portfolio');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user.portfolio || { investments: [], totalValue: 0, riskLabel: 'Moderate', riskScore: 5 });
    } catch (err) {
        console.error('getPortfolio error:', err.message);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc   Add an investment to portfolio
// @route  POST /api/portfolio/add
// @access Protected
const addInvestment = async (req, res) => {
    const { name, type, value, units, symbol } = req.body;

    if (!name || !type || !value) {
        return res.status(400).json({ message: 'name, type, and value are required' });
    }

    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const newAsset = {
            name: name.trim(),
            type, // 'Equity', 'Mutual Fund', 'Gold', 'FD', 'Other'
            value: parseFloat(value),
            units: units ? parseFloat(units) : null,
            symbol: symbol ? symbol.trim().toUpperCase() : null,
        };

        user.portfolio.investments.push(newAsset);

        // Recalculate total
        user.portfolio.totalValue = user.portfolio.investments.reduce(
            (sum, inv) => sum + inv.value, 0
        );

        await user.save();

        res.status(201).json({
            message: 'Investment added',
            portfolio: user.portfolio,
        });
    } catch (err) {
        console.error('addInvestment error:', err.message);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc   Remove an investment from portfolio
// @route  DELETE /api/portfolio/remove/:assetId
// @access Protected
const removeInvestment = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const before = user.portfolio.investments.length;
        user.portfolio.investments = user.portfolio.investments.filter(
            (inv) => inv._id.toString() !== req.params.assetId
        );

        if (user.portfolio.investments.length === before) {
            return res.status(404).json({ message: 'Investment not found' });
        }

        // Recalculate total
        user.portfolio.totalValue = user.portfolio.investments.reduce(
            (sum, inv) => sum + inv.value, 0
        );

        await user.save();
        res.json({ message: 'Investment removed', portfolio: user.portfolio });
    } catch (err) {
        console.error('removeInvestment error:', err.message);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = { getPortfolio, addInvestment, removeInvestment };
