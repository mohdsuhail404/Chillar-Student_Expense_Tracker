export const CATEGORIES = [
  { value: 'food', label: 'Food & Dining', emoji: '🍕', color: '#FF6384' },
  { value: 'transport', label: 'Transport', emoji: '🚌', color: '#36A2EB' },
  { value: 'entertainment', label: 'Entertainment', emoji: '🎮', color: '#FFCE56' },
  { value: 'shopping', label: 'Shopping', emoji: '🛍️', color: '#4BC0C0' },
  { value: 'health', label: 'Health', emoji: '💊', color: '#9966FF' },
  { value: 'education', label: 'Education', emoji: '📚', color: '#FF9F40' },
  { value: 'utilities', label: 'Utilities', emoji: '⚡', color: '#FF6384' },
  { value: 'other', label: 'Other', emoji: '💰', color: '#C9CBCF' }
];

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash', emoji: '💵' },
  { value: 'upi', label: 'UPI', emoji: '📱' },
  { value: 'credit_card', label: 'Credit Card', emoji: '💳' },
  { value: 'debit_card', label: 'Debit Card', emoji: '🏦' },
  { value: 'net_banking', label: 'Net Banking', emoji: '🖥️' },
  { value: 'wallet', label: 'Wallet', emoji: '👛' }
];

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£'
};

export const getCategoryInfo = (value) => {
  return CATEGORIES.find(c => c.value === value) || CATEGORIES[CATEGORIES.length - 1];
};