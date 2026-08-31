import React, { useMemo } from 'react';
import Card from '../components/Card.jsx';
import Icon from '../components/Icon.jsx';

const HistoryPage = ({ logs, onDeleteLog }) => {
    // Algorithmic Grouping: Organize raw logs into discrete calendar days
    const groupedLogs = useMemo(() => {
        const groups = {};
        
        logs.forEach(log => {
            const dateObj = new Date(log.date);
            // Mechanical date string for grouping (e.g. "Monday, August 31, 2026")
            const dateKey = dateObj.toLocaleDateString(undefined, { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
            });
            
            if (!groups[dateKey]) {
                groups[dateKey] = {
                    dateLabel: dateKey,
                    totalCalories: 0,
                    entries: []
                };
            }
            
            groups[dateKey].totalCalories += Number(log.calories);
            groups[dateKey].entries.push(log);
        });
        
        return Object.values(groups);
    }, [logs]);

    // Mechanical logic to determine the environmental state of the log
    const getTimeIcon = (hour) => {
        if (hour >= 5 && hour < 12) return 'sunrise';
        if (hour >= 12 && hour < 17) return 'sun';
        if (hour >= 17 && hour < 21) return 'sunset';
        return 'moon';
    };

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 animate-fade-in pb-12">
            <header>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Event Timeline</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">A mechanical sequence of your caloric intake.</p>
            </header>

            {groupedLogs.length === 0 ? (
                <Card className="text-center py-16">
                    <Icon name="database" className="mx-auto text-gray-300 dark:text-gray-700 mb-4" size={48} />
                    <p className="text-gray-500 font-medium">No records found.</p>
                    <p className="text-sm opacity-60 mt-1">Begin logging to construct your timeline.</p>
                </Card>
            ) : (
                <div className="flex flex-col gap-10">
                    {groupedLogs.map((group, groupIndex) => (
                        <div key={groupIndex} className="relative">
                            
                            {/* Sticky Date Header with Aggregation */}
                            <div className="sticky top-20 z-10 bg-gray-50/90 dark:bg-[#141218]/90 backdrop-blur-md py-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 mb-6">
                                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                    {group.dateLabel}
                                </h2>
                                <div className="flex items-center gap-2 bg-indigo-100 text-indigo-900 dark:bg-indigo-900/30 dark:text-indigo-200 px-3 py-1 rounded-full text-sm font-semibold">
                                    <Icon name="activity" size={14} />
                                    <span className="font-mono">{group.totalCalories}</span> kcal
                                </div>
                            </div>

                            {/* Vertical Timeline Rail */}
                            <div className="border-l-2 border-indigo-100 dark:border-indigo-900/40 ml-4 md:ml-6 pl-6 md:pl-8 flex flex-col gap-6 relative">
                                {group.entries.map((log) => {
                                    const logDate = new Date(log.date);
                                    const timeString = logDate.toLocaleTimeString(undefined, { 
                                        hour: '2-digit', minute: '2-digit' 
                                    });
                                    const hour = logDate.getHours();
                                    const timeIcon = getTimeIcon(hour);

                                    return (
                                        <Card key={log.id} className="relative !p-5 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group">
                                            
                                            {/* Timeline Node (The dot on the line) */}
                                            <div className="absolute -left-[35px] md:-left-[43px] top-1/2 -translate-y-1/2 w-4 h-4 bg-gray-50 dark:bg-[#141218] border-2 border-indigo-400 dark:border-indigo-600 rounded-full group-hover:bg-indigo-500 transition-colors z-0"></div>
                                            
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                
                                                {/* Left side: Metadata & Food */}
                                                <div className="flex items-start gap-4">
                                                    <div className="bg-gray-100 dark:bg-[#1c1b1f] p-2.5 rounded-xl text-gray-500 dark:text-gray-400 mt-1 sm:mt-0">
                                                        <Icon name={timeIcon} size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
                                                            {timeString}
                                                        </div>
                                                        <div className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                                                            {log.food}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right side: Calories & Action */}
                                                <div className="flex items-center gap-6 justify-between sm:justify-end">
                                                    <div className="text-right">
                                                        <span className="text-2xl font-mono font-bold text-gray-900 dark:text-white">
                                                            {log.calories}
                                                        </span>
                                                        <span className="text-sm text-gray-500 ml-1">kcal</span>
                                                    </div>
                                                    <button 
                                                        onClick={() => onDeleteLog(log.id)}
                                                        className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                                        title="Delete Entry"
                                                    >
                                                        <Icon name="trash-2" size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HistoryPage;
