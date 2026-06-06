import React, { useEffect, useState } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, Receipt } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, getCurrentMonthYear, getMonthName } from '../../utils/helpers';
import { CATEGORIES } from '../../utils/constants';
import PieChart from '../charts/PieChart';
import BarChart from '../charts/BarChart';
import { expenseService } from '../../services/expenseService';

const Dashboard = ({ onAddExpense }) => {
  const { user } = useAuth();
  const { budget, fetchBudget, fetchSummary, summary } = useExpenses();
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [yearlySummary, setYearlySummary] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { month, year } = getCurrentMonthYear();
  const currency = user?.currency || 'INR';

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchSummary(month, year),
          fetchBudget(month, year)
        ]);

        // Recent expenses
        const expData = await expenseService.getAll({ limit: 5, sortBy: 'date', sortOrder: 'desc' });
        setRecentExpenses(expData.expenses || []);

        // Yearly data
        const yearData = await expenseService.getYearlySummary({ year });
        setYearlySummary(yearData.data?.monthlyBreakdown || []);
      } catch (err) {
        console.error('Dashboard load error:', err);
      }
      setIsLoading(false);
    };

    loadDashboard();
  }, []);

  const totalSpent = summary?.totalSpent || 0;
  const totalBudget = budget?.totalLimit || 0;
  const budgetRemaining = Math.max(0, totalBudget - totalSpent);
  const budgetUsedPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  // Top category
  const topCategory = summary?.categoryBreakdown?.[0];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Hey {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="page-subtitle">
            {getMonthName(month)} {year} spending overview
          </p>
        </div>
        <button className="btn btn-primary" onClick={onAddExpense}>
          <Plus size={18} />
          Add Expense
        </button>
      </div>

      {/* Budget Alerts */}
      {budget?.alerts?.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          {budget.alerts.slice(0, 2).map((alert, idx) => (
            <div key={idx} className={`alert alert-${alert.type}`} style={{ marginBottom: 8 }}>
              <span>{alert.type === 'danger' ? '🚨' : '⚠️'}</span>
              <p className="alert-message">{alert.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)' }}>
            <TrendingDown size={20} />
          </div>
          <div className="stat-value">{formatCurrency(totalSpent, currency)}</div>
          <div className="stat-label">Spent This Month</div>
          <div className="stat-change negative">
            {summary?.totalTransactions || 0} transactions
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(34,197,94,0.1)', color: 'var(--success)' }}>
            <DollarSign size={20} />
          </div>
          <div className="stat-value">{formatCurrency(budgetRemaining, currency)}</div>
          <div className="stat-label">Budget Remaining</div>
          <div className={`stat-change ${budgetUsedPct > 80 ? 'negative' : 'positive'}`}>
            {totalBudget > 0 ? `${budgetUsedPct}% used` : 'No budget set'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary)' }}>
            <Receipt size={20} />
          </div>
          <div className="stat-value">{formatCurrency(summary?.avgPerDay || 0, currency)}</div>
          <div className="stat-label">Daily Average</div>
          <div className="stat-change" style={{ color: 'var(--text-muted)' }}>
            this month
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.1)', color: 'var(--secondary)' }}>
            <TrendingUp size={20} />
          </div>
          <div className="stat-value">
            {topCategory
              ? CATEGORIES.find(c => c.value === topCategory.category)?.emoji || '📊'
              : '—'}
          </div>
          <div className="stat-label">Top Category</div>
          <div className="stat-change" style={{ color: 'var(--text-muted)' }}>
            {topCategory
              ? `${topCategory.category} — ${formatCurrency(topCategory.total, currency)}`
              : 'No data yet'
            }
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Spending by Category</h2>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              {getMonthName(month)}
            </span>
          </div>
          {isLoading ? (
            <div className="empty-state"><div className="spinner" /></div>
          ) : (
            <PieChart data={summary?.categoryBreakdown || []} currency={currency} />
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Monthly Trend</h2>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{year}</span>
          </div>
          {isLoading ? (
            <div className="empty-state"><div className="spinner" /></div>
          ) : (
            <BarChart data={yearlySummary} type="yearly" currency={currency} />
          )}
        </div>
      </div>

      {/* Recent Expenses + Budget Status */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Recent */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Expenses</h2>
          </div>

          {recentExpenses.length === 0 ? (
            <div className="empty-state" style={{ padding: 30 }}>
              <div className="empty-state-emoji">💸</div>
              <p>No expenses yet this month</p>
            </div>
          ) : (
            recentExpenses.map(expense => {
              const catInfo = CATEGORIES.find(c => c.value === expense.category);
              return (
                <div key={expense._id} className="expense-item">
                  <div className="expense-emoji" style={{ background: `${catInfo?.color}15` }}>
                    {catInfo?.emoji}
                  </div>
                  <div className="expense-info">
                    <div className="expense-title">{expense.title}</div>
                    <div className="expense-meta">
                      <span>{new Date(expense.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                      <span>•</span>
                      <span style={{ color: catInfo?.color }}>{catInfo?.label}</span>
                    </div>
                  </div>
                  <div className="expense-amount">
                    -{formatCurrency(expense.amount, currency)}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Budget Overview */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Budget Status</h2>
          </div>

          {totalBudget === 0 ? (
            <div className="empty-state" style={{ padding: 30 }}>
              <div className="empty-state-emoji">🎯</div>
              <p style={{ marginBottom: 12 }}>Set a budget to track your limits</p>
            </div>
          ) : (
            <>
              {/* Overall progress */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontWeight: 500 }}>Overall</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {formatCurrency(totalSpent, currency)} / {formatCurrency(totalBudget, currency)}
                  </span>
                </div>
                <div className="progress-bar" style={{ height: 10 }}>
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min(budgetUsedPct, 100)}%`,
                      background: budgetUsedPct >= 100 ? 'var(--danger)' :
                        budgetUsedPct >= 80 ? 'var(--warning)' : 'var(--success)'
                    }}
                  />
                </div>
              </div>

              {/* Category budgets */}
              {budget?.categoryBudgets && Object.entries(budget.categoryBudgets)
                .filter(([_, s]) => s.limit > 0)
                .slice(0, 4)
                .map(([cat, status]) => {
                  const catInfo = CATEGORIES.find(c => c.value === cat);
                  return (
                    <div key={cat} className="budget-item">
                      <div className="budget-header">
                        <span style={{ fontSize: '0.875rem', color: catInfo?.color }}>
                          {catInfo?.emoji} {catInfo?.label}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {status.percentage}%
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${Math.min(status.percentage, 100)}%`,
                            background: status.isExceeded ? 'var(--danger)' :
                              status.isWarning ? 'var(--warning)' : catInfo?.color
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;