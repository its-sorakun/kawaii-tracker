import React, { useState, useRef, useEffect } from 'react';
import Icon from './Icon.jsx';

// Raw Date math: calculate how many days a month has, accounting for leap years.
// new Date(year, month+1, 0) gives the last day of 'month' (0-indexed months).
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

// Which weekday the 1st of a given month falls on (0=Sun, 6=Sat).
// Shift so Monday=0 for a Mon-start grid.
const getFirstDayOfWeek = (year, month) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // shift Sunday from 0 to 6
};

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const CustomDatePicker = ({ value, onChange, dropdownPosition = 'right' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Parse the incoming datetime-local string (e.g. "2026-08-31T11:17")
    const parseValue = (val) => {
        if (!val) {
            const now = new Date();
            return {
                year: now.getFullYear(),
                month: now.getMonth(),
                day: now.getDate(),
                hours: now.getHours(),
                minutes: now.getMinutes()
            };
        }
        const d = new Date(val);
        return {
            year: d.getFullYear(),
            month: d.getMonth(),
            day: d.getDate(),
            hours: d.getHours(),
            minutes: d.getMinutes()
        };
    };

    const parsed = parseValue(value);
    const [viewYear, setViewYear] = useState(parsed.year);
    const [viewMonth, setViewMonth] = useState(parsed.month);

    // Emit the onChange as a datetime-local compatible string
    const emitChange = (year, month, day, hours, minutes) => {
        const pad = (n) => String(n).padStart(2, '0');
        const str = `${year}-${pad(month + 1)}-${pad(day)}T${pad(hours)}:${pad(minutes)}`;
        onChange(str);
    };

    // Click-outside dismissal: register a mousedown listener on the document
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const prevMonth = () => {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear(viewYear - 1);
        } else {
            setViewMonth(viewMonth - 1);
        }
    };

    const nextMonth = () => {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear(viewYear + 1);
        } else {
            setViewMonth(viewMonth + 1);
        }
    };

    const selectDay = (day) => {
        emitChange(viewYear, viewMonth, day, parsed.hours, parsed.minutes);
    };

    const setHours = (h) => {
        const clamped = Math.max(0, Math.min(23, h));
        emitChange(parsed.year, parsed.month, parsed.day, clamped, parsed.minutes);
    };

    const setMinutes = (m) => {
        const clamped = Math.max(0, Math.min(59, m));
        emitChange(parsed.year, parsed.month, parsed.day, parsed.hours, clamped);
    };

    const selectToday = () => {
        const now = new Date();
        onChange(now);
    };

    // Build the calendar grid cells
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfWeek(viewYear, viewMonth);
    const calendarCells = [];

    // Leading empty cells for days before the 1st
    for (let i = 0; i < firstDay; i++) {
        calendarCells.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
        calendarCells.push(d);
    }

    const isSelected = (day) => {
        return day === parsed.day && viewMonth === parsed.month && viewYear === parsed.year;
    };

    const isToday = (day) => {
        const now = new Date();
        return day === now.getDate() && viewMonth === now.getMonth() && viewYear === now.getFullYear();
    };

    // Format the display string
    const pad = (n) => String(n).padStart(2, '0');
    const displayStr = `${parsed.day} ${MONTH_NAMES[parsed.month].slice(0, 3)} ${parsed.year}, ${pad(parsed.hours)}:${pad(parsed.minutes)}`;

    const positionClass = dropdownPosition === 'bottom-right' 
        ? 'top-full right-0 mt-2' 
        : 'bottom-0 left-full ml-4';

    return (
        <div ref={containerRef} className="relative w-full">
            {/* The styled trigger button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between bg-white dark:bg-[#1c1b1f] border border-gray-200 dark:border-gray-800 rounded-2xl px-5 py-4 text-left text-[15px] text-gray-900 dark:text-gray-100 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
                <span>{displayStr}</span>
                <Icon name="calendar" size={18} className="text-gray-400" />
            </button>

            {/* The popover calendar */}
            {isOpen && (
                <div className={`absolute z-50 w-[320px] bg-white dark:bg-[#1c1b1f] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl p-5 animate-fade-in ${positionClass}`}>
                    
                    {/* Month/Year Navigation */}
                    <div className="flex items-center justify-between mb-4">
                        <button type="button" onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <Icon name="chevron-left" size={18} />
                        </button>
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100 tracking-wide">
                            {MONTH_NAMES[viewMonth]} {viewYear}
                        </span>
                        <button type="button" onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <Icon name="chevron-right" size={18} />
                        </button>
                    </div>

                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-1">
                        {WEEKDAYS.map(d => (
                            <div key={d} className="text-center text-[11px] font-bold text-gray-400 dark:text-gray-600 py-1">{d}</div>
                        ))}
                    </div>

                    {/* Day Grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {calendarCells.map((day, idx) => (
                            <div key={idx} className="flex items-center justify-center">
                                {day ? (
                                    <button
                                        type="button"
                                        onClick={() => selectDay(day)}
                                        className={`w-9 h-9 rounded-full text-sm font-medium transition-all duration-150
                                            ${isSelected(day)
                                                ? 'bg-indigo-600 text-white shadow-md scale-105'
                                                : isToday(day)
                                                    ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                            }`}
                                    >
                                        {day}
                                    </button>
                                ) : (
                                    <div className="w-9 h-9"></div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200 dark:border-gray-800 my-4"></div>

                    {/* Time Selector */}
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</span>
                        <div className="flex items-center gap-1">
                            <input
                                type="number"
                                min="0" max="23"
                                value={pad(parsed.hours)}
                                onChange={e => setHours(parseInt(e.target.value) || 0)}
                                className="w-14 text-center bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-2 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <span className="text-lg font-bold text-gray-400">:</span>
                            <input
                                type="number"
                                min="0" max="59"
                                value={pad(parsed.minutes)}
                                onChange={e => setMinutes(parseInt(e.target.value) || 0)}
                                className="w-14 text-center bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-2 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between mt-4">
                        <button type="button" onClick={selectToday} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                            Today
                        </button>
                        <button type="button" onClick={() => setIsOpen(false)} className="text-xs font-bold bg-indigo-600 text-white px-4 py-1.5 rounded-full hover:bg-indigo-700 transition-colors">
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomDatePicker;
