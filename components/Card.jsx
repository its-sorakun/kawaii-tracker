import React from 'react';

const Card = ({ children, className = "" }) => (
    <div className={`bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 ${className}`}>
        {children}
    </div>
);

export default Card;
