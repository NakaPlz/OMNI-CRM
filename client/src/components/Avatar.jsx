import React from 'react';
import { generateAvatar } from '../utils/avatarUtils';

export default function Avatar({ name, size = 'md', className = '' }) {
    const { initials, color } = generateAvatar(name);

    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-12 h-12 text-sm',
        lg: 'w-16 h-16 text-base'
    };

    return (
        <div
            className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold text-white shadow-lg ${className}`}
            style={{ backgroundColor: color }}
        >
            {initials}
        </div>
    );
}
