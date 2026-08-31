import React, { useState, useEffect } from 'react';
import CustomDatePicker from '../components/CustomDatePicker.jsx';
import PlannerEditor from '../components/PlannerEditor.jsx';
import Icon from '../components/Icon.jsx';

const PlannerPage = ({ plannerNotes, onUpdatePlanner }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    
    // Mechanically format date to local YYYY-MM-DD
    const offset = selectedDate.getTimezoneOffset() * 60000;
    const dateKey = (new Date(selectedDate - offset)).toISOString().split('T')[0];
    
    const [blocks, setBlocks] = useState([]);

    useEffect(() => {
        const currentData = plannerNotes[dateKey];
        
        if (typeof currentData === 'string') {
            // Data Migration: Convert old string data to new Block array
            const lines = currentData.split('\n');
            const migratedBlocks = lines.map(line => {
                const id = Math.random().toString(36).substring(2, 9);
                if (line.startsWith('- [ ] ')) {
                    return { id, type: 'checkbox', content: line.substring(6), checked: false };
                } else if (line.startsWith('- [x] ') || line.startsWith('- [X] ')) {
                    return { id, type: 'checkbox', content: line.substring(6), checked: true };
                } else if (line.startsWith('- ')) {
                    return { id, type: 'bullet', content: line.substring(2) };
                } else {
                    return { id, type: 'paragraph', content: line };
                }
            });
            setBlocks(migratedBlocks);
        } else if (Array.isArray(currentData)) {
            setBlocks(currentData);
        } else {
            setBlocks([]);
        }
    }, [dateKey, plannerNotes]);

    const handleBlocksChange = (newBlocks) => {
        setBlocks(newBlocks);
        
        // Remove empty paragraphs to clean up storage if the whole page is blank
        const isBlank = newBlocks.length === 1 && newBlocks[0].content.trim() === '' && newBlocks[0].type === 'paragraph';
        if (isBlank) {
            onUpdatePlanner(dateKey, ''); // Will trigger the delete logic in app.jsx
        } else {
            onUpdatePlanner(dateKey, newBlocks);
        }
    };

    const handleAddBlock = (type) => {
        const id = Math.random().toString(36).substring(2, 9);
        handleBlocksChange([...blocks, { id, type, content: '' }]);
    };

    return (
        <div className="w-full h-full min-h-[calc(100vh-120px)] flex flex-col gap-6 animate-fade-in font-sans">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Planner</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Jot down your meal ideas and schedule.</p>
                </div>
                <div className="w-full md:w-auto self-start">
                    <CustomDatePicker selectedDate={selectedDate} onChange={setSelectedDate} dropdownPosition="bottom-right" />
                </div>
            </header>

            <div className="flex-1 bg-white dark:bg-[#1c1b1f] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden flex flex-col transition-all">
                <PlannerEditor blocks={blocks} onChange={handleBlocksChange} />
            </div>
        </div>
    );
};

export default PlannerPage;
