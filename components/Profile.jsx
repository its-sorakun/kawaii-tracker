import React, { useState, useEffect } from 'react';
import Card from './Card.jsx';
import Icon from './Icon.jsx';

const Profile = ({ profile, setProfile }) => {
    // Keep a local copy of the profile state so we don't trigger app-wide re-renders while typing
    const [localProfile, setLocalProfile] = useState(profile);
    const [isSaved, setIsSaved] = useState(false);

    // Sync local state if parent profile changes (e.g. from file load)
    useEffect(() => {
        setLocalProfile(profile);
    }, [profile]);

    const handleSave = () => {
        setProfile(localProfile);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    return (
        <Card>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Icon name="user" className="text-emerald-500" />
                    Profile & Biometrics
                </h2>
                <button 
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                    {isSaved ? <Icon name="check" size={16} /> : <Icon name="save" size={16} />}
                    {isSaved ? 'Saved' : 'Save'}
                </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1 opacity-70">Height (cm)</label>
                    <input 
                        type="number" 
                        value={localProfile.height || ''} 
                        onChange={e => setLocalProfile({...localProfile, height: e.target.value})}
                        className="w-full bg-gray-50 dark:bg-[#1c1b1f] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="180"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 opacity-70">Weight (kg)</label>
                    <input 
                        type="number" 
                        value={localProfile.weight || ''} 
                        onChange={e => setLocalProfile({...localProfile, weight: e.target.value})}
                        className="w-full bg-gray-50 dark:bg-[#1c1b1f] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="75"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 opacity-70">Age</label>
                    <input 
                        type="number" 
                        value={localProfile.age || ''} 
                        onChange={e => setLocalProfile({...localProfile, age: e.target.value})}
                        className="w-full bg-gray-50 dark:bg-[#1c1b1f] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="30"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 opacity-70">Gender</label>
                    <select 
                        value={localProfile.gender || 'male'} 
                        onChange={e => setLocalProfile({...localProfile, gender: e.target.value})}
                        className="w-full bg-gray-50 dark:bg-[#1c1b1f] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
                    >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </div>
            </div>
            <div className="mt-4 text-xs opacity-60">
                These metrics are used to calculate your Basal Metabolic Rate (BMR) goal on the Analytics page.
            </div>
        </Card>
    );
};

export default Profile;
