const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getPortfolio, addInvestment, removeInvestment } = require('../controllers/portfolioController');

router.use(protect);

router.get('/', getPortfolio);
router.post('/add', addInvestment);
router.delete('/remove/:assetId', removeInvestment);

module.exports = router;
