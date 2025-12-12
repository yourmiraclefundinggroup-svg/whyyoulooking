import React from 'react';

interface CircularProgressProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CircularProgress({ value, size = 'md', className = '' }: CircularProgressProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16', 
    lg: 'w-20 h-20'
  };

  const strokeWidth = size === 'sm' ? 3 : size === 'md' ? 4 : 5;
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="text-blue-600 transition-all duration-300 ease-in-out"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-gray-900 dark:text-white">{value}%</span>
      </div>
    </div>
  );
}