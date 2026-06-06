const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },
    year: {
      type: Number,
      required: true
    },
    limits: {
      food: { type: Number, default: 0 },
      transport: { type: Number, default: 0 },
      entertainment: { type: Number, default: 0 },
      shopping: { type: Number, default: 0 },
      health: { type: Number, default: 0 },
      education: { type: Number, default: 0 },
      utilities: { type: Number, default: 0 },
      other: { type: Number, default: 0 }
    },
    totalLimit: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Unique budget per user per month/year
BudgetSchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', BudgetSchema);