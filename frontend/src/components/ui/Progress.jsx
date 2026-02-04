import React from 'react';

const Progress = ({ value = 0, className = '', max = 100 }) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  return (
    <div className={`w-full bg-surface-200 rounded-full h-2 overflow-hidden ${className}`}>
      <div 
        className="h-full bg-brand-500 transition-all duration-300 ease-out rounded-full"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export default Progress;