import React, { useState } from 'react';
import Card from './Card.jsx';
import Icon from './Icon.jsx';

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
        <Card>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Icon name="plus-circle" className="text-indigo-500" />
                Log Entry
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1 opacity-70">Food Item</label>
                    <input 
                        type="text" 
                        required 
                        value={foodName} 
                        onChange={e => setFoodName(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g. Oatmeal & Berries"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 opacity-70">Calories</label>
                        <input 
                            type="number" 
                            required 
                            min="0"
                            value={calories} 
                            onChange={e => setCalories(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="kcal"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 opacity-70">Date & Time</label>
                        <input 
                            type="datetime-local" 
                            required 
                            value={dateTimestamp} 
                            onChange={e => setDateTimestamp(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>
                <button type="submit" className="mt-2 w-full bg-indigo-500 text-white font-medium py-3 rounded-xl hover:bg-indigo-600 transition-colors">
                    Add to Log
                </button>
            </form>
        </Card>
    );
};

export default LogForm;
