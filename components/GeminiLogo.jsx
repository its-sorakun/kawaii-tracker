import React from 'react';

const GeminiLogo = ({ className = "w-6 h-6" }) => {
    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            {/* Glowing background blur */}
            <div className="absolute inset-0 bg-blue-500 opacity-40 blur-md rounded-full mix-blend-screen animate-pulse"></div>
            
            {/* The Gemini "sparkle" SVG */}
            <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="relative z-10 w-full h-full drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
            >
                <path 
                    d="M12 2C12 7.52285 16.4772 12 22 12C16.4772 12 12 16.4772 12 22C12 16.4772 7.52285 12 2 12C7.52285 12 12 7.52285 12 2Z" 
                    fill="url(#gemini-gradient)"
                />
                <defs>
                    <linearGradient id="gemini-gradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#4285F4" />
                        <stop offset="33%" stopColor="#9B72CB" />
                        <stop offset="66%" stopColor="#D96570" />
                        <stop offset="100%" stopColor="#F4B400" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
};

export default GeminiLogo;
