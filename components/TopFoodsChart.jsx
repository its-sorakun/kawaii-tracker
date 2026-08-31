import React, { useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import Card from './Card.jsx';
import Icon from './Icon.jsx';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const TopFoodsChart = ({ logs, theme }) => {
    // Process logs to aggregate calories by food name (case-insensitive)
    const topFoods = useMemo(() => {
        const foodMap = {};
        logs.forEach(log => {
            // Basic normalization: trim and lowercase
            const name = log.food.trim().toLowerCase();
            if (!foodMap[name]) foodMap[name] = 0;
            foodMap[name] += log.calories;
        });

        // Convert to array, sort by calories (descending), and take top 5
        const sorted = Object.entries(foodMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        // Capitalize first letter for display
        return sorted.map(([name, cal]) => {
            const displayName = name.charAt(0).toUpperCase() + name.slice(1);
            return { name: displayName, calories: cal };
        });
    }, [logs]);

    const data = {
        labels: topFoods.map(f => f.name),
        datasets: [
            {
                label: 'Calories',
                data: topFoods.map(f => f.calories),
                backgroundColor: theme === 'dark' ? '#f43f5e' : '#e11d48', // Rose color
                borderRadius: 6,
                barThickness: 16
            },
        ],
    };

    const textColor = theme === 'dark' ? '#cbd5e1' : '#475569';
    const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

    const options = {
        indexAxis: 'y', // Makes it a horizontal bar chart
        responsive: true,
        maintainAspectRatio: false,
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
                        return `${context.raw} kcal total`;
                    }
                }
            }
        },
        scales: {
            x: {
                beginAtZero: true,
                grid: { 
                    color: gridColor,
                    drawBorder: false,
                    borderDash: [4, 4]
                },
                ticks: { color: textColor, padding: 8 }
            },
            y: {
                grid: { display: false, drawBorder: false },
                ticks: { 
                    color: textColor, 
                    padding: 8,
                    font: { weight: '500' }
                }
            }
        }
    };

    return (
        <Card className="h-full flex flex-col p-6">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Icon name="pie-chart" size={16} className="text-rose-500" />
                Top Caloric Contributors
            </h3>
            
            {topFoods.length === 0 ? (
                <div className="flex-1 flex items-center justify-center opacity-50 text-sm">No data available</div>
            ) : (
                <div className="flex-1 relative w-full">
                    <Bar data={data} options={options} />
                </div>
            )}
        </Card>
    );
};

export default TopFoodsChart;
