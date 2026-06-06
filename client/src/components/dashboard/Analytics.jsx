import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, getCurrentMonthYear, getMonthName } from '../../utils/helpers';
import { CATEGORIES } from '../../utils/constants';
import { expenseService } from '../../services/expenseService';
import PieChart from '../charts/PieChart';
import BarChart from '../charts/BarChart';

const Analytics = () => {
  const { user } = useAuth();
  const currency = user?.currency || 'INR';
  const { month, year } = getCurrentMonthYear();

  const [selectedMonth, setSelectedMonth] = useState(month);
  const [selectedYear, setSelectedYear] = useState(year);
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [yearlySummary, setYearlySummary] = useState(null);
  const [dailyData, setDailyData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [monthData, yearData] = await Promise.all([
          expenseService.getMonthlySummary({ month: selectedMonth, year: selectedYear }),
          expenseService.getYearlySummary({ year: selectedYear })
        ]);

        setMonthlySummary(monthData.data);
        setDailyData(monthData.data?.dailyBreakdown || []);
        setYearlySummary(yearData.data?.monthlyBreakdown || []);
      } catch (err) {
        console.error('Analytics error:', err);
      }
      setIsLoading(false);
    };

    loadData();
  }, [selectedMonth, selectedYear]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Deep dive into your spending patterns</p>
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
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="filter-select"
          >
            {[2023, 2024, 2025].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-value">{formatCurrency(monthlySummary?.totalSpent || 0, currency)}</div>
          <div className="stat-label">Total Spent</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{monthlySummary?.totalTransactions || 0}</div>
          <div className="stat-label">Transactions</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{formatCurrency(monthlySummary?.avgPerDay || 0, currency)}</div>
          <div className="stat-label">Avg. Per Day</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {formatCurrency(monthlySummary?.topExpense?.amount || 0, currency)}
          </div>
          <div className="stat-label">Largest Expense</div>
          <div className="stat-change" style={{ color: 'var(--text-muted)', marginTop: 4 }}>
            {monthlySummary?.topExpense?.title || '—'}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Category Breakdown</h2>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              {getMonthName(selectedMonth)} {selectedYear}
            </span>
          </div>
          {isLoading
            ? <div className="empty-state"><div className="spinner" /></div>
            : <PieChart data={monthlySummary?.categoryBreakdown || []} currency={currency} />
          }
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Daily Spending</h2>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              {getMonthName(selectedMonth)}
            </span>
          </div>
          {isLoading
            ? <div className="empty-state"><div className="spinner" /></div>
            : <BarChart data={dailyData} type="daily" currency={currency} />
          }
        </div>
      </div>

      {/* Yearly trend */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Year Overview — {selectedYear}</h2>
        </div>
        {isLoading
          ? <div className="empty-state"><div className="spinner" /></div>
          : <BarChart data={yearlySummary} type="yearly" currency={currency} />
        }
      </div>

      {/* Category Table */}
      {monthlySummary?.categoryBreakdown?.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-header">
            <h2 className="card-title">Category Details</h2>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                {['Category', 'Amount', 'Transactions', 'Avg/Transaction', 'Share'].map(h => (
                  <th key={h} style={{
                    padding: '10px 12px',
                    textAlign: 'left',
                    fontSize: '0.78rem',
                    color: 'var(--text-muted)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthlySummary.categoryBreakdown.map(item => {
                const catInfo = CATEGORIES.find(c => c.value === item.category);
                const share = ((item.total / monthlySummary.totalSpent) * 100).toFixed(1);
                return (
                  <tr
                    key={item.category}
                    style={{ borderBottom: '1px solid var(--border-light)' }}
                  >
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>{catInfo?.emoji}</span>
                        <span style={{ color: catInfo?.color, fontWeight: 500 }}>
                          {catInfo?.label}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 600 }}>
                      {formatCurrency(item.total, currency)}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                      {item.count}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                      {formatCurrency(item.avgAmount, currency)}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: 'var(--bg-secondary)', borderRadius: 3 }}>
                          <div style={{
                            width: `${share}%`,
                            height: '100%',
                            background: catInfo?.color,
                            borderRadius: 3
                          }} />
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', minWidth: 35 }}>
                          {share}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Analytics;