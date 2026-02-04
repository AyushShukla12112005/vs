import React from 'react';

const Badge = ({ 
  children, 
  variant = 'default', 
  className = '',
  size = 'default'
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full transition-colors';
  
  const variants = {
    default: 'bg-surface-100 text-surface-800 hover:bg-surface-200',
    primary: 'bg-brand-100 text-brand-800 hover:bg-brand-200',
    secondary: 'bg-surface-100 text-surface-600 hover:bg-surface-200',
    success: 'bg-green-100 text-green-800 hover:bg-green-200',
    warning: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    danger: 'bg-red-100 text-red-800 hover:bg-red-200',
    outline: 'border border-surface-200 text-surface-700 hover:bg-surface-50'
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    default: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base'
  };
  
  const variantClasses = variants[variant] || variants.default;
  const sizeClasses = sizes[size] || sizes.default;
  
  return (
    <span className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;