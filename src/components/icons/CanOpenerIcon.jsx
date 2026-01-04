import React from 'react';

const CanOpenerIcon = ({ className, ...props }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    {...props}
  >
    <path d="M6 9h12" />
    <path d="M6 15h12" />
    <path d="M3 12h18" />
    <path d="M19 9v6" />
    <path d="M5 9v6" />
    <path d="M12 3v18" />
  </svg>
);

export default CanOpenerIcon;