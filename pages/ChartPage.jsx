import React from 'react';
import WeeklyChart from '../components/WeeklyChart.jsx';
import TimeDistributionChart from '../components/TimeDistributionChart.jsx';
import TopFoodsChart from '../components/TopFoodsChart.jsx';

const ChartPage = ({ logs, theme, profile }) => {
    return (
        <div className="w-full h-[calc(100vh-8rem)] flex flex-col gap-6 animate-fade-in">
            <header>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Analytics Dashboard</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Mechanical breakdown of your caloric intake.</p>
            </header>
            
            {/* CSS Grid for the Dashboard Layout */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 grid-rows-[minmax(300px,_1fr)_minmax(250px,_auto)] gap-6">
                
                {/* Top Row: Weekly Curve (Spans all columns) */}
                <div className="md:col-span-3">
                    <WeeklyChart logs={logs} theme={theme} profile={profile} />
                </div>
                
                {/* Bottom Row: 2 specialized charts */}
                <div className="md:col-span-1 h-full">
                    <TimeDistributionChart logs={logs} theme={theme} />
                </div>
                
                <div className="md:col-span-2 h-full">
                    <TopFoodsChart logs={logs} theme={theme} />
                </div>
                
            </div>
        </div>
    );
};

export default ChartPage;
