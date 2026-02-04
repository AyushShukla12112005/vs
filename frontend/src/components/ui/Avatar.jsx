import React from 'react';

const Avatar = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const AvatarImage = ({ src, alt = '', className = '' }) => {
  if (!src) return null;
  
  return (
    <img 
      src={src} 
      alt={alt}
      className={`aspect-square h-full w-full object-cover ${className}`}
    />
  );
};

const AvatarFallback = ({ children, className = '' }) => {
  return (
    <div className={`flex h-full w-full items-center justify-center rounded-full bg-surface-100 text-surface-600 font-medium ${className}`}>
      {children}
    </div>
  );
};

export { Avatar, AvatarImage, AvatarFallback };