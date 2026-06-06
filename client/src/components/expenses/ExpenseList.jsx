import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Trash2, Edit2, RefreshCw } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { useAuth } from '../../context/AuthContext';
import { CATEGORIES, PAYMENT_METHODS } from '../../utils/constants';
import { formatCurrency, formatDate, getCategoryInfo } from '../../utils/helpers';
import ExpenseForm from './ExpenseForm';

const ExpenseList = () => {
  const {
    expenses, total, totalPages, currentPage,
    isLoading, filters, fetchExpenses, deleteExpense, setFilters
  } = useExpenses();
  const { user } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const currency = user?.currency || 'INR';

  // Fetch on mount & filter change
  useEffect(() => {
    fetchExpenses();
  }, [filters]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({ search: searchTerm });
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleDelete = async (id) => {
    await deleteExpense(id);
    setDeleteConfirm(null);
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingExpense(null);
  };

  const handleFormSuccess = () => {
    fetchExpenses();
  };

  const getCategoryColor = (category) => {
    return CATEGORIES.find(c => c.value === category)?.color || '#C9CBCF';
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="page-subtitle">
            {total} transaction{total !== 1 ? 's' : ''} total
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { setEditingExpense(null); setShowForm(true); }}
        >
          <Plus size={18} />
          Add Expense
        </button>
      </div>

      {/* Filters Bar */}
      <div className="filters-bar">
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{
            position: 'absolute', left: 12, top: '50%',
            transform: 'translateY(-50%)', color: 'var(--text-muted)'
          }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search expenses..."
            className="search-input"
            style={{ paddingLeft: 34, width: '100%' }}
          />
        </div>

        <select
          value={filters.category}
          onChange={(e) => setFilters({ category: e.target.value })}
          className="filter-select"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>
              {cat.emoji} {cat.label}
            </option>
          ))}
        </select>

        <select
          value={filters.month}
          onChange={(e) => setFilters({ month: parseInt(e.target.value) })}
          className="filter-select"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(2024, i).toLocaleString('default', { month: 'long' })}
            </option>
          ))}
        </select>

        <select
          value={filters.year}
          onChange={(e) => setFilters({ year: parseInt(e.target.value) })}
          className="filter-select"
        >
          {[2023, 2024, 2025].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <select
          value={filters.sortBy}
          onChange={(e) => setFilters({ sortBy: e.target.value })}
          className="filter-select"
        >
          <option value="date">Sort: Date</option>
          <option value="amount">Sort: Amount</option>
          <option value="title">Sort: Name</option>
        </select>

        <button
          className="btn btn-ghost btn-sm"
          onClick={() => fetchExpenses()}
          title="Refresh"
        >
          <RefreshCw size={16} className={isLoading ? 'spin' : ''} />
        </button>
      </div>

      {/* Expense List */}
      <div className="card">
        {isLoading ? (
          <div className="empty-state">
            <div className="spinner" />
          </div>
        ) : expenses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-emoji">💸</div>
            <h3>No expenses found</h3>
            <p>Add your first expense to start tracking your spending</p>
            <button
              className="btn btn-primary"
              style={{ marginTop: 16 }}
              onClick={() => setShowForm(true)}
            >
              <Plus size={16} /> Add Expense
            </button>
          </div>
        ) : (
          <div>
            {expenses.map((expense) => {
              const catInfo = getCategoryInfo(expense.category);

              return (
                <div key={expense._id} className="expense-item">
                  {/* Category emoji */}
                  <div
                    className="expense-emoji"
                    style={{ background: `${catInfo.color}15` }}
                  >
                    {catInfo.emoji}
                  </div>

                  {/* Info */}
                  <div className="expense-info">
                    <div className="expense-title">{expense.title}</div>
                    <div className="expense-meta">
                      <span>{formatDate(expense.date)}</span>
                      <span>•</span>
                      <span style={{ color: catInfo.color, fontWeight: 500 }}>
                        {catInfo.label}
                      </span>
                      {expense.paymentMethod && (
                        <>
                          <span>•</span>
                          <span>
                            {PAYMENT_METHODS.find(p => p.value === expense.paymentMethod)?.emoji}
                            {' '}
                            {PAYMENT_METHODS.find(p => p.value === expense.paymentMethod)?.label}
                          </span>
                        </>
                      )}
                    </div>
                    {expense.tags?.length > 0 && (
                      <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                        {expense.tags.map(tag => (
                          <span key={tag} className="badge badge-primary" style={{ fontSize: '0.65rem' }}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Amount */}
                  <div className="expense-amount">
                    -{formatCurrency(expense.amount, currency)}
                  </div>

                  {/* Actions */}
                  <div className="expense-actions">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleEdit(expense)}
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => setDeleteConfirm(expense._id)}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginTop: 20,
                paddingTop: 16,
                borderTop: '1px solid var(--border-light)'
              }}>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    className={`btn btn-sm ${currentPage === i + 1 ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => fetchExpenses({ page: i + 1 })}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-body" style={{ textAlign: 'center', padding: 32 }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>🗑️</div>
              <h3 style={{ marginBottom: 8 }}>Delete Expense?</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 24 }}>
                This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(deleteConfirm)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <ExpenseForm
          expense={editingExpense}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

export default ExpenseList;