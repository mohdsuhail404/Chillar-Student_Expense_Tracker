const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email'
      ]
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false // Never return password in queries by default
    },
    avatar: {
      type: String,
      default: null
    },
    // Monthly budget limits per category
    budgets: {
      food: { type: Number, default: 0 },
      transport: { type: Number, default: 0 },
      entertainment: { type: Number, default: 0 },
      shopping: { type: Number, default: 0 },
      health: { type: Number, default: 0 },
      education: { type: Number, default: 0 },
      utilities: { type: Number, default: 0 },
      other: { type: Number, default: 0 }
    },
    // Global monthly budget
    monthlyBudget: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR', 'GBP']
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    lastLogin: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ─── Index for faster queries ─────────────────────────────────────────
UserSchema.index({ email: 1 });

// ─── Pre-save: Hash password ─────────────────────────────────────────
UserSchema.pre('save', async function (next) {
  // Only hash if password is modified
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ─── Method: Compare password ─────────────────────────────────────────
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ─── Method: Generate JWT ─────────────────────────────────────────────
UserSchema.methods.generateToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      name: this.name
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
      issuer: 'chillar-api'
    }
  );
};

// ─── Virtual: Total budget ────────────────────────────────────────────
UserSchema.virtual('totalCategoryBudget').get(function () {
  return Object.values(this.budgets).reduce((sum, val) => sum + val, 0);
});

module.exports = mongoose.model('User', UserSchema);