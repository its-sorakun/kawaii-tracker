import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import Card from './Card.jsx';
import Icon from './Icon.jsx';
import { getLast7Days } from '../utils/dateUtils.js';

// Register Chart.js components natively instead of global script tags
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip
);

const WeeklyChart = ({ logs, theme }) => {
    const days = getLast7Days();
    
    const dataMap = {};
    days.forEach(d => dataMap[d] = 0);
    
    logs.forEach(log => {
        const day = log.date.split('T')[0];
        if (dataMap[day] !== undefined) {
            dataMap[day] += Number(log.calories);
        }
    });

    const dataPoints = days.map(d => dataMap[d]);

    const textColor = theme === 'dark' ? '#cbd5e1' : '#475569';
    const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

    const data = {
        labels: days.map(d => new Date(d).toLocaleDateString(undefined, { weekday: 'short' })),
        datasets: [{
            label: 'Calories',
            data: dataPoints,
            backgroundColor: theme === 'dark' ? '#818cf8' : '#6366f1',
            borderRadius: 8,
            borderSkipped: false,
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: gridColor },
                ticks: { color: textColor }
            },
            x: {
                grid: { display: false },
                ticks: { color: textColor }
            }
        }
    };

    return (
        <Card className="h-80 flex flex-col">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Icon name="bar-chart-2" className="text-indigo-500" />
                Weekly Overview
            </h2>
            <div className="flex-1 relative w-full">
                <Bar data={data} options={options} />
            </div>
        </Card>
    );
};

export default WeeklyChart;
