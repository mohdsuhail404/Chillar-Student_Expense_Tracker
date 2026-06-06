import { CURRENCY_SYMBOLS, MONTHS } from './constants';

export const formatCurrency = (amount, currency = 'INR') => {
  const symbol = CURRENCY_SYMBOLS[currency] || '₹';
  return `${symbol}${parseFloat(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })}`;
};

export const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export const getMonthName = (month) => MONTHS[parseInt(month) - 1];

export const getCurrentMonthYear = () => {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear()
  };
};

export const generateAvatarColor = (name) => {
  const colors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
    '#f97316', '#eab308', '#22c55e', '#14b8a6'
  ];
  const index = name?.charCodeAt(0) % colors.length || 0;
  return colors[index];
};

export const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const getDaysInMonth = (month, year) => {
  return new Date(year, month, 0).getDate();
};

export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

export const truncate = (str, maxLength = 30) => {
  if (!str) return '';
  return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
};