import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import Card from './Card.jsx';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const WeeklyMacroChart = ({ logs, theme, profile }) => {
    // Generate the last 12 Mondays (00:00:00 local time)
    const weeks = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    // Find the most recent Monday
    const currentDay = now.getDay() || 7; // Sunday is 0 -> 7
    const currentMonday = new Date(now);
    currentMonday.setDate(now.getDate() - currentDay + 1);
    
    // Build array of the last 12 Mondays (oldest to newest)
    for (let i = 11; i >= 0; i--) {
        const monday = new Date(currentMonday);
        monday.setDate(monday.getDate() - (i * 7));
        weeks.push(monday);
    }

    // Initialize data map for the 12 weeks
    const dataMap = weeks.map(() => 0);

    // Aggregate logs into weeks
    logs.forEach(log => {
        const logDate = new Date(log.date);
        logDate.setHours(0, 0, 0, 0);
        
        // Find which week this log belongs to
        for (let i = 0; i < weeks.length; i++) {
            const weekStart = weeks[i];
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 7);
            
            if (logDate >= weekStart && logDate < weekEnd) {
                dataMap[i] += Number(log.calories);
                break;
            }
        }
    });

    const labels = weeks.map(monday => {
        return monday.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    });

    // Calculate Weekly BMR (Mifflin-St Jeor * 7)
    let weeklyBMR = null;
    if (profile && profile.weight && profile.height && profile.age) {
        const w = Number(profile.weight);
        const h = Number(profile.height);
        const a = Number(profile.age);
        let dailyBMR = 0;
        if (profile.gender === 'female') {
            dailyBMR = Math.round((10 * w) + (6.25 * h) - (5 * a) - 161);
        } else {
            dailyBMR = Math.round((10 * w) + (6.25 * h) - (5 * a) + 5);
        }
        weeklyBMR = dailyBMR * 7;
    }

    const textColor = theme === 'dark' ? '#cbd5e1' : '#475569';
    const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
    const barColor = theme === 'dark' ? 'rgba(129, 140, 248, 0.8)' : 'rgba(99, 102, 241, 0.8)';
    const bmrColor = theme === 'dark' ? '#10b981' : '#059669'; // Emerald

    const datasets = [
        {
            type: 'bar',
            label: 'Total Calories',
            data: dataMap,
            backgroundColor: barColor,
            borderRadius: 6,
            barPercentage: 0.6,
            order: 2
        }
    ];

    if (weeklyBMR) {
        datasets.push({
            type: 'line',
            label: 'Weekly BMR Target',
            data: weeks.map(() => weeklyBMR),
            borderColor: bmrColor,
            borderWidth: 3,
            borderDash: [6, 6],
            pointRadius: 0,
            pointHoverRadius: 0,
            fill: false,
            tension: 0,
            order: 1
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
            legend: { 
                display: true,
                position: 'top',
                labels: { color: textColor, usePointStyle: true, boxWidth: 8 }
            },
            tooltip: {
                backgroundColor: theme === 'dark' ? '#1c1b1f' : '#ffffff',
                titleColor: theme === 'dark' ? '#ffffff' : '#000000',
                bodyColor: theme === 'dark' ? '#cbd5e1' : '#475569',
                borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                borderWidth: 1,
                padding: 12,
                callbacks: {
                    title: function(context) {
                        return `Week of ${context[0].label}`;
                    },
                    label: function(context) {
                        return `${context.dataset.label}: ${context.parsed.y.toLocaleString()} kcal`;
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
            <header className="mb-6">
                <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">12-Week Macro Trend</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total caloric intake per calendar week. Week starts on Monday.</p>
            </header>
            <div className="flex-1 relative w-full">
                <Chart type="bar" data={data} options={options} />
            </div>
        </Card>
    );
};

export default WeeklyMacroChart;
