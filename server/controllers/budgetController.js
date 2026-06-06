const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const asyncHandler = require('../utils/asyncHandler');

// ─── @route   GET /api/budget ─────────────────────────────────────────
// ─── @access  Private ─────────────────────────────────────────────────
const getBudget = asyncHandler(async (req, res) => {
  const { month, year } = req.query;

  const currentDate = new Date();
  const targetMonth = parseInt(month) || currentDate.getMonth() + 1;
  const targetYear = parseInt(year) || currentDate.getFullYear();

  let budget = await Budget.findOne({
    user: req.user.id,
    month: targetMonth,
    year: targetYear
  });

  // If no budget set, return empty structure
  if (!budget) {
    budget = {
      month: targetMonth,
      year: targetYear,
      limits: {
        food: 0, transport: 0, entertainment: 0,
        shopping: 0, health: 0, education: 0,
        utilities: 0, other: 0
      },
      totalLimit: 0
    };
  }

  // Get actual spending for the month
  const spending = await Expense.getMonthlySummary(
    req.user.id,
    targetMonth,
    targetYear
  );

  // Calculate budget status per category
  const budgetStatus = {};
  const categories = Object.keys(budget.limits || budget._doc?.limits || {});

  categories.forEach(cat => {
    const limit = budget.limits[cat];
    const spent = spending.find(s => s.category === cat)?.total || 0;
    const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;

    budgetStatus[cat] = {
      limit,
      spent: parseFloat(spent.toFixed(2)),
      remaining: parseFloat(Math.max(0, limit - spent).toFixed(2)),
      percentage: Math.min(percentage, 100),
      isExceeded: spent > limit && limit > 0,
      isWarning: percentage >= 80 && percentage < 100
    };
  });

  const totalSpent = spending.reduce((sum, s) => sum + s.total, 0);
  const totalLimit = budget.totalLimit || 0;

  res.status(200).json({
    success: true,
    data: {
      month: targetMonth,
      year: targetYear,
      totalLimit,
      totalSpent: parseFloat(totalSpent.toFixed(2)),
      totalRemaining: parseFloat(Math.max(0, totalLimit - totalSpent).toFixed(2)),
      totalPercentage: totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0,
      categoryBudgets: budgetStatus,
      // Alerts
      alerts: generateAlerts(budgetStatus, totalSpent, totalLimit)
    }
  });
});

// ─── @route   POST/PUT /api/budget ────────────────────────────────────
// ─── @access  Private ─────────────────────────────────────────────────
const setBudget = asyncHandler(async (req, res) => {
  const { month, year, limits, totalLimit } = req.body;

  const currentDate = new Date();
  const targetMonth = parseInt(month) || currentDate.getMonth() + 1;
  const targetYear = parseInt(year) || currentDate.getFullYear();

  // Upsert budget
  const budget = await Budget.findOneAndUpdate(
    {
      user: req.user.id,
      month: targetMonth,
      year: targetYear
    },
    {
      user: req.user.id,
      month: targetMonth,
      year: targetYear,
      limits: limits || {},
      totalLimit: totalLimit || 0
    },
    {
      upsert: true,
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    message: 'Budget updated successfully',
    budget
  });
});

// ─── Helper: Generate budget alerts ──────────────────────────────────
const generateAlerts = (budgetStatus, totalSpent, totalLimit) => {
  const alerts = [];

  Object.entries(budgetStatus).forEach(([category, status]) => {
    if (status.limit === 0) return;

    if (status.isExceeded) {
      alerts.push({
        type: 'danger',
        category,
        message: `🚨 You've exceeded your ${category} budget by ₹${Math.abs(status.remaining).toFixed(0)}!`,
        percentage: status.percentage
      });
    } else if (status.isWarning) {
      alerts.push({
        type: 'warning',
        category,
        message: `⚠️ You've spent ${status.percentage}% of your ${category} budget`,
        percentage: status.percentage
      });
    }
  });

  // Total budget alert
  if (totalLimit > 0) {
    const totalPct = Math.round((totalSpent / totalLimit) * 100);
    if (totalSpent > totalLimit) {
      alerts.unshift({
        type: 'danger',
        category: 'total',
        message: `🚨 You've exceeded your total monthly budget!`,
        percentage: totalPct
      });
    } else if (totalPct >= 80) {
      alerts.unshift({
        type: 'warning',
        category: 'total',
        message: `⚠️ You've used ${totalPct}% of your total monthly budget`,
        percentage: totalPct
      });
    }
  }

  return alerts;
};

module.exports = { getBudget, setBudget };