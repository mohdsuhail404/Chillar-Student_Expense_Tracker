import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { CATEGORIES } from '../../utils/constants';
import { formatCurrency } from '../../utils/helpers';

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ data, currency = 'INR' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="empty-state" style={{ padding: 40 }}>
        <div className="empty-state-emoji">📊</div>
        <p>No data for this period</p>
      </div>
    );
  }

  const chartData = {
    labels: data.map(item => {
      const cat = CATEGORIES.find(c => c.value === item.category);
      return `${cat?.emoji || ''} ${cat?.label || item.category}`;
    }),
    datasets: [{
      data: data.map(item => item.total),
      backgroundColor: data.map(item => {
        const cat = CATEGORIES.find(c => c.value === item.category);
        return cat ? `${cat.color}CC` : '#C9CBCF';
      }),
      borderColor: data.map(item => {
        const cat = CATEGORIES.find(c => c.value === item.category);
        return cat?.color || '#C9CBCF';
      }),
      borderWidth: 2,
      hoverBorderWidth: 3,
      hoverOffset: 8
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#94a3b8',
          padding: 16,
          font: { size: 12, family: 'Inter' },
          usePointStyle: true,
          pointStyleWidth: 10
        }
      },
      tooltip: {
        backgroundColor: '#1a1a2e',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        padding: 12,
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return ` ${formatCurrency(context.parsed, currency)} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="chart-container">
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default PieChart;