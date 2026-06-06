const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  createExpense,
  getExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
  bulkDeleteExpenses,
  getMonthlySummary,
  getYearlySummary,
  getCategoryStats
} = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Expense validation
const expenseValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('amount')
    .isNumeric().withMessage('Amount must be a number')
    .isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['food', 'transport', 'entertainment', 'shopping', 'health', 'education', 'utilities', 'other'])
    .withMessage('Invalid category')
];

// All routes protected
router.use(protect);

// Stats routes (before /:id to avoid conflict)
router.get('/stats/monthly', getMonthlySummary);
router.get('/stats/yearly', getYearlySummary);
router.get('/stats/categories', getCategoryStats);

// CRUD routes
router.route('/')
  .get(getExpenses)
  .post(expenseValidation, validate, createExpense);

router.delete('/bulk/delete', bulkDeleteExpenses);

router.route('/:id')
  .get(getExpense)
  .put(updateExpense)
  .delete(deleteExpense);

module.exports = router;