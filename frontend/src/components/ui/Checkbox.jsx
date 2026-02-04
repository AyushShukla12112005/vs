import React from 'react';

const Checkbox = ({ 
  checked = false, 
  onCheckedChange, 
  disabled = false, 
  className = '',
  ...props 
}) => {
  const handleChange = (e) => {
    if (onCheckedChange) {
      onCheckedChange(e.target.checked);
    }
  };

  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={handleChange}
      disabled={disabled}
      className={`w-4 h-4 text-brand-600 bg-white border-surface-300 rounded focus:ring-brand-500 focus:ring-2 disabled:opacity-50 ${className}`}
      {...props}
    />
  );
};

export { Checkbox };