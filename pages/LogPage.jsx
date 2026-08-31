import React from 'react';
import LogForm from '../components/LogForm.jsx';

const LogPage = ({ onAddLog }) => {
    return (
        <div className="w-full max-w-7xl mx-auto animate-fade-in font-sans min-h-[calc(100vh-100px)] flex items-center py-6 px-4 md:px-8">
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                
                {/* Left Column: Dramatic Edge-to-Edge Image */}
                <div className="hidden lg:block w-full">
                    <div className="relative w-full aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl group">
                        <img 
                            src="/anime-log.png" 
                            alt="Nutrition Log Illustration" 
                            className="absolute inset-0 w-full h-full object-cover transform transition-transform duration-1000 group-hover:scale-[1.03]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/20 to-transparent pointer-events-none"></div>
                    </div>
                </div>

                {/* Right Column: Sleek Integrated Form */}
                <div className="flex flex-col justify-center w-full max-w-lg mx-auto lg:mx-0 lg:pl-6">
                    <header className="mb-10">
                        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
                            Log Entry.
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-xl font-medium">
                            Track your nutrition and maintain your balance effortlessly.
                        </p>
                    </header>
                    
                    <LogForm onAdd={onAddLog} />
                </div>

            </div>
        </div>
    );
};

export default LogPage;
