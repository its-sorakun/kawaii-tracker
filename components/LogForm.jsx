import React, { useState } from 'react';
import CustomDatePicker from './CustomDatePicker.jsx';

const LogForm = ({ onAdd }) => {
    const [foodName, setFoodName] = useState('');
    const [calories, setCalories] = useState('');
    const [dateTimestamp, setDateTimestamp] = useState(() => {
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        return (new Date(now - offset)).toISOString().slice(0, 16);
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!foodName || !calories || !dateTimestamp) return;

        const newLog = {
            id: crypto.randomUUID(),
            food: foodName,
            calories: Number(calories),
            date: dateTimestamp
        };

        onAdd(newLog);
        setFoodName('');
        setCalories('');
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
            <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Food Item</label>
                <input 
                    type="text" 
                    required 
                    value={foodName} 
                    onChange={e => setFoodName(e.target.value)}
                    className="w-full bg-white dark:bg-[#1c1b1f] border border-gray-200 dark:border-gray-800 rounded-2xl px-5 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-shadow"
                    placeholder="e.g. Avocado Toast"
                />
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Calories</label>
                <input 
                    type="number" 
                    required 
                    min="0"
                    value={calories} 
                    onChange={e => setCalories(e.target.value)}
                    className="w-full bg-white dark:bg-[#1c1b1f] border border-gray-200 dark:border-gray-800 rounded-2xl px-5 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-shadow"
                    placeholder="kcal"
                />
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Date & Time</label>
                <CustomDatePicker 
                    value={dateTimestamp}
                    onChange={setDateTimestamp}
                />
            </div>
            <button type="submit" className="mt-4 w-full bg-indigo-600 text-white font-semibold text-lg py-4 rounded-2xl hover:bg-indigo-700 hover:shadow-md transition-all active:scale-[0.98]">
                Add to Log
            </button>
        </form>
    );
};

export default LogForm;
