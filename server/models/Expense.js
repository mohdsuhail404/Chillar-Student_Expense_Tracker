const mongoose = require('mongoose');

const CATEGORIES = [
  'food',
  'transport',
  'entertainment',
  'shopping',
  'health',
  'education',
  'utilities',
  'other'
];

const PAYMENT_METHODS = [
  'cash',
  'upi',
  'credit_card',
  'debit_card',
  'net_banking',
  'wallet'
];

const ExpenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Expense title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
      max: [1000000, 'Amount cannot exceed 1,000,000']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: CATEGORIES,
        message: '{VALUE} is not a valid category'
      },
      lowercase: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: ''
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now
    },
    paymentMethod: {
      type: String,
      enum: PAYMENT_METHODS,
      default: 'cash'
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 20
    }],
    isRecurring: {
      type: Boolean,
      default: false
    },
    recurringFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', null],
      default: null
    },
    // Month & Year for efficient monthly queries
    month: {
      type: Number,
      min: 1,
      max: 12
    },
    year: {
      type: Number
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ─── Compound Indexes for fast queries ────────────────────────────────
ExpenseSchema.index({ user: 1, date: -1 });
ExpenseSchema.index({ user: 1, month: 1, year: 1 });
ExpenseSchema.index({ user: 1, category: 1 });
ExpenseSchema.index({ user: 1, year: 1, month: 1, category: 1 });

// ─── Pre-save: Extract month & year ──────────────────────────────────
ExpenseSchema.pre('save', function (next) {
  if (this.date) {
    const d = new Date(this.date);
    this.month = d.getMonth() + 1; // 1-12
    this.year = d.getFullYear();
  }
  next();
});

// ─── Pre-findOneAndUpdate ─────────────────────────────────────────────
ExpenseSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update.date) {
    const d = new Date(update.date);
    update.month = d.getMonth() + 1;
    update.year = d.getFullYear();
  }
  next();
});

// ─── Static: Get monthly summary ─────────────────────────────────────
ExpenseSchema.statics.getMonthlySummary = async function (userId, month, year) {
  return this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        month: parseInt(month),
        year: parseInt(year)
      }
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$amount' }
      }
    },
    {
      $project: {
        category: '$_id',
        total: { $round: ['$total', 2] },
        count: 1,
        avgAmount: { $round: ['$avgAmount', 2] },
        _id: 0
      }
    },
    { $sort: { total: -1 } }
  ]);
};

// ─── Static: Get yearly summary ──────────────────────────────────────
ExpenseSchema.statics.getYearlySummary = async function (userId, year) {
  return this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        year: parseInt(year)
      }
    },
    {
      $group: {
        _id: '$month',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        month: '$_id',
        total: { $round: ['$total', 2] },
        count: 1,
        _id: 0
      }
    },
    { $sort: { month: 1 } }
  ]);
};

module.exports = mongoose.model('Expense', ExpenseSchema);
module.exports.CATEGORIES = CATEGORIES;
module.exports.PAYMENT_METHODS = PAYMENT_METHODS;