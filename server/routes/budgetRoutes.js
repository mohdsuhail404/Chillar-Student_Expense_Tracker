const express = require('express');
const router = express.Router();
const { getBudget, setBudget } = require('../controllers/budgetController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getBudget)
  .post(setBudget)
  .put(setBudget);

module.exports = router;