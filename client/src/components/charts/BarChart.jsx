import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend
} from 'chart.js';
import { MONTHS } from '../../utils/constants';
import { formatCurrency } from '../../utils/helpers';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = ({ data, type = 'monthly', currency = 'INR' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="empty-state" style={{ padding: 40 }}>
        <div className="empty-state-emoji">📈</div>
        <p>No data for this period</p>
      </div>
    );
  }

  // Monthly bar chart (by month)
  const isYearly = type === 'yearly';

  const labels = isYearly
    ? data.map(d => MONTHS[d.month - 1].slice(0, 3))
    : data.map(d => `Day ${d.day}`);

  const values = data.map(d => d.total);

  const chartData = {
    labels,
    datasets: [{
      label: isYearly ? 'Monthly Spend' : 'Daily Spend',
      data: values,
      backgroundColor: 'rgba(99, 102, 241, 0.7)',
      borderColor: 'rgba(99, 102, 241, 1)',
      borderWidth: 2,
      borderRadius: 6,
      borderSkipped: false,
      hoverBackgroundColor: 'rgba(139, 92, 246, 0.8)'
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a1a2e',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        padding: 12,
        callbacks: {
          label: (context) => ` ${formatCurrency(context.parsed.y, currency)}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { size: 11 } },
        border: { display: false }
      },
      y: {
        grid: {
          color: 'rgba(255,255,255,0.05)',
          drawBorder: false
        },
        ticks: {
          color: '#64748b',
          font: { size: 11 },
          callback: (value) => formatCurrency(value, currency)
        },
        border: { display: false }
      }
    }
  };

  return (
    <div className="chart-container">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default BarChart;