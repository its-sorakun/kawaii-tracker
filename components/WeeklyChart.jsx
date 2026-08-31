import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import Card from './Card.jsx';
import { getLast7Days } from '../utils/dateUtils.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
);

const WeeklyChart = ({ logs, theme, profile }) => {
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
    const labels = days.map(d => new Date(d).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }));

    // Calculate BMR (Mifflin-St Jeor)
    let bmr = null;
    if (profile && profile.weight && profile.height && profile.age) {
        const w = Number(profile.weight);
        const h = Number(profile.height);
        const a = Number(profile.age);
        if (profile.gender === 'female') {
            bmr = Math.round((10 * w) + (6.25 * h) - (5 * a) - 161);
        } else {
            bmr = Math.round((10 * w) + (6.25 * h) - (5 * a) + 5);
        }
    }

    const textColor = theme === 'dark' ? '#cbd5e1' : '#475569';
    const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
    const lineColor = theme === 'dark' ? '#818cf8' : '#6366f1';
    const bmrColor = theme === 'dark' ? '#10b981' : '#059669'; // Emerald

    const datasets = [
        {
            label: 'Calories',
            data: dataPoints,
            borderColor: lineColor,
            borderWidth: 4,
            pointBackgroundColor: theme === 'dark' ? '#141218' : '#ffffff',
            pointBorderColor: lineColor,
            pointBorderWidth: 3,
            pointRadius: 6,
            pointHoverRadius: 8,
            fill: true,
            tension: 0.4,
            backgroundColor: (context) => {
                const chart = context.chart;
                const { ctx, chartArea } = chart;
                if (!chartArea) return null;
                
                const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                if (theme === 'dark') {
                    gradient.addColorStop(0, 'rgba(129, 140, 248, 0.4)');
                    gradient.addColorStop(1, 'rgba(129, 140, 248, 0.0)');
                } else {
                    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
                    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');
                }
                return gradient;
            }
        }
    ];

    if (bmr) {
        datasets.push({
            label: 'BMR Goal',
            data: days.map(() => bmr),
            borderColor: bmrColor,
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
            pointHoverRadius: 0,
            fill: false,
            tension: 0,
            order: 2
        });
    }

    const data = { labels, datasets };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 1500,
            easing: 'easeOutQuart'
        },
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: theme === 'dark' ? '#1c1b1f' : '#ffffff',
                titleColor: theme === 'dark' ? '#ffffff' : '#000000',
                bodyColor: theme === 'dark' ? '#cbd5e1' : '#475569',
                borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                borderWidth: 1,
                padding: 12,
                displayColors: false,
                callbacks: {
                    label: function(context) {
                        return `${context.parsed.y} kcal`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { 
                    color: gridColor,
                    drawBorder: false,
                    borderDash: [5, 5]
                },
                ticks: { color: textColor, padding: 10 }
            },
            x: {
                grid: { display: false, drawBorder: false },
                ticks: { color: textColor, padding: 10 }
            }
        }
    };

    return (
        <Card className="h-full flex flex-col p-8">
            <div className="flex-1 relative w-full">
                <Line data={data} options={options} />
            </div>
        </Card>
    );
};

export default WeeklyChart;
