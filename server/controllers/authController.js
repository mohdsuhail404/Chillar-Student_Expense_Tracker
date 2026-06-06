const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// ─── Helper: Send token response ─────────────────────────────────────
const sendTokenResponse = (user, statusCode, res, message) => {
  const token = user.generateToken();

  // Remove password from output
  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    currency: user.currency,
    budgets: user.budgets,
    monthlyBudget: user.monthlyBudget,
    createdAt: user.createdAt
  };

  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: userResponse
  });
};

// ─── @route   POST /api/auth/signup ──────────────────────────────────
// ─── @access  Public ──────────────────────────────────────────────────
const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'An account with this email already exists'
    });
  }

  // Create user
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password
  });

  sendTokenResponse(user, 201, res, 'Account created successfully! Welcome to Chillar 🎉');
});

// ─── @route   POST /api/auth/login ───────────────────────────────────
// ─── @access  Public ──────────────────────────────────────────────────
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user and include password for comparison
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Compare passwords
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Update last login
  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res, 'Login successful! Welcome back 👋');
});

// ─── @route   GET /api/auth/me ────────────────────────────────────────
// ─── @access  Private ─────────────────────────────────────────────────
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user
  });
});

// ─── @route   PUT /api/auth/update-profile ───────────────────────────
// ─── @access  Private ─────────────────────────────────────────────────
const updateProfile = asyncHandler(async (req, res) => {
  const { name, currency } = req.body;

  const fieldsToUpdate = {};
  if (name) fieldsToUpdate.name = name.trim();
  if (currency) fieldsToUpdate.currency = currency;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    fieldsToUpdate,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user
  });
});

// ─── @route   PUT /api/auth/change-password ──────────────────────────
// ─── @access  Private ─────────────────────────────────────────────────
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res, 'Password changed successfully');
});

// ─── @route   DELETE /api/auth/delete-account ────────────────────────
// ─── @access  Private ─────────────────────────────────────────────────
const deleteAccount = asyncHandler(async (req, res) => {
  const Expense = require('../models/Expense');

  // Delete all user expenses first
  await Expense.deleteMany({ user: req.user.id });
  await User.findByIdAndDelete(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Account deleted successfully'
  });
});

module.exports = {
  signup,
  login,
  getMe,
  updateProfile,
  changePassword,
  deleteAccount
};