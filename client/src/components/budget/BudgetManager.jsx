import React, { useState, useEffect } from 'react';
import { Save, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { CATEGORIES } from '../../utils/constants';
import { useExpenses } from '../../context/ExpenseContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, getCurrentMonthYear, getMonthName } from '../../utils/helpers';
import { expenseService } from '../../services/expenseService';
import toast from 'react-hot-toast';

const BudgetManager = () => {
  const { budget, fetchBudget } = useExpenses();
  const { user } = useAuth();
  const currency = user?.currency || 'INR';

  const { month, year } = getCurrentMonthYear();
  const [budgetInputs, setBudgetInputs] = useState({});
  const [totalBudget, setTotalBudget] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(month);
  const [selectedYear, setSelectedYear] = useState(year);

  // Load budget on mount
  useEffect(() => {
    fetchBudget(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  // Populate inputs from fetched budget
  useEffect(() => {
    if (budget) {
      const inputs = {};
      CATEGORIES.forEach(cat => {
        inputs[cat.value] = budget.categoryBudgets?.[cat.value]?.limit?.toString() || '';
      });
      setBudgetInputs(inputs);
      setTotalBudget(budget.totalLimit?.toString() || '');
    }
  }, [budget]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const limits = {};
      CATEGORIES.forEach(cat => {
        limits[cat.value] = parseFloat(budgetInputs[cat.value] || 0);
      });

      await expenseService.setBudget({
        month: selectedMonth,
        year: selectedYear,
        limits,
        totalLimit: parseFloat(totalBudget || 0)
      });

      toast.success('Budget saved! 🎯');
      fetchBudget(selectedMonth, selectedYear);
    } catch (error) {
      toast.error(error.message || 'Failed to save budget');
    }
    setIsSaving(false);
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'var(--danger)';
    if (percentage >= 80) return 'var(--warning)';
    return 'var(--success)';
  };

  const alerts = budget?.alerts || [];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Budget Manager</h1>
          <p className="page-subtitle">Set limits, get alerts before you overspend</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="filter-select"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {getMonthName(i + 1)}
              </option>
            ))}
          </select>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
            ) : (
              <Save size={16} />
            )}
            Save Budget
          </button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 12, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            🔔 Budget Alerts
          </h3>
          {alerts.map((alert, idx) => (
            <div key={idx} className={`alert alert-${alert.type}`}>
              <span style={{ fontSize: '1.2rem' }}>
                {alert.type === 'danger' ? '🚨' : '⚠️'}
              </span>
              <div>
                <p className="alert-message">{alert.message}</p>
                <div style={{
                  marginTop: 6,
                  height: 4,
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: 999
                }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(alert.percentage, 100)}%`,
                    background: alert.type === 'danger' ? 'var(--danger)' : 'var(--warning)',
                    borderRadius: 999,
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Budget Settings */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Set Limits</h2>
          </div>

          {/* Total Budget */}
          <div style={{
            padding: '14px',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 16,
            border: '1px solid var(--border)'
          }}>
            <label style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              display: 'block',
              marginBottom: 6
            }}>
              💰 Total Monthly Budget
            </label>
            <input
              type="number"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
              placeholder="0"
              className="form-control"
              min="0"
            />
          </div>

          {/* Per Category */}
          {CATEGORIES.map(cat => (
            <div key={cat.value} className="budget-item">
              <div className="budget-header">
                <label className="budget-category" style={{ color: cat.color }}>
                  {cat.emoji} {cat.label}
                </label>
              </div>
              <input
                type="number"
                value={budgetInputs[cat.value] || ''}
                onChange={(e) => setBudgetInputs(prev => ({
                  ...prev,
                  [cat.value]: e.target.value
                }))}
                placeholder="No limit"
                className="form-control"
                min="0"
                style={{ fontSize: '0.875rem' }}
              />
            </div>
          ))}
        </div>

        {/* Budget Status */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">This Month's Status</h2>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {getMonthName(selectedMonth)} {selectedYear}
            </span>
          </div>

          {/* Overall */}
          {budget && budget.totalLimit > 0 && (
            <div style={{
              padding: '16px',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 16
            }}>
              <div className="budget-header">
                <span style={{ fontWeight: 600 }}>Overall Budget</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {formatCurrency(budget.totalSpent, currency)} / {formatCurrency(budget.totalLimit, currency)}
                </span>
              </div>
              <div className="progress-bar" style={{ height: 10 }}>
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min(budget.totalPercentage, 100)}%`,
                    background: getProgressColor(budget.totalPercentage)
                  }}
                />
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>
                {budget.totalPercentage}% used • {formatCurrency(budget.totalRemaining, currency)} remaining
              </p>
            </div>
          )}

          {/* Per Category Status */}
          {budget?.categoryBudgets && CATEGORIES.map(cat => {
            const status = budget.categoryBudgets[cat.value];
            if (!status || status.limit === 0) return null;

            return (
              <div key={cat.value} className="budget-item">
                <div className="budget-header">
                  <div className="budget-category">
                    <span>{cat.emoji}</span>
                    <span style={{ color: cat.color }}>{cat.label}</span>
                    {status.isExceeded && (
                      <AlertTriangle size={14} style={{ color: 'var(--danger)' }} />
                    )}
                    {!status.isExceeded && status.percentage < 80 && status.limit > 0 && (
                      <CheckCircle size={14} style={{ color: 'var(--success)' }} />
                    )}
                  </div>
                  <div className="budget-amounts">
                    {formatCurrency(status.spent, currency)} / {formatCurrency(status.limit, currency)}
                  </div>
                </div>

                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min(status.percentage, 100)}%`,
                      background: getProgressColor(status.percentage)
                    }}
                  />
                </div>

                <p style={{
                  fontSize: '0.75rem',
                  marginTop: 4,
                  color: status.isExceeded ? 'var(--danger)' : 'var(--text-muted)'
                }}>
                  {status.isExceeded
                    ? `Over budget by ${formatCurrency(Math.abs(status.remaining), currency)}`
                    : `${status.percentage}% • ${formatCurrency(status.remaining, currency)} left`
                  }
                </p>
              </div>
            );
          })}

          {(!budget?.categoryBudgets || Object.values(budget.categoryBudgets).every(s => s.limit === 0)) && (
            <div className="empty-state" style={{ padding: 30 }}>
              <TrendingUp size={32} style={{ color: 'var(--text-muted)', marginBottom: 8 }} />
              <p style={{ fontSize: '0.875rem' }}>
                Set budget limits on the left to see your spending status here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetManager;