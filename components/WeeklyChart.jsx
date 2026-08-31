const WeeklyChart = ({ logs, theme }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (!chartRef.current) return;

        const ctx = chartRef.current.getContext('2d');
        const days = getLast7Days(); // From utils/dateUtils.js
        
        const dataMap = {};
        days.forEach(d => dataMap[d] = 0);
        
        logs.forEach(log => {
            const day = log.date.split('T')[0];
            if (dataMap[day] !== undefined) {
                dataMap[day] += Number(log.calories);
            }
        });

        const dataPoints = days.map(d => dataMap[d]);

        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const textColor = theme === 'dark' ? '#cbd5e1' : '#475569';
        const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

        chartInstance.current = new window.Chart(ctx, {
            type: 'bar',
            data: {
                labels: days.map(d => {
                    const dateObj = new Date(d);
                    return dateObj.toLocaleDateString(undefined, { weekday: 'short' });
                }),
                datasets: [{
                    label: 'Calories',
                    data: dataPoints,
                    backgroundColor: theme === 'dark' ? '#818cf8' : '#6366f1',
                    borderRadius: 8,
                    borderSkipped: false,
                }]
            },
            options: {
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
            }
        });

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [logs, theme]);

    return (
        <Card className="h-80 flex flex-col">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Icon name="bar-chart-2" className="text-indigo-500" />
                Weekly Overview
            </h2>
            <div className="flex-1 relative w-full">
                <canvas ref={chartRef}></canvas>
            </div>
        </Card>
    );
};
