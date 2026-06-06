const Expense = require('../models/Expense');
const asyncHandler = require('../utils/asyncHandler');

// ─── @route   POST /api/expenses ─────────────────────────────────────
// ─── @access  Private ─────────────────────────────────────────────────
const createExpense = asyncHandler(async (req, res) => {
  const { title, amount, category, description, date, paymentMethod, tags, isRecurring } = req.body;

  const expense = await Expense.create({
    user: req.user.id,
    title,
    amount: parseFloat(amount),
    category: category.toLowerCase(),
    description,
    date: date || new Date(),
    paymentMethod,
    tags: tags || [],
    isRecurring: isRecurring || false
  });

  res.status(201).json({
    success: true,
    message: 'Expense added successfully',
    expense
  });
});

// ─── @route   GET /api/expenses ──────────────────────────────────────
// ─── @access  Private ─────────────────────────────────────────────────
const getExpenses = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    category,
    month,
    year,
    startDate,
    endDate,
    search,
    sortBy = 'date',
    sortOrder = 'desc',
    paymentMethod
  } = req.query;

  // Build filter object
  const filter = { user: req.user.id };

  if (category) filter.category = category.toLowerCase();
  if (month) filter.month = parseInt(month);
  if (year) filter.year = parseInt(year);
  if (paymentMethod) filter.paymentMethod = paymentMethod;

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOptions = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [expenses, total] = await Promise.all([
    Expense.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Expense.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    count: expenses.length,
    total,
    totalPages: Math.ceil(total / parseInt(limit)),
    currentPage: parseInt(page),
    expenses
  });
});

// ─── @route   GET /api/expenses/:id ──────────────────────────────────
// ─── @access  Private ─────────────────────────────────────────────────
const getExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!expense) {
    return res.status(404).json({
      success: false,
      message: 'Expense not found'
    });
  }

  res.status(200).json({
    success: true,
    expense
  });
});

// ─── @route   PUT /api/expenses/:id ──────────────────────────────────
// ─── @access  Private ─────────────────────────────────────────────────
const updateExpense = asyncHandler(async (req, res) => {
  const { title, amount, category, description, date, paymentMethod, tags } = req.body;

  const expense = await Expense.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!expense) {
    return res.status(404).json({
      success: false,
      message: 'Expense not found'
    });
  }

  const updatedExpense = await Expense.findByIdAndUpdate(
    req.params.id,
    {
      title,
      amount: amount ? parseFloat(amount) : expense.amount,
      category: category ? category.toLowerCase() : expense.category,
      description,
      date,
      paymentMethod,
      tags
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Expense updated successfully',
    expense: updatedExpense
  });
});

// ─── @route   DELETE /api/expenses/:id ───────────────────────────────
// ─── @access  Private ─────────────────────────────────────────────────
const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!expense) {
    return res.status(404).json({
      success: false,
      message: 'Expense not found'
    });
  }

  await Expense.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Expense deleted successfully'
  });
});

// ─── @route   DELETE /api/expenses/bulk/delete ───────────────────────
// ─── @access  Private ─────────────────────────────────────────────────
const bulkDeleteExpenses = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide expense IDs to delete'
    });
  }

  const result = await Expense.deleteMany({
    _id: { $in: ids },
    user: req.user.id
  });

  res.status(200).json({
    success: true,
    message: `${result.deletedCount} expense(s) deleted successfully`
  });
});

// ─── @route   GET /api/expenses/stats/monthly ────────────────────────
// ─── @access  Private ─────────────────────────────────────────────────
const getMonthlySummary = asyncHandler(async (req, res) => {
  const { month, year } = req.query;

  const currentDate = new Date();
  const targetMonth = parseInt(month) || currentDate.getMonth() + 1;
  const targetYear = parseInt(year) || currentDate.getFullYear();

  // Get category breakdown
  const categoryData = await Expense.getMonthlySummary(
    req.user.id,
    targetMonth,
    targetYear
  );

  // Total spending for the month
  const totalSpent = categoryData.reduce((sum, cat) => sum + cat.total, 0);

  // Day-wise spending for the month (for bar chart)
  const dailyData = await Expense.aggregate([
    {
      $match: {
        user: req.user.id._id || req.user._id,
        month: targetMonth,
        year: targetYear
      }
    },
    {
      $group: {
        _id: { $dayOfMonth: '$date' },
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        day: '$_id',
        total: { $round: ['$total', 2] },
        count: 1,
        _id: 0
      }
    },
    { $sort: { day: 1 } }
  ]);

  // Most expensive single expense
  const topExpense = await Expense.findOne({
    user: req.user.id,
    month: targetMonth,
    year: targetYear
  }).sort({ amount: -1 }).lean();

  // Count of expenses per category
  const expenseCount = categoryData.reduce((sum, cat) => sum + cat.count, 0);

  res.status(200).json({
    success: true,
    data: {
      month: targetMonth,
      year: targetYear,
      totalSpent: parseFloat(totalSpent.toFixed(2)),
      totalTransactions: expenseCount,
      avgPerDay: parseFloat((totalSpent / new Date(targetYear, targetMonth, 0).getDate()).toFixed(2)),
      categoryBreakdown: categoryData,
      dailyBreakdown: dailyData,
      topExpense
    }
  });
});

// ─── @route   GET /api/expenses/stats/yearly ─────────────────────────
// ─── @access  Private ─────────────────────────────────────────────────
const getYearlySummary = asyncHandler(async (req, res) => {
  const { year } = req.query;
  const targetYear = parseInt(year) || new Date().getFullYear();

  const yearlyData = await Expense.getYearlySummary(req.user.id, targetYear);

  // Fill in missing months with 0
  const allMonths = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    total: 0,
    count: 0
  }));

  yearlyData.forEach(item => {
    allMonths[item.month - 1] = item;
  });

  const totalYearlySpend = allMonths.reduce((sum, m) => sum + m.total, 0);

  res.status(200).json({
    success: true,
    data: {
      year: targetYear,
      totalSpent: parseFloat(totalYearlySpend.toFixed(2)),
      monthlyBreakdown: allMonths
    }
  });
});

// ─── @route   GET /api/expenses/stats/categories ─────────────────────
// ─── @access  Private ─────────────────────────────────────────────────
const getCategoryStats = asyncHandler(async (req, res) => {
  const { period = '30' } = req.query;
  const daysAgo = parseInt(period);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysAgo);

  const stats = await Expense.aggregate([
    {
      $match: {
        user: req.user._id,
        date: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$amount' },
        maxAmount: { $max: '$amount' }
      }
    },
    {
      $project: {
        category: '$_id',
        total: { $round: ['$total', 2] },
        count: 1,
        avgAmount: { $round: ['$avgAmount', 2] },
        maxAmount: { $round: ['$maxAmount', 2] },
        _id: 0
      }
    },
    { $sort: { total: -1 } }
  ]);

  res.status(200).json({
    success: true,
    period: `${daysAgo} days`,
    data: stats
  });
});

module.exports = {
  createExpense,
  getExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
  bulkDeleteExpenses,
  getMonthlySummary,
  getYearlySummary,
  getCategoryStats
};