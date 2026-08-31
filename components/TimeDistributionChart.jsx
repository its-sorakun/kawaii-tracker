import React, { useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import Card from './Card.jsx';
import Icon from './Icon.jsx';

ChartJS.register(ArcElement, Tooltip, Legend);

const TimeDistributionChart = ({ logs, theme }) => {
    // Process logs to group by time of day
    const distribution = useMemo(() => {
        let morning = 0;   // 5:00 - 10:59
        let afternoon = 0; // 11:00 - 16:59
        let evening = 0;   // 17:00 - 21:59
        let night = 0;     // 22:00 - 4:59

        logs.forEach(log => {
            const date = new Date(log.date);
            const hour = date.getHours();

            if (hour >= 5 && hour < 11) morning += log.calories;
            else if (hour >= 11 && hour < 17) afternoon += log.calories;
            else if (hour >= 17 && hour < 22) evening += log.calories;
            else night += log.calories;
        });

        return [morning, afternoon, evening, night];
    }, [logs]);

    const data = {
        labels: ['Morning', 'Afternoon', 'Evening', 'Night'],
        datasets: [
            {
                data: distribution,
                backgroundColor: [
                    '#fcd34d', // Amber (Morning)
                    '#fb923c', // Orange (Afternoon)
                    '#818cf8', // Indigo (Evening)
                    '#64748b', // Slate (Night)
                ],
                borderColor: theme === 'dark' ? '#141218' : '#ffffff',
                borderWidth: 4,
                hoverOffset: 10
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    color: theme === 'dark' ? '#cbd5e1' : '#475569',
                    font: { size: 12, family: 'system-ui' },
                    usePointStyle: true,
                    padding: 20
                }
            },
            tooltip: {
                backgroundColor: theme === 'dark' ? '#1c1b1f' : '#ffffff',
                titleColor: theme === 'dark' ? '#ffffff' : '#000000',
                bodyColor: theme === 'dark' ? '#cbd5e1' : '#475569',
                borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                borderWidth: 1,
                padding: 12,
                callbacks: {
                    label: function(context) {
                        return ` ${context.label}: ${context.raw} kcal`;
                    }
                }
            }
        }
    };

    const totalCalculated = distribution.reduce((a, b) => a + b, 0);

    return (
        <Card className="h-full flex flex-col p-6 relative">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Icon name="clock" size={16} className="text-amber-500" />
                Time of Day
            </h3>
            
            {totalCalculated === 0 ? (
                <div className="flex-1 flex items-center justify-center opacity-50 text-sm">No data available</div>
            ) : (
                <div className="flex-1 relative w-full mt-4">
                    <Doughnut data={data} options={options} />
                    {/* Inner Center Text */}
                    <div className="absolute inset-0 flex items-center justify-center pr-[120px] pointer-events-none">
                        <div className="text-center">
                            <span className="block text-2xl font-bold text-gray-900 dark:text-white leading-none">
                                {totalCalculated}
                            </span>
                            <span className="text-xs opacity-60">Total kcal</span>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default TimeDistributionChart;
