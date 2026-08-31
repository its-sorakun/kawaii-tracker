import React from 'react';
import WeeklyMacroChart from '../components/WeeklyMacroChart.jsx';
import DailyTimelineChart from '../components/DailyTimelineChart.jsx';
import TimeDistributionChart from '../components/TimeDistributionChart.jsx';
import TopFoodsChart from '../components/TopFoodsChart.jsx';

const ChartPage = ({ logs, theme, profile }) => {
    return (
        <div className="w-full min-h-[calc(100vh-8rem)] flex flex-col gap-6 animate-fade-in pb-12">
            <header>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Analytics Dashboard</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Macro trends and daily variance.</p>
            </header>
            
            {/* CSS Grid for the Dashboard Layout */}
            <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 grid-rows-auto gap-6">
                
                {/* Top Row: Weekly Macro (Full Width) */}
                <div className="xl:col-span-2 h-[400px]">
                    <WeeklyMacroChart logs={logs} theme={theme} profile={profile} />
                </div>
                
                {/* Middle Row: Daily Variance (Full Width) */}
                <div className="xl:col-span-2 h-[400px]">
                    <DailyTimelineChart logs={logs} theme={theme} profile={profile} />
                </div>
                
                {/* Bottom Row: 2 specialized charts */}
                <div className="h-[350px]">
                    <TopFoodsChart logs={logs} theme={theme} />
                </div>

                <div className="h-[350px]">
                    <TimeDistributionChart logs={logs} theme={theme} />
                </div>
                
            </div>
        </div>
    );
};

export default ChartPage;
