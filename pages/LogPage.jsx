import React from 'react';
import LogForm from '../components/LogForm.jsx';
import Profile from '../components/Profile.jsx';
import SyncCard from '../components/SyncCard.jsx';
import Icon from '../components/Icon.jsx';

const LogPage = ({ 
    onAddLog, 
    profile, 
    setProfile, 
    onDownloadJSON,
    syncProps
}) => {
    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 animate-fade-in">
            <header className="flex justify-between items-end mb-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Log Entry</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Record your meals and manage your data.</p>
                </div>
                <button 
                    onClick={onDownloadJSON}
                    className="p-3 rounded-2xl bg-white dark:bg-[#1c1b1f] border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#2c2a2e] transition-colors flex items-center gap-2"
                    title="Export JSON Fallback"
                >
                    <Icon name="download" />
                    <span className="hidden sm:inline font-medium">Export Data</span>
                </button>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-8">
                    <LogForm onAdd={onAddLog} />
                </div>
                <div className="flex flex-col gap-8">
                    <SyncCard {...syncProps} />
                    <Profile profile={profile} setProfile={setProfile} />
                </div>
            </div>
        </div>
    );
};

export default LogPage;
