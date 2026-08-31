import React from 'react';
import Card from '../components/Card.jsx';
import Icon from '../components/Icon.jsx';
import SyncCard from '../components/SyncCard.jsx';
import Profile from '../components/Profile.jsx';

const SettingsPage = ({ profile, setProfile, syncProps, onDownloadJSON }) => {
    return (
        <div className="w-full animate-fade-in font-sans">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Settings</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your biometrics, local sync, and data.</p>
                </div>
                
                <button 
                    onClick={onDownloadJSON}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1c1b1f] border border-gray-200 dark:border-gray-800 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors shadow-sm text-gray-700 dark:text-gray-200 text-sm font-medium"
                >
                    <Icon name="download" size={16} /> Export Data
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {/* System Management */}
                <div className="flex flex-col gap-6">
                    <SyncCard {...syncProps} />
                </div>

                {/* Biometrics */}
                <div className="flex flex-col gap-6">
                    <Profile profile={profile} setProfile={setProfile} />
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
