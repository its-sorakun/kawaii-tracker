import React from 'react';
import Card from './Card.jsx';
import Icon from './Icon.jsx';

const Profile = ({ profile, setProfile }) => {
    return (
        <Card>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Icon name="user" className="text-emerald-500" />
                Profile & Biometrics
            </h2>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1 opacity-70">Height (cm)</label>
                    <input 
                        type="number" 
                        value={profile.height || ''} 
                        onChange={e => setProfile({...profile, height: e.target.value})}
                        className="w-full bg-gray-50 dark:bg-[#1c1b1f] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="180"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 opacity-70">Weight (kg)</label>
                    <input 
                        type="number" 
                        value={profile.weight || ''} 
                        onChange={e => setProfile({...profile, weight: e.target.value})}
                        className="w-full bg-gray-50 dark:bg-[#1c1b1f] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="75"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 opacity-70">Age</label>
                    <input 
                        type="number" 
                        value={profile.age || ''} 
                        onChange={e => setProfile({...profile, age: e.target.value})}
                        className="w-full bg-gray-50 dark:bg-[#1c1b1f] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="30"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 opacity-70">Gender</label>
                    <select 
                        value={profile.gender || 'male'} 
                        onChange={e => setProfile({...profile, gender: e.target.value})}
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
