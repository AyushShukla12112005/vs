import React, { createContext, useContext, useState } from 'react';

const SelectContext = createContext();

const Select = ({ children, value, onValueChange, defaultValue }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || defaultValue || '');

  const handleValueChange = (newValue) => {
    setSelectedValue(newValue);
    if (onValueChange) {
      onValueChange(newValue);
    }
    setIsOpen(false);
  };

  const currentValue = value !== undefined ? value : selectedValue;

  return (
    <SelectContext.Provider value={{ 
      isOpen, 
      setIsOpen, 
      value: currentValue, 
      onValueChange: handleValueChange 
    }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

const SelectTrigger = ({ children, className = '', disabled = false, ...props }) => {
  const { isOpen, setIsOpen } = useContext(SelectContext);

  return (
    <button
      type="button"
      onClick={() => !disabled && setIsOpen(!isOpen)}
      disabled={disabled}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-surface-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
      <svg
        className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
};

const SelectValue = ({ placeholder = 'Select...', className = '' }) => {
  const { value } = useContext(SelectContext);
  
  return (
    <span className={`block truncate ${!value ? 'text-surface-500' : ''} ${className}`}>
      {value || placeholder}
    </span>
  );
};

const SelectContent = ({ children, className = '' }) => {
  const { isOpen, setIsOpen } = useContext(SelectContext);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
      <div className={`absolute z-20 top-full mt-1 w-full min-w-[8rem] max-h-60 overflow-hidden rounded-md border border-surface-200 bg-white text-surface-950 shadow-md ${className}`}>
        <div className="p-1 max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-surface-300 scrollbar-track-surface-100">
          {children}
        </div>
      </div>
    </>
  );
};

const SelectItem = ({ children, value, className = '' }) => {
  const { onValueChange, value: selectedValue } = useContext(SelectContext);
  const isSelected = selectedValue === value;

  return (
    <button
      type="button"
      onClick={() => onValueChange(value)}
      className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-surface-100 focus:bg-surface-100 ${
        isSelected ? 'bg-surface-100' : ''
      } ${className}`}
    >
      {isSelected && (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
      {children}
    </button>
  );
};

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };