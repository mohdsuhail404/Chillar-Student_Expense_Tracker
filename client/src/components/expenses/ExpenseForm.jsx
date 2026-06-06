import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { CATEGORIES, PAYMENT_METHODS } from '../../utils/constants';
import { useExpenses } from '../../context/ExpenseContext';

const defaultForm = {
  title: '',
  amount: '',
  category: 'food',
  description: '',
  date: new Date().toISOString().split('T')[0],
  paymentMethod: 'upi',
  tags: []
};

const ExpenseForm = ({ expense, onClose, onSuccess }) => {
  const [formData, setFormData] = useState(defaultForm);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addExpense, updateExpense } = useExpenses();

  const isEditing = !!expense;

  // Pre-fill form when editing
  useEffect(() => {
    if (expense) {
      setFormData({
        title: expense.title || '',
        amount: expense.amount?.toString() || '',
        category: expense.category || 'food',
        description: expense.description || '',
        date: expense.date
          ? new Date(expense.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        paymentMethod: expense.paymentMethod || 'upi',
        tags: expense.tags || []
      });
    }
  }, [expense]);

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0)
      newErrors.amount = 'Valid amount is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.date) newErrors.date = 'Date is required';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const addTag = (e) => {
    e.preventDefault();
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
    setTagInput('');
  };

  const removeTag = (tag) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    const payload = {
      ...formData,
      amount: parseFloat(formData.amount)
    };

    let result;
    if (isEditing) {
      result = await updateExpense(expense._id, payload);
    } else {
      result = await addExpense(payload);
    }

    setIsSubmitting(false);
    if (result.success) {
      onSuccess?.();
      onClose?.();
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="modal">
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {isEditing ? '✏️ Edit Expense' : '➕ Add Expense'}
          </h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            {/* Title & Amount */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">What did you spend on? *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Lunch at mess"
                  className="form-control"
                  style={errors.title ? { borderColor: 'var(--danger)' } : {}}
                  autoFocus
                />
                {errors.title && <p className="form-error">{errors.title}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Amount (₹) *</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="form-control"
                  min="0.01"
                  step="0.01"
                  style={errors.amount ? { borderColor: 'var(--danger)' } : {}}
                />
                {errors.amount && <p className="form-error">{errors.amount}</p>}
              </div>
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label">Category *</label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 8
              }}>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                    style={{
                      padding: '10px 6px',
                      borderRadius: 'var(--radius-md)',
                      border: `2px solid ${formData.category === cat.value ? cat.color : 'var(--border)'}`,
                      background: formData.category === cat.value
                        ? `${cat.color}20`
                        : 'var(--bg-secondary)',
                      color: formData.category === cat.value ? cat.color : 'var(--text-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>{cat.emoji}</span>
                    {cat.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Payment */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="form-control"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="form-control"
                >
                  {PAYMENT_METHODS.map(pm => (
                    <option key={pm.value} value={pm.value}>
                      {pm.emoji} {pm.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Note (optional)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Any extra details..."
                className="form-control"
                rows={2}
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Tags */}
            <div className="form-group">
              <label className="form-label">Tags (optional)</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTag(e)}
                  placeholder="Add tag..."
                  className="form-control"
                  maxLength={20}
                />
                <button type="button" className="btn btn-secondary" onClick={addTag}>
                  <Plus size={16} />
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="badge badge-primary"
                      style={{ cursor: 'pointer' }}
                      onClick={() => removeTag(tag)}
                    >
                      #{tag} <X size={10} style={{ marginLeft: 4 }} />
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="modal-footer" style={{ padding: 0, paddingTop: 8 }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                    Saving...
                  </>
                ) : (
                  isEditing ? '✅ Update' : '➕ Add Expense'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExpenseForm;