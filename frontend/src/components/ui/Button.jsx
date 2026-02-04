import React from 'react';

const Button = ({ 
  children, 
  variant = 'default', 
  size = 'default',
  disabled = false,
  className = '',
  onClick,
  onClickCapture,
  type = 'button',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  
  const variants = {
    default: 'bg-brand-500 text-white hover:bg-brand-600',
    destructive: 'bg-red-500 text-white hover:bg-red-600',
    outline: 'border border-surface-200 bg-white hover:bg-surface-50 hover:text-surface-900',
    secondary: 'bg-surface-100 text-surface-900 hover:bg-surface-200',
    ghost: 'hover:bg-surface-100 hover:text-surface-900',
    link: 'text-brand-500 underline-offset-4 hover:underline'
  };
  
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10'
  };
  
  const variantClasses = variants[variant] || variants.default;
  const sizeClasses = sizes[size] || sizes.default;
  
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onClickCapture={onClickCapture}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export { Button };