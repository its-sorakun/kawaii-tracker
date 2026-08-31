import React from 'react';
import * as LucideIcons from 'lucide-react';

const Icon = ({ name, className = "", size = 24 }) => {
    // Convert kebab-case (e.g. plus-circle) to PascalCase (PlusCircle)
    const iconName = name.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
    const LucideIcon = LucideIcons[iconName];

    if (!LucideIcon) {
        return <span className={`inline-block w-6 h-6 bg-red-500 rounded-full ${className}`}></span>;
    }

    return <LucideIcon className={className} size={size} />;
};

export default Icon;
